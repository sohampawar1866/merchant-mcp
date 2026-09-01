package wallet

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AgentWallet represents an autonomous agent's delegated spending allowance (NPCI UPI Circle / AP2 model).
type AgentWallet struct {
	ID                     uuid.UUID `json:"id"`
	AgentID                string    `json:"agent_id"`
	UserID                 string    `json:"user_id"`
	BalancePaise           int64     `json:"balance_paise"`
	MonthlyAllowancePaise  int64     `json:"monthly_allowance_paise"`
	MonthlySpentPaise      int64     `json:"monthly_spent_paise"`
	PerTransactionCapPaise int       `json:"per_transaction_cap_paise"`
	WhitelistedCategories  []string  `json:"whitelisted_categories"`
	Status                 string    `json:"status"` // active, frozen, revoked
	LastResetAt            time.Time `json:"last_reset_at"`
	CreatedAt              time.Time `json:"created_at"`
}

// AllowanceCheckResult reports whether an autonomous transaction satisfies all trust bounds.
type AllowanceCheckResult struct {
	Allowed    bool   `json:"allowed"`
	ReasonCode string `json:"reason_code"` // WITHIN_ALLOWANCE, EXCEEDS_TXN_CAP, EXCEEDS_MONTHLY_BUDGET, CATEGORY_NOT_WHITELISTED, INSUFFICIENT_FUNDS, WALLET_FROZEN
	Message    string `json:"message"`
}

// GetOrCreateWallet retrieves or seeds an agent wallet with default safety bounds.
func GetOrCreateWallet(ctx context.Context, pool *pgxpool.Pool, agentID string) (*AgentWallet, error) {
	if pool == nil {
		return nil, fmt.Errorf("wallet: database pool is nil")
	}
	if agentID == "" {
		agentID = "default-agent"
	}

	query := `
		SELECT id, agent_id, user_id, balance_paise, monthly_allowance_paise, monthly_spent_paise,
		       per_transaction_cap_paise, whitelisted_categories, status, last_reset_at, created_at
		FROM agent_wallets
		WHERE agent_id = $1;
	`
	var w AgentWallet
	err := pool.QueryRow(ctx, query, agentID).Scan(
		&w.ID, &w.AgentID, &w.UserID, &w.BalancePaise, &w.MonthlyAllowancePaise, &w.MonthlySpentPaise,
		&w.PerTransactionCapPaise, &w.WhitelistedCategories, &w.Status, &w.LastResetAt, &w.CreatedAt,
	)
	if err == pgx.ErrNoRows {
		// Provision default wallet with ₹5,000 allowance and ₹2,000 per txn cap
		newID := uuid.New()
		now := time.Now()
		insertQuery := `
			INSERT INTO agent_wallets (
				id, agent_id, user_id, balance_paise, monthly_allowance_paise, monthly_spent_paise,
				per_transaction_cap_paise, whitelisted_categories, status, last_reset_at, created_at
			) VALUES (
				$1, $2, 'primary_user', 500000, 1500000, 0,
				200000, ARRAY['Audio', 'Desk Accessories', 'Smart Home', 'Wearables', 'general'], 'active', $3, $3
			) RETURNING id, agent_id, user_id, balance_paise, monthly_allowance_paise, monthly_spent_paise,
			            per_transaction_cap_paise, whitelisted_categories, status, last_reset_at, created_at;
		`
		err = pool.QueryRow(ctx, insertQuery, newID, agentID, now).Scan(
			&w.ID, &w.AgentID, &w.UserID, &w.BalancePaise, &w.MonthlyAllowancePaise, &w.MonthlySpentPaise,
			&w.PerTransactionCapPaise, &w.WhitelistedCategories, &w.Status, &w.LastResetAt, &w.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("wallet: failed to create wallet: %w", err)
		}
	} else if err != nil {
		return nil, err
	}

	return &w, nil
}

// CheckAllowance verifies whether a proposed purchase amount in paise satisfies the agent's delegated spending mandate.
func (w *AgentWallet) CheckAllowance(amountPaise int, categories []string) AllowanceCheckResult {
	if w.Status != "active" {
		return AllowanceCheckResult{
			Allowed:    false,
			ReasonCode: "WALLET_FROZEN",
			Message:    "Agent wallet is currently frozen or revoked by account owner.",
		}
	}

	if int64(amountPaise) > w.BalancePaise {
		return AllowanceCheckResult{
			Allowed:    false,
			ReasonCode: "INSUFFICIENT_FUNDS",
			Message:    fmt.Sprintf("Insufficient wallet balance (required: ₹%.2f, available: ₹%.2f).", float64(amountPaise)/100.0, float64(w.BalancePaise)/100.0),
		}
	}

	if amountPaise > w.PerTransactionCapPaise {
		return AllowanceCheckResult{
			Allowed:    false,
			ReasonCode: "EXCEEDS_TXN_CAP",
			Message:    fmt.Sprintf("Transaction amount (₹%.2f) exceeds single-order autonomous cap of ₹%.2f. Step-up 2FA required.", float64(amountPaise)/100.0, float64(w.PerTransactionCapPaise)/100.0),
		}
	}

	if w.MonthlySpentPaise+int64(amountPaise) > w.MonthlyAllowancePaise {
		return AllowanceCheckResult{
			Allowed:    false,
			ReasonCode: "EXCEEDS_MONTHLY_BUDGET",
			Message:    "Monthly autonomous spending allowance exhausted. Step-up 2FA required.",
		}
	}

	// Verify category whitelist if categories provided
	if len(categories) > 0 && len(w.WhitelistedCategories) > 0 {
		for _, cat := range categories {
			matched := false
			for _, allowedCat := range w.WhitelistedCategories {
				if strings.EqualFold(cat, allowedCat) || allowedCat == "*" || allowedCat == "general" {
					matched = true
					break
				}
			}
			if !matched {
				return AllowanceCheckResult{
					Allowed:    false,
					ReasonCode: "CATEGORY_NOT_WHITELISTED",
					Message:    fmt.Sprintf("Category '%s' is not in the delegated auto-approval whitelist.", cat),
				}
			}
		}
	}

	return AllowanceCheckResult{
		Allowed:    true,
		ReasonCode: "WITHIN_ALLOWANCE",
		Message:    "Autonomous payment authorized within delegated spending bounds.",
	}
}

// DebitWalletAtomic executes an ACID row-locked debit against the agent wallet and appends a double-entry ledger record.
func DebitWalletAtomic(ctx context.Context, pool *pgxpool.Pool, agentID string, amountPaise int, orderID string, cartID *uuid.UUID, description string) (*AgentWallet, error) {
	if pool == nil {
		return nil, fmt.Errorf("wallet: database pool is nil")
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// 1. Lock wallet row with SELECT FOR UPDATE to prevent race conditions
	queryLock := `
		SELECT id, agent_id, user_id, balance_paise, monthly_allowance_paise, monthly_spent_paise,
		       per_transaction_cap_paise, whitelisted_categories, status, last_reset_at, created_at
		FROM agent_wallets
		WHERE agent_id = $1
		FOR UPDATE;
	`
	var w AgentWallet
	err = tx.QueryRow(ctx, queryLock, agentID).Scan(
		&w.ID, &w.AgentID, &w.UserID, &w.BalancePaise, &w.MonthlyAllowancePaise, &w.MonthlySpentPaise,
		&w.PerTransactionCapPaise, &w.WhitelistedCategories, &w.Status, &w.LastResetAt, &w.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("wallet: lock failed: %w", err)
	}

	// 2. Enforce balance
	if w.BalancePaise < int64(amountPaise) {
		return nil, fmt.Errorf("wallet: insufficient balance")
	}

	newBalance := w.BalancePaise - int64(amountPaise)
	newMonthlySpent := w.MonthlySpentPaise + int64(amountPaise)

	// 3. Update wallet balances
	updateWalletQuery := `
		UPDATE agent_wallets
		SET balance_paise = $1, monthly_spent_paise = $2
		WHERE id = $3;
	`
	_, err = tx.Exec(ctx, updateWalletQuery, newBalance, newMonthlySpent, w.ID)
	if err != nil {
		return nil, err
	}

	// 4. Insert double-entry ledger entry
	insertLedgerQuery := `
		INSERT INTO agent_wallet_ledger (
			id, wallet_id, order_id, cart_id, entry_type, amount_paise, balance_after_paise, description, created_at
		) VALUES (
			gen_random_uuid(), $1, $2, $3, 'DEBIT_PURCHASE', $4, $5, $6, NOW()
		);
	`
	_, err = tx.Exec(ctx, insertLedgerQuery, w.ID, orderID, cartID, amountPaise, newBalance, description)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	w.BalancePaise = newBalance
	w.MonthlySpentPaise = newMonthlySpent
	return &w, nil
}
