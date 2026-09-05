package tools

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"github.com/sohampawar1866/merchant-mcp/server/audit"
	"github.com/sohampawar1866/merchant-mcp/server/config"
	"github.com/sohampawar1866/merchant-mcp/server/wallet"
)

// RegisterWalletTools registers autonomous agent wallet MCP tools.
func RegisterWalletTools(
	s *server.MCPServer,
	pool *pgxpool.Pool,
	auditLogger *audit.Logger,
	cfg *config.Config,
) {
	// 1. Tool: get_agent_wallet_balance
	walletBalanceTool := mcp.NewTool(
		"get_agent_wallet_balance",
		mcp.WithDescription("Inspects the autonomous AI buyer's delegated wallet balance, per-transaction spending caps, remaining monthly allowance, and category whitelists (NPCI UPI Circle / AP2 model)."),
		mcp.WithString("agent_id", mcp.Description("Optional unique identifier of the AI agent (default: 'claude-buyer-01')")),
	)
	s.AddTool(walletBalanceTool, handleGetAgentWalletBalance(pool, auditLogger, cfg))

	// 2. Tool: pay_with_agent_wallet
	payWalletTool := mcp.NewTool(
		"pay_with_agent_wallet",
		mcp.WithDescription("Executes autonomous zero-click payment directly from the AI buyer's delegated wallet (NPCI UPI Circle / AP2 model). Instantly settles an existing order (e.g. 'plink_...' or UUID) or a cart without human 2FA within pre-authorized spending caps."),
		mcp.WithString("order_id", mcp.Description("Optional Razorpay order ID or payment link ID (e.g. 'plink_TYEZv2xYoq1Mkn') or order UUID to settle")),
		mcp.WithString("cart_id", mcp.Description("Optional Cart UUID to settle directly")),
		mcp.WithString("agent_id", mcp.Description("Optional AI agent ID (default: 'claude-buyer-01')")),
		mcp.WithString("idempotency_key", mcp.Description("Optional idempotency key to prevent double debit")),
	)
	s.AddTool(payWalletTool, handlePayWithAgentWallet(pool, auditLogger, cfg))
}

func handleGetAgentWalletBalance(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		agentID := request.GetString("agent_id", "claude-buyer-01")

		w, err := wallet.GetOrCreateWallet(ctx, pool, agentID)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to query agent wallet: %v", err)), nil
		}

		resp := map[string]any{
			"agent_id":                  w.AgentID,
			"status":                    w.Status,
			"balance_paise":             w.BalancePaise,
			"balance_inr":               fmt.Sprintf("₹%.2f", float64(w.BalancePaise)/100.0),
			"per_transaction_cap_paise": w.PerTransactionCapPaise,
			"per_transaction_cap_inr":   fmt.Sprintf("₹%.2f", float64(w.PerTransactionCapPaise)/100.0),
			"monthly_allowance_paise":   w.MonthlyAllowancePaise,
			"monthly_spent_paise":       w.MonthlySpentPaise,
			"monthly_remaining_inr":     fmt.Sprintf("₹%.2f", float64(w.MonthlyAllowancePaise-w.MonthlySpentPaise)/100.0),
			"whitelisted_categories":    w.WhitelistedCategories,
			"delegated_protocol":        "NPCI UPI Circle / AP2 Delegated Mandate",
		}

		respBytes, _ := json.Marshal(resp)
		return mcp.NewToolResultText(string(respBytes)), nil
	}
}

func handlePayWithAgentWallet(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		start := time.Now()
		correlationID := uuid.New()

		orderID := request.GetString("order_id", "")
		cartIDStr := request.GetString("cart_id", "")
		agentID := request.GetString("agent_id", "claude-buyer-01")

		if orderID == "" && cartIDStr == "" {
			return mcp.NewToolResultError("must provide either 'order_id' or 'cart_id' to execute autonomous wallet payment"), nil
		}

		// Path A: Settle existing order
		if orderID != "" {
			var orderUUID uuid.UUID
			var merchantID uuid.UUID
			var agreedPrice int
			var status string
			var prodID *uuid.UUID
			var prodName, prodCategory, merchantName string

			query := `
				SELECT o.id, o.merchant_id, o.agreed_price, o.status, o.product_id, 
				       COALESCE(p.name, 'Store Product'), COALESCE(p.category, 'general'), COALESCE(m.name, 'Merchant Store')
				FROM orders o
				LEFT JOIN products p ON o.product_id = p.id
				LEFT JOIN merchants m ON o.merchant_id = m.id
				WHERE o.razorpay_order_id = $1 OR o.id::text = $1;
			`
			err := pool.QueryRow(ctx, query, orderID).Scan(
				&orderUUID, &merchantID, &agreedPrice, &status, &prodID, &prodName, &prodCategory, &merchantName,
			)
			if err != nil {
				return mcp.NewToolResultError(fmt.Sprintf("order '%s' not found in database", orderID)), nil
			}

			if status == "paid" {
				resp := map[string]any{
					"order_id":    orderID,
					"status":      "paid",
					"message":     "Order is already paid and settled.",
					"receipt_url": fmt.Sprintf("http://localhost:3000/order/success?order_id=%s", orderUUID),
				}
				respBytes, _ := json.Marshal(resp)
				return mcp.NewToolResultText(string(respBytes)), nil
			}

			w, err := wallet.GetOrCreateWallet(ctx, pool, agentID)
			if err != nil {
				return mcp.NewToolResultError(fmt.Sprintf("failed to load agent wallet: %v", err)), nil
			}

			check := w.CheckAllowance(agreedPrice, []string{prodCategory})
			if !check.Allowed {
				return mcp.NewToolResultError(fmt.Sprintf("Autonomous wallet payment denied by delegated guardrails: %s - %s", check.ReasonCode, check.Message)), nil
			}

			desc := fmt.Sprintf("Autonomous purchase: %s on %s (Order %s)", prodName, merchantName, orderID)
			updatedWallet, debitErr := wallet.DebitWalletAtomic(ctx, pool, agentID, agreedPrice, orderID, nil, desc)
			if debitErr != nil {
				return mcp.NewToolResultError(fmt.Sprintf("wallet debit failed: %v", debitErr)), nil
			}

			_, err = pool.Exec(ctx, `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1;`, orderUUID)
			if err != nil {
				return mcp.NewToolResultError(fmt.Sprintf("failed to update order status: %v", err)), nil
			}

			resp := map[string]any{
				"order_id":                    orderID,
				"status":                      "paid",
				"settlement_type":             "autonomous_wallet_zero_click",
				"delegated_protocol":          "NPCI UPI Circle / AP2 Delegated Mandate",
				"amount_paid_paise":           agreedPrice,
				"amount_paid_inr":             fmt.Sprintf("₹%.2f", float64(agreedPrice)/100.0),
				"remaining_wallet_balance_inr": fmt.Sprintf("₹%.2f", float64(updatedWallet.BalancePaise)/100.0),
				"product_name":                prodName,
				"merchant_name":               merchantName,
				"receipt_url":                 fmt.Sprintf("http://localhost:3000/order/success?order_id=%s", orderUUID),
				"message":                     "Payment captured autonomously via pre-authorized agent allowance. Zero human action required.",
			}

			_ = auditLogger.Log(ctx, audit.Entry{
				MerchantID:    merchantID.String(),
				CorrelationID: correlationID,
				ToolName:      "pay_with_agent_wallet",
				Input: map[string]any{
					"order_id": orderID,
					"agent_id": agentID,
				},
				Decision:   "approved",
				ReasonCode: "AUTONOMOUS_WALLET_DEBIT_CAPTURED",
				Output:     resp,
				DurationMs: time.Since(start).Milliseconds(),
			})

			respBytes, _ := json.Marshal(resp)
			return mcp.NewToolResultText(string(respBytes)), nil
		}

		// Path B: Cart settlement
		cUUID, err := uuid.Parse(cartIDStr)
		if err != nil {
			return mcp.NewToolResultError("invalid cart_id format"), nil
		}

		var merchantID uuid.UUID
		var totalPaise int
		var cartStatus string
		var merchantName string
		err = pool.QueryRow(ctx, `
			SELECT c.merchant_id, c.total_paise, c.status, COALESCE(m.name, 'Merchant Store')
			FROM carts c
			JOIN merchants m ON c.merchant_id = m.id
			WHERE c.id = $1;
		`, cUUID).Scan(&merchantID, &totalPaise, &cartStatus, &merchantName)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("cart '%s' not found: %v", cartIDStr, err)), nil
		}

		if cartStatus == "checked_out" {
			return mcp.NewToolResultError("cart has already been checked out"), nil
		}

		rows, err := pool.Query(ctx, `
			SELECT ci.product_id, COALESCE(p.name, 'Item'), COALESCE(p.category, 'general')
			FROM cart_items ci
			LEFT JOIN products p ON ci.product_id = p.id
			WHERE ci.cart_id = $1;
		`, cUUID)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to read cart items: %v", err)), nil
		}
		defer rows.Close()

		var firstProdID uuid.UUID
		var firstProdName string
		categories := make([]string, 0)
		itemCount := 0
		for rows.Next() {
			var pID uuid.UUID
			var pName, pCat string
			if err := rows.Scan(&pID, &pName, &pCat); err == nil {
				if itemCount == 0 {
					firstProdID = pID
					firstProdName = pName
				}
				categories = append(categories, pCat)
				itemCount++
			}
		}

		if itemCount == 0 {
			return mcp.NewToolResultError("cart is empty"), nil
		}

		w, err := wallet.GetOrCreateWallet(ctx, pool, agentID)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to load agent wallet: %v", err)), nil
		}

		check := w.CheckAllowance(totalPaise, categories)
		if !check.Allowed {
			return mcp.NewToolResultError(fmt.Sprintf("Autonomous wallet payment denied by delegated guardrails: %s - %s", check.ReasonCode, check.Message)), nil
		}

		autoOrderID := fmt.Sprintf("ord_auto_%s", uuid.New().String()[:12])
		desc := fmt.Sprintf("Autonomous purchase (%d items) on %s", itemCount, merchantName)
		updatedWallet, debitErr := wallet.DebitWalletAtomic(ctx, pool, agentID, totalPaise, autoOrderID, &cUUID, desc)
		if debitErr != nil {
			return mcp.NewToolResultError(fmt.Sprintf("wallet debit failed: %v", debitErr)), nil
		}

		var orderUUID uuid.UUID
		idempKey := request.GetString("idempotency_key", fmt.Sprintf("idemp_%s", autoOrderID))
		err = pool.QueryRow(ctx, `
			INSERT INTO orders (
				merchant_id, razorpay_order_id, product_id, agreed_price, status, idempotency_key, payment_link, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, 'paid', $5, 'http://localhost:3000/order/success?order_id=' || $2, NOW(), NOW()
			) RETURNING id;
		`, merchantID, autoOrderID, firstProdID, totalPaise, idempKey).Scan(&orderUUID)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to record order: %v", err)), nil
		}

		_, _ = pool.Exec(ctx, `UPDATE carts SET status = 'checked_out', idempotency_key = $1, updated_at = NOW() WHERE id = $2;`, idempKey, cUUID)

		resp := map[string]any{
			"order_id":                    autoOrderID,
			"status":                      "paid",
			"settlement_type":             "autonomous_wallet_zero_click",
			"delegated_protocol":          "NPCI UPI Circle / AP2 Delegated Mandate",
			"cart_id":                     cartIDStr,
			"total_paise":                 totalPaise,
			"amount_paid_inr":             fmt.Sprintf("₹%.2f", float64(totalPaise)/100.0),
			"item_count":                  itemCount,
			"remaining_wallet_balance_inr": fmt.Sprintf("₹%.2f", float64(updatedWallet.BalancePaise)/100.0),
			"product_name":                firstProdName,
			"merchant_name":               merchantName,
			"receipt_url":                 fmt.Sprintf("http://localhost:3000/order/success?order_id=%s", orderUUID),
			"message":                     "Payment captured autonomously via pre-authorized agent allowance. Zero human action required.",
		}

		_ = auditLogger.Log(ctx, audit.Entry{
			MerchantID:    merchantID.String(),
			CorrelationID: correlationID,
			ToolName:      "pay_with_agent_wallet",
			Input: map[string]any{
				"cart_id":  cartIDStr,
				"agent_id": agentID,
			},
			Decision:   "approved",
			ReasonCode: "AUTONOMOUS_WALLET_DEBIT_CAPTURED",
			Output:     resp,
			DurationMs: time.Since(start).Milliseconds(),
		})

		respBytes, _ := json.Marshal(resp)
		return mcp.NewToolResultText(string(respBytes)), nil
	}
}
