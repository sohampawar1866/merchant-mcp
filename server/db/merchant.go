package db

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Merchant represents a tenant registered on the platform.
type Merchant struct {
	ID                    string         `json:"id"`
	Name                  string         `json:"name"`
	RazorpayKeyID         string         `json:"razorpay_key_id"`
	RazorpayKeySecret     string         `json:"razorpay_key_secret,omitempty"` // Decrypted in-memory only
	RazorpayWebhookSecret string         `json:"razorpay_webhook_secret,omitempty"` // Decrypted in-memory only
	Status                string         `json:"status"` // "active" | "suspended"
	FeatureOverrides      map[string]any `json:"feature_overrides"`
	APIKey                string         `json:"api_key"`
	CreatedAt             time.Time      `json:"created_at"`
}

// MerchantSummary is a safe public representation without credentials.
type MerchantSummary struct {
	ID               string         `json:"id"`
	Name             string         `json:"name"`
	RazorpayKeyID    string         `json:"razorpay_key_id"`
	Status           string         `json:"status"`
	FeatureOverrides map[string]any `json:"feature_overrides"`
	APIKey           string         `json:"api_key"`
	CreatedAt        time.Time      `json:"created_at"`
}

// GetMerchantByAPIKey retrieves a merchant and decrypts their credentials using ENCRYPTION_PASSPHRASE.
func GetMerchantByAPIKey(ctx context.Context, pool *pgxpool.Pool, apiKey, passphrase string) (*Merchant, error) {
	if pool == nil {
		return nil, fmt.Errorf("db: database pool is nil")
	}

	query := `
		SELECT 
			id, 
			name, 
			razorpay_key_id, 
			COALESCE(pgp_sym_decrypt(razorpay_key_secret, $1), ''), 
			COALESCE(pgp_sym_decrypt(razorpay_webhook_secret, $1), ''), 
			status, 
			COALESCE(feature_overrides, '{}'::jsonb), 
			api_key, 
			created_at
		FROM merchants
		WHERE api_key = $2;
	`

	var m Merchant
	var overridesBytes []byte

	err := pool.QueryRow(ctx, query, passphrase, apiKey).Scan(
		&m.ID,
		&m.Name,
		&m.RazorpayKeyID,
		&m.RazorpayKeySecret,
		&m.RazorpayWebhookSecret,
		&m.Status,
		&overridesBytes,
		&m.APIKey,
		&m.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if len(overridesBytes) > 0 {
		_ = json.Unmarshal(overridesBytes, &m.FeatureOverrides)
	}
	if m.FeatureOverrides == nil {
		m.FeatureOverrides = make(map[string]any)
	}

	return &m, nil
}

// GetMerchantByID retrieves a merchant by UUID and decrypts their credentials.
func GetMerchantByID(ctx context.Context, pool *pgxpool.Pool, id, passphrase string) (*Merchant, error) {
	if pool == nil {
		return nil, fmt.Errorf("db: database pool is nil")
	}

	query := `
		SELECT 
			id, 
			name, 
			razorpay_key_id, 
			COALESCE(pgp_sym_decrypt(razorpay_key_secret, $1), ''), 
			COALESCE(pgp_sym_decrypt(razorpay_webhook_secret, $1), ''), 
			status, 
			COALESCE(feature_overrides, '{}'::jsonb), 
			api_key, 
			created_at
		FROM merchants
		WHERE id::text = $2;
	`

	var m Merchant
	var overridesBytes []byte

	err := pool.QueryRow(ctx, query, passphrase, id).Scan(
		&m.ID,
		&m.Name,
		&m.RazorpayKeyID,
		&m.RazorpayKeySecret,
		&m.RazorpayWebhookSecret,
		&m.Status,
		&overridesBytes,
		&m.APIKey,
		&m.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if len(overridesBytes) > 0 {
		_ = json.Unmarshal(overridesBytes, &m.FeatureOverrides)
	}
	if m.FeatureOverrides == nil {
		m.FeatureOverrides = make(map[string]any)
	}

	return &m, nil
}

// CreateMerchant inserts a new merchant with encrypted Razorpay secrets.
func CreateMerchant(ctx context.Context, pool *pgxpool.Pool, m *Merchant, passphrase string) error {
	if pool == nil {
		return fmt.Errorf("db: database pool is nil")
	}

	overridesJSON, err := json.Marshal(m.FeatureOverrides)
	if err != nil {
		overridesJSON = []byte("{}")
	}

	query := `
		INSERT INTO merchants (
			id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, feature_overrides, api_key, created_at
		) VALUES (
			COALESCE(NULLIF($1, '')::uuid, gen_random_uuid()),
			$2,
			$3,
			pgp_sym_encrypt($4, $5),
			pgp_sym_encrypt($6, $5),
			COALESCE(NULLIF($7, ''), 'active'),
			$8::jsonb,
			$9,
			NOW()
		)
		RETURNING id, created_at;
	`

	return pool.QueryRow(ctx, query,
		m.ID,
		m.Name,
		m.RazorpayKeyID,
		m.RazorpayKeySecret,
		passphrase,
		m.RazorpayWebhookSecret,
		m.Status,
		string(overridesJSON),
		m.APIKey,
	).Scan(&m.ID, &m.CreatedAt)
}

// UpdateMerchantStatus updates status ('active' | 'suspended') - acts as platform kill switch.
func UpdateMerchantStatus(ctx context.Context, pool *pgxpool.Pool, merchantID, status string) error {
	if pool == nil {
		return fmt.Errorf("db: database pool is nil")
	}

	res, err := pool.Exec(ctx, `UPDATE merchants SET status = $1 WHERE id::text = $2;`, status, merchantID)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

// UpdateMerchantFeatureOverrides updates custom policy flags for a merchant.
func UpdateMerchantFeatureOverrides(ctx context.Context, pool *pgxpool.Pool, merchantID string, overrides map[string]any) error {
	if pool == nil {
		return fmt.Errorf("db: database pool is nil")
	}

	overridesJSON, err := json.Marshal(overrides)
	if err != nil {
		overridesJSON = []byte("{}")
	}

	_, err = pool.Exec(ctx, `UPDATE merchants SET feature_overrides = $1::jsonb WHERE id::text = $2;`, string(overridesJSON), merchantID)
	return err
}

// ListMerchants returns safe metadata summaries for all registered merchants.
func ListMerchants(ctx context.Context, pool *pgxpool.Pool) ([]MerchantSummary, error) {
	if pool == nil {
		return []MerchantSummary{}, nil
	}

	query := `
		SELECT id, name, razorpay_key_id, status, COALESCE(feature_overrides, '{}'::jsonb), api_key, created_at
		FROM merchants
		ORDER BY created_at ASC;
	`

	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	merchants := make([]MerchantSummary, 0)
	for rows.Next() {
		var m MerchantSummary
		var overridesBytes []byte

		if err := rows.Scan(&m.ID, &m.Name, &m.RazorpayKeyID, &m.Status, &overridesBytes, &m.APIKey, &m.CreatedAt); err != nil {
			return nil, err
		}

		if len(overridesBytes) > 0 {
			_ = json.Unmarshal(overridesBytes, &m.FeatureOverrides)
		}
		if m.FeatureOverrides == nil {
			m.FeatureOverrides = make(map[string]any)
		}

		merchants = append(merchants, m)
	}

	return merchants, nil
}
