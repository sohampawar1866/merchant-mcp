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
	"github.com/sohampawar1866/merchant-mcp/server/auth"
	"github.com/sohampawar1866/merchant-mcp/server/config"
)

// BundledProductDTO is a public product representation inside a bundle (Zero Margin Leakage).
type BundledProductDTO struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Category  string    `json:"category"`
	BasePrice int       `json:"base_price"` // in paise
}

// UpsellBundleResponse is the structured response returned by get_upsell_bundle.
type UpsellBundleResponse struct {
	BundleName               string              `json:"bundle_name"`
	UpsellPitch              string              `json:"upsell_pitch"`
	Items                    []BundledProductDTO `json:"items"`
	IndividualTotalPaise     int                 `json:"individual_total_paise"`
	BundledSpecialPricePaise int                 `json:"bundled_special_price_paise"`
	InstantSavingsPaise      int                 `json:"instant_savings_paise"`
	DiscountPercent          int                 `json:"discount_percent"`
	Status                   string              `json:"status"` // "available", "no_compatible_upsell"
	CampaignID               *uuid.UUID          `json:"campaign_id,omitempty"`
	CampaignName             string              `json:"campaign_name,omitempty"`
}

// RegisterBundleTools registers the get_upsell_bundle tool to the MCP server.
func RegisterBundleTools(
	s *server.MCPServer,
	pool *pgxpool.Pool,
	auditLogger *audit.Logger,
	cfg *config.Config,
) {
	upsellTool := mcp.NewTool(
		"get_upsell_bundle",
		mcp.WithDescription("AI Revenue Growth Engine: Proactively generates high-affinity cross-sell bundles (e.g. Laptop Stand + RGB Desk Mat) with bounded promotional bundle discounts to expand Average Order Value (AOV)."),
		mcp.WithString("merchant_api_key", mcp.Description("Merchant API key for authentication")),
		mcp.WithString("product_id", mcp.Required(), mcp.Description("UUID of the target product the customer is considering")),
		mcp.WithNumber("requested_discount_percent", mcp.Description("Optional custom promotional bundle discount percent (default: 15% or active merchant campaign discount)")),
	)
	s.AddTool(upsellTool, handleGetUpsellBundle(pool, auditLogger, cfg))
}

func handleGetUpsellBundle(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		start := time.Now()
		correlationID := uuid.New()

		passphrase := ""
		if cfg != nil {
			passphrase = cfg.EncryptionPassphrase
		}
		merchant, err := auth.ResolveMerchant(ctx, pool, request, passphrase)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		merchantUUID, _ := uuid.Parse(merchant.ID)

		prodIDStr, err := request.RequireString("product_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: product_id"), nil
		}
		productID, err := uuid.Parse(prodIDStr)
		if err != nil {
			return mcp.NewToolResultError("invalid product_id format"), nil
		}

		requestedDiscount := request.GetInt("requested_discount_percent", 0)

		// 1. Query target product details
		var baseName, baseCategory string
		var basePrice, baseFloor int
		err = pool.QueryRow(ctx, `
			SELECT name, category, base_price, floor_price
			FROM products
			WHERE id = $1 AND merchant_id = $2;
		`, productID, merchantUUID).Scan(&baseName, &baseCategory, &basePrice, &baseFloor)
		if err != nil {
			return mcp.NewToolResultError("product not found in merchant catalog"), nil
		}

		// 2. Query active campaigns from PostgreSQL matching merchant and category
		type dbCampaign struct {
			ID              uuid.UUID
			Name            string
			DiscountPercent int
			TargetCategory  string
			MinBundleItems  int
		}
		var activeCampaign *dbCampaign

		cRows, cErr := pool.Query(ctx, `
			SELECT id, name, discount_percent, COALESCE(target_category, ''), min_bundle_items
			FROM merchant_campaigns
			WHERE merchant_id = $1
			  AND status = 'active'
			  AND starts_at <= NOW()
			  AND ends_at >= NOW()
			ORDER BY 
				CASE 
					WHEN LOWER(target_category) = LOWER($2) THEN 1
					WHEN LOWER(target_category) LIKE '%' || LOWER($2) || '%' THEN 2
					WHEN LOWER($2) LIKE '%' || LOWER(target_category) || '%' THEN 3
					WHEN target_category IS NULL OR target_category = '' OR LOWER(target_category) = 'all' THEN 5
					ELSE 4
				END,
				discount_percent DESC,
				created_at DESC
			LIMIT 1;
		`, merchantUUID, baseCategory)
		if cErr == nil {
			defer cRows.Close()
			if cRows.Next() {
				var c dbCampaign
				if err := cRows.Scan(&c.ID, &c.Name, &c.DiscountPercent, &c.TargetCategory, &c.MinBundleItems); err == nil {
					activeCampaign = &c
				}
			}
		}

		// Determine promotional bundle discount
		discountPercent := 15
		if activeCampaign != nil && activeCampaign.DiscountPercent > 0 {
			discountPercent = activeCampaign.DiscountPercent
		}
		if requestedDiscount > 0 && requestedDiscount <= 50 {
			discountPercent = requestedDiscount
		}

		// 3. Query complementary product in same merchant catalog
		targetCategoryFilter := baseCategory
		if activeCampaign != nil && activeCampaign.TargetCategory != "" && activeCampaign.TargetCategory != "All" {
			targetCategoryFilter = activeCampaign.TargetCategory
		}

		compQuery := `
			SELECT id, name, category, base_price, floor_price
			FROM products
			WHERE merchant_id = $1 AND id != $2 AND stock > 0
			ORDER BY 
				CASE 
					WHEN LOWER(category) = LOWER($3) THEN 1
					WHEN LOWER(category) LIKE '%' || LOWER($3) || '%' THEN 2
					WHEN LOWER(category) = LOWER($4) THEN 3
					WHEN category IN ('Desk Accessories', 'Audio', 'Wearables') THEN 4
					ELSE 5
				END,
				base_price ASC
			LIMIT 1;
		`
		var compID uuid.UUID
		var compName, compCategory string
		var compPrice, compFloor int

		err = pool.QueryRow(ctx, compQuery, merchantUUID, productID, targetCategoryFilter, baseCategory).Scan(&compID, &compName, &compCategory, &compPrice, &compFloor)
		if err != nil {
			// No complementary product found
			noUpsell := UpsellBundleResponse{
				Status:      "no_compatible_upsell",
				UpsellPitch: "No compatible upsell accessory currently available in stock.",
			}
			respBytes, _ := json.Marshal(noUpsell)
			return mcp.NewToolResultText(string(respBytes)), nil
		}

		// 4. Compute bundled pricing and enforce combined floor protection
		individualTotal := basePrice + compPrice
		combinedFloor := baseFloor + compFloor

		// Target promotional price
		discountAmount := (individualTotal * discountPercent) / 100
		bundledSpecialPrice := individualTotal - discountAmount

		// Floor constraint: Special price CANNOT drop below combined floor
		if bundledSpecialPrice < combinedFloor {
			bundledSpecialPrice = combinedFloor
			discountAmount = individualTotal - combinedFloor
		}

		actualDiscountPercent := 0
		if individualTotal > 0 {
			actualDiscountPercent = (discountAmount * 100) / individualTotal
		}

		bundleTitle := fmt.Sprintf("Power Duo: %s + %s", baseName, compName)
		pitch := fmt.Sprintf("Customers who selected '%s' frequently add '%s'. Bundle both now to save ₹%.2f (%d%% instant savings)!",
			baseName, compName, float64(discountAmount)/100.0, actualDiscountPercent)

		var campID *uuid.UUID
		campName := ""
		reasonCode := "UPSELL_BUNDLE_GENERATED"
		if activeCampaign != nil {
			campID = &activeCampaign.ID
			campName = activeCampaign.Name
			bundleTitle = fmt.Sprintf("%s (%s + %s)", activeCampaign.Name, baseName, compName)
			pitch = fmt.Sprintf("[%s Campaign] Customers who selected '%s' frequently add '%s'. Bundle both now to save ₹%.2f (%d%% promotional savings)!",
				activeCampaign.Name, baseName, compName, float64(discountAmount)/100.0, actualDiscountPercent)
			reasonCode = "CAMPAIGN_UPSELL_BUNDLE_GENERATED"
		}

		bundleResp := UpsellBundleResponse{
			BundleName:               bundleTitle,
			UpsellPitch:              pitch,
			Items: []BundledProductDTO{
				{ID: productID, Name: baseName, Category: baseCategory, BasePrice: basePrice},
				{ID: compID, Name: compName, Category: compCategory, BasePrice: compPrice},
			},
			IndividualTotalPaise:     individualTotal,
			BundledSpecialPricePaise: bundledSpecialPrice,
			InstantSavingsPaise:      discountAmount,
			DiscountPercent:          actualDiscountPercent,
			Status:                   "available",
			CampaignID:               campID,
			CampaignName:             campName,
		}

		auditInput := map[string]any{
			"product_id":                 prodIDStr,
			"requested_discount_percent": requestedDiscount,
			"applied_discount_percent":   discountPercent,
		}
		if activeCampaign != nil {
			auditInput["campaign_id"] = activeCampaign.ID.String()
			auditInput["campaign_name"] = activeCampaign.Name
		}

		_ = auditLogger.Log(ctx, audit.Entry{
			MerchantID:    merchant.ID,
			CorrelationID: correlationID,
			ToolName:      "get_upsell_bundle",
			Input:         auditInput,
			Decision:      "approved",
			ReasonCode:    reasonCode,
			Output:        bundleResp,
			DurationMs:    time.Since(start).Milliseconds(),
		})

		respBytes, _ := json.Marshal(bundleResp)
		return mcp.NewToolResultText(string(respBytes)), nil
	}
}
