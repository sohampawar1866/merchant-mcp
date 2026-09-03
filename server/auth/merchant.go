package auth

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/sohampawar1866/merchant-mcp/server/db"
)

type contextKey string

const MerchantCtxKey contextKey = "merchant"

// ResolveMerchant extracts the API key from MCP call arguments or environment,
// retrieves the decrypted merchant record, and enforces the platform kill switch.
// Returns an error if no API key is provided or the key is invalid.
func ResolveMerchant(ctx context.Context, pool *pgxpool.Pool, request mcp.CallToolRequest, passphrase string) (*db.Merchant, error) {
	apiKey := request.GetString("merchant_api_key", "")
	if apiKey == "" {
		apiKey = request.GetString("api_key", "")
	}
	if apiKey == "" {
		apiKey = os.Getenv("MERCHANT_API_KEY")
	}
	if apiKey == "" {
		return nil, fmt.Errorf("MISSING_API_KEY: no merchant_api_key provided - set the 'merchant_api_key' argument or MERCHANT_API_KEY environment variable")
	}

	if pool == nil {
		return nil, fmt.Errorf("DATABASE_UNAVAILABLE: database connection is not configured - cannot authenticate merchant")
	}

	merchant, err := db.GetMerchantByAPIKey(ctx, pool, apiKey, passphrase)
	if err != nil {
		return nil, fmt.Errorf("INVALID_API_KEY: merchant api_key '%s' not found", apiKey)
	}

	// -------------------------------------------------------------
	// CENTRAL PLATFORM KILL SWITCH: Short-circuit suspended tenants
	// -------------------------------------------------------------
	if merchant.Status == "suspended" {
		return nil, fmt.Errorf("MERCHANT_SUSPENDED: store '%s' (%s) is suspended by platform administration", merchant.Name, merchant.ID)
	}

	return merchant, nil
}
