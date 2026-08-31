package tools

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"github.com/sohampawar1866/merchant-mcp/server/audit"
	"github.com/sohampawar1866/merchant-mcp/server/auth"
	"github.com/sohampawar1866/merchant-mcp/server/config"
)

// PublicProduct defines the public consumer representation of a product.
// Crucially, internal fields such as floor_price and tags_source are NEVER included.
type PublicProduct struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description,omitempty"`
	Category    string         `json:"category,omitempty"`
	Tags        []string       `json:"tags"`
	Price       int            `json:"price"` // Maps to base_price in paise
	Stock       int            `json:"stock"`
	Attributes  map[string]any `json:"attributes,omitempty"`
}

// SearchCatalogResponse represents the output payload for search_catalog.
type SearchCatalogResponse struct {
	Results []PublicProduct `json:"results"`
	Total   int             `json:"total"`
}

// RegisterCatalogTools registers search_catalog and get_product_details on the MCP server.
func RegisterCatalogTools(s *server.MCPServer, pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) {
	// 1. Tool: search_catalog
	searchTool := mcp.NewTool(
		"search_catalog",
		mcp.WithDescription("Search products in the merchant catalog by keyword, tags, category, or maximum price. Scoped to the authenticated merchant store."),
		mcp.WithString("query",
			mcp.Description("Search terms to match against product name, description, and tags (e.g. 'earbuds with good bass', 'wireless')"),
		),
		mcp.WithString("category",
			mcp.Description("Optional category filter (e.g. 'Audio', 'Wearables', 'Desk Accessories', 'Smart Home')"),
		),
		mcp.WithNumber("max_price",
			mcp.Description("Optional maximum price ceiling in INR paise (e.g. 200000 for ₹2,000.00)"),
		),
		mcp.WithNumber("limit",
			mcp.Description("Maximum number of products to return (default 10, max 50)"),
		),
		mcp.WithString("merchant_api_key",
			mcp.Description("Optional merchant API key (defaults to active store or environment key)"),
		),
	)
	s.AddTool(searchTool, handleSearchCatalog(pool, auditLogger, cfg))

	// 2. Tool: get_product_details
	detailsTool := mcp.NewTool(
		"get_product_details",
		mcp.WithDescription("Fetch complete product details and specifications by product UUID. Scoped to the authenticated merchant store."),
		mcp.WithString("product_id",
			mcp.Required(),
			mcp.Description("The UUID of the product to retrieve"),
		),
		mcp.WithString("merchant_api_key",
			mcp.Description("Optional merchant API key"),
		),
	)
	s.AddTool(detailsTool, handleGetProductDetails(pool, auditLogger, cfg))
}

func handleSearchCatalog(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		start := time.Now()
		correlationID := uuid.New()

		// Central Merchant Authentication & Platform Kill Switch check
		passphrase := ""
		if cfg != nil {
			passphrase = cfg.EncryptionPassphrase
		}
		merchant, err := auth.ResolveMerchant(ctx, pool, request, passphrase)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		query := request.GetString("query", "")
		category := request.GetString("category", "")
		maxPrice := request.GetInt("max_price", 0)
		limit := request.GetInt("limit", 10)
		if limit <= 0 {
			limit = 10
		} else if limit > 50 {
			limit = 50
		}

		inputArgs := map[string]any{
			"merchant_id": merchant.ID,
			"query":       query,
			"category":    category,
			"max_price":   maxPrice,
			"limit":       limit,
		}

		if pool == nil {
			resp := SearchCatalogResponse{Results: []PublicProduct{}, Total: 0}
			respBytes, _ := json.Marshal(resp)
			return mcp.NewToolResultText(string(respBytes)), nil
		}

		// Parameterized full-text, substring ILIKE, and tags array search strictly scoped by merchant_id
		sqlQuery := `
			SELECT id, name, description, category, tags, base_price, stock, attributes
			FROM products
			WHERE merchant_id = $1
			AND ($2 = '' OR (
				to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', $2)
				OR name ILIKE '%' || $2 || '%'
				OR description ILIKE '%' || $2 || '%'
				OR $2 = ANY(tags)
			))
			AND ($3 = '' OR LOWER(category) = LOWER($3))
			AND ($4 = 0 OR base_price <= $4)
			ORDER BY base_price ASC
			LIMIT $5;
		`

		rows, err := pool.Query(ctx, sqlQuery, merchant.ID, query, category, maxPrice, limit)
		if err != nil {
			errOutput := fmt.Sprintf("database query failed: %v", err)
			_ = auditLogger.Log(ctx, audit.Entry{
				MerchantID:    merchant.ID,
				CorrelationID: correlationID,
				ToolName:      "search_catalog",
				Input:         inputArgs,
				Decision:      "n/a",
				ErrorMessage:  errOutput,
				DurationMs:    time.Since(start).Milliseconds(),
			})
			return mcp.NewToolResultError(errOutput), nil
		}
		defer rows.Close()

		results := make([]PublicProduct, 0)
		for rows.Next() {
			var p PublicProduct
			var attrBytes []byte
			var tags []string

			err := rows.Scan(
				&p.ID,
				&p.Name,
				&p.Description,
				&p.Category,
				&tags,
				&p.Price,
				&p.Stock,
				&attrBytes,
			)
			if err != nil {
				return mcp.NewToolResultError(fmt.Sprintf("failed to scan product: %v", err)), nil
			}

			p.Tags = tags
			if len(attrBytes) > 0 {
				_ = json.Unmarshal(attrBytes, &p.Attributes)
			}
			results = append(results, p)
		}

		response := SearchCatalogResponse{
			Results: results,
			Total:   len(results),
		}

		respBytes, err := json.Marshal(response)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to encode search response: %v", err)), nil
		}

		_ = auditLogger.Log(ctx, audit.Entry{
			MerchantID:    merchant.ID,
			CorrelationID: correlationID,
			ToolName:      "search_catalog",
			Input:         inputArgs,
			Decision:      "n/a",
			Output:        response,
			DurationMs:    time.Since(start).Milliseconds(),
		})

		return mcp.NewToolResultText(string(respBytes)), nil
	}
}

func handleGetProductDetails(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		start := time.Now()
		correlationID := uuid.New()

		// Central Merchant Authentication & Platform Kill Switch check
		passphrase := ""
		if cfg != nil {
			passphrase = cfg.EncryptionPassphrase
		}
		merchant, err := auth.ResolveMerchant(ctx, pool, request, passphrase)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		productID, err := request.RequireString("product_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: product_id"), nil
		}

		inputArgs := map[string]any{
			"merchant_id": merchant.ID,
			"product_id":  productID,
		}

		if pool == nil {
			return mcp.NewToolResultError("database connection unavailable"), nil
		}

		sqlQuery := `
			SELECT id, name, description, category, tags, base_price, stock, attributes
			FROM products
			WHERE id = $1 AND merchant_id = $2;
		`

		var p PublicProduct
		var attrBytes []byte
		var tags []string

		err = pool.QueryRow(ctx, sqlQuery, productID, merchant.ID).Scan(
			&p.ID,
			&p.Name,
			&p.Description,
			&p.Category,
			&tags,
			&p.Price,
			&p.Stock,
			&attrBytes,
		)
		if err != nil {
			if err == pgx.ErrNoRows {
				_ = auditLogger.Log(ctx, audit.Entry{
					MerchantID:    merchant.ID,
					CorrelationID: correlationID,
					ToolName:      "get_product_details",
					Input:         inputArgs,
					Decision:      "n/a",
					ReasonCode:    "PRODUCT_NOT_FOUND",
					DurationMs:    time.Since(start).Milliseconds(),
				})
				return mcp.NewToolResultError(fmt.Sprintf("product not found with id: %s in store: %s", productID, merchant.Name)), nil
			}

			errOutput := fmt.Sprintf("database query failed: %v", err)
			_ = auditLogger.Log(ctx, audit.Entry{
				MerchantID:    merchant.ID,
				CorrelationID: correlationID,
				ToolName:      "get_product_details",
				Input:         inputArgs,
				Decision:      "n/a",
				ErrorMessage:  errOutput,
				DurationMs:    time.Since(start).Milliseconds(),
			})
			return mcp.NewToolResultError(errOutput), nil
		}

		p.Tags = tags
		if len(attrBytes) > 0 {
			_ = json.Unmarshal(attrBytes, &p.Attributes)
		}

		respBytes, err := json.Marshal(p)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to encode product response: %v", err)), nil
		}

		_ = auditLogger.Log(ctx, audit.Entry{
			MerchantID:    merchant.ID,
			CorrelationID: correlationID,
			ToolName:      "get_product_details",
			Input:         inputArgs,
			Decision:      "n/a",
			Output:        p,
			DurationMs:    time.Since(start).Milliseconds(),
		})

		return mcp.NewToolResultText(string(respBytes)), nil
	}
}
