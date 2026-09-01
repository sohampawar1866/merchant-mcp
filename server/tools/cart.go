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
	"github.com/sohampawar1866/merchant-mcp/server/cart"
	"github.com/sohampawar1866/merchant-mcp/server/config"
	"github.com/sohampawar1866/merchant-mcp/server/db"
	"github.com/sohampawar1866/merchant-mcp/server/pricing"
	"github.com/sohampawar1866/merchant-mcp/server/razorpay"
)

// RegisterCartTools registers all multi-product cart and bundle tools to the MCP server.
func RegisterCartTools(
	s *server.MCPServer,
	pool *pgxpool.Pool,
	rzpClient *razorpay.Client,
	auditLogger *audit.Logger,
	cfg *config.Config,
) {
	// 1. create_cart
	createCartTool := mcp.NewTool(
		"create_cart",
		mcp.WithDescription("Creates a new multi-product shopping cart session for an agent or customer."),
		mcp.WithString("merchant_api_key", mcp.Description("Merchant API key for authentication (optional if configured in environment)")),
		mcp.WithString("agent_session_id", mcp.Description("Unique identifier for this AI buyer conversation session")),
		mcp.WithString("customer_id", mcp.Description("Optional customer phone or ID")),
	)
	s.AddTool(createCartTool, handleCreateCart(pool, auditLogger, cfg))

	// 2. add_to_cart
	addToCartTool := mcp.NewTool(
		"add_to_cart",
		mcp.WithDescription("Adds an item with quantity to a shopping cart session, automatically calculating itemized taxes and totals."),
		mcp.WithString("merchant_api_key", mcp.Description("Merchant API key for authentication")),
		mcp.WithString("cart_id", mcp.Required(), mcp.Description("UUID of the active cart")),
		mcp.WithString("product_id", mcp.Required(), mcp.Description("UUID of the product to add")),
		mcp.WithNumber("quantity", mcp.Description("Quantity to add (default: 1)")),
	)
	s.AddTool(addToCartTool, handleAddToCart(pool, auditLogger, cfg))

	// 3. remove_from_cart
	removeFromCartTool := mcp.NewTool(
		"remove_from_cart",
		mcp.WithDescription("Removes or decrements an item from a shopping cart session."),
		mcp.WithString("merchant_api_key", mcp.Description("Merchant API key for authentication")),
		mcp.WithString("cart_id", mcp.Required(), mcp.Description("UUID of the active cart")),
		mcp.WithString("product_id", mcp.Required(), mcp.Description("UUID of the product to remove")),
		mcp.WithNumber("quantity", mcp.Description("Quantity to remove (optional; if omitted or >= current qty, removes line entirely)")),
	)
	s.AddTool(removeFromCartTool, handleRemoveFromCart(pool, auditLogger, cfg))

	// 4. view_cart
	viewCartTool := mcp.NewTool(
		"view_cart",
		mcp.WithDescription("Retrieves the full itemized shopping cart, subtotal, tax breakdown, and net payable in paise."),
		mcp.WithString("merchant_api_key", mcp.Description("Merchant API key for authentication")),
		mcp.WithString("cart_id", mcp.Required(), mcp.Description("UUID of the cart to inspect")),
	)
	s.AddTool(viewCartTool, handleViewCart(pool, auditLogger, cfg))

	// 5. negotiate_cart_bundle
	negotiateBundleTool := mcp.NewTool(
		"negotiate_cart_bundle",
		mcp.WithDescription("Submits a lump-sum bundle discount offer for all items in the cart. Evaluates against itemized floor prices and proportionally distributes concessions without margin leakage."),
		mcp.WithString("merchant_api_key", mcp.Description("Merchant API key for authentication")),
		mcp.WithString("cart_id", mcp.Required(), mcp.Description("UUID of the cart")),
		mcp.WithNumber("proposed_bundle_price", mcp.Required(), mcp.Description("Proposed total bundle price in paise (e.g. 180000 = ₹1,800.00)")),
		mcp.WithNumber("attempt_number", mcp.Description("Negotiation attempt turn (1, 2, 3...)")),
	)
	s.AddTool(negotiateBundleTool, handleNegotiateCartBundle(pool, auditLogger, cfg))

	// 6. checkout_cart
	checkoutCartTool := mcp.NewTool(
		"checkout_cart",
		mcp.WithDescription("Finalizes a multi-product cart and creates an atomic Razorpay Payment Link / Order with itemized receipt notes."),
		mcp.WithString("merchant_api_key", mcp.Description("Merchant API key for authentication")),
		mcp.WithString("cart_id", mcp.Required(), mcp.Description("UUID of the cart to checkout")),
		mcp.WithString("idempotency_key", mcp.Required(), mcp.Description("Unique idempotency key to prevent duplicate checkouts")),
		mcp.WithString("customer_phone", mcp.Description("Customer contact phone for payment link notification")),
		mcp.WithString("customer_email", mcp.Description("Customer email for receipt dispatch")),
	)
	s.AddTool(checkoutCartTool, handleCheckoutCart(pool, rzpClient, auditLogger, cfg))
}

func handleCreateCart(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		passphrase := ""
		if cfg != nil {
			passphrase = cfg.EncryptionPassphrase
		}
		merchant, err := auth.ResolveMerchant(ctx, pool, request, passphrase)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		merchantUUID, err := uuid.Parse(merchant.ID)
		if err != nil {
			return mcp.NewToolResultError("invalid merchant ID format"), nil
		}

		agentSessionID := request.GetString("agent_session_id", "session_"+uuid.New().String()[:8])
		customerID := request.GetString("customer_id", "")

		newCart, err := cart.CreateCart(ctx, pool, merchantUUID, agentSessionID, customerID)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to create cart: %v", err)), nil
		}

		respBytes, _ := json.Marshal(newCart)
		return mcp.NewToolResultText(string(respBytes)), nil
	}
}

func handleAddToCart(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		passphrase := ""
		if cfg != nil {
			passphrase = cfg.EncryptionPassphrase
		}
		merchant, err := auth.ResolveMerchant(ctx, pool, request, passphrase)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		merchantUUID, _ := uuid.Parse(merchant.ID)

		cartIDStr, err := request.RequireString("cart_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: cart_id"), nil
		}
		cartID, err := uuid.Parse(cartIDStr)
		if err != nil {
			return mcp.NewToolResultError("invalid cart_id format"), nil
		}

		productIDStr, err := request.RequireString("product_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: product_id"), nil
		}
		productID, err := uuid.Parse(productIDStr)
		if err != nil {
			return mcp.NewToolResultError("invalid product_id format"), nil
		}

		qty := request.GetInt("quantity", 1)
		if qty <= 0 {
			qty = 1
		}

		updatedCart, err := cart.AddItemToCart(ctx, pool, cartID, productID, merchantUUID, qty)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		respBytes, _ := json.Marshal(updatedCart)
		return mcp.NewToolResultText(string(respBytes)), nil
	}
}

func handleRemoveFromCart(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		passphrase := ""
		if cfg != nil {
			passphrase = cfg.EncryptionPassphrase
		}
		merchant, err := auth.ResolveMerchant(ctx, pool, request, passphrase)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		merchantUUID, _ := uuid.Parse(merchant.ID)

		cartIDStr, err := request.RequireString("cart_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: cart_id"), nil
		}
		cartID, _ := uuid.Parse(cartIDStr)

		productIDStr, err := request.RequireString("product_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: product_id"), nil
		}
		productID, _ := uuid.Parse(productIDStr)

		qty := request.GetInt("quantity", 0)

		updatedCart, err := cart.RemoveItemFromCart(ctx, pool, cartID, productID, merchantUUID, qty)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		respBytes, _ := json.Marshal(updatedCart)
		return mcp.NewToolResultText(string(respBytes)), nil
	}
}

func handleViewCart(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		passphrase := ""
		if cfg != nil {
			passphrase = cfg.EncryptionPassphrase
		}
		merchant, err := auth.ResolveMerchant(ctx, pool, request, passphrase)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		merchantUUID, _ := uuid.Parse(merchant.ID)

		cartIDStr, err := request.RequireString("cart_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: cart_id"), nil
		}
		cartID, _ := uuid.Parse(cartIDStr)

		currentCart, err := cart.GetCart(ctx, pool, cartID, merchantUUID)
		if err != nil {
			return mcp.NewToolResultError("cart not found"), nil
		}

		respBytes, _ := json.Marshal(currentCart)
		return mcp.NewToolResultText(string(respBytes)), nil
	}
}

func handleNegotiateCartBundle(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
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

		cartIDStr, err := request.RequireString("cart_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: cart_id"), nil
		}
		cartID, _ := uuid.Parse(cartIDStr)

		proposedBundlePrice, err := request.RequireInt("proposed_bundle_price")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: proposed_bundle_price (must be integer paise)"), nil
		}

		attemptNumber := request.GetInt("attempt_number", 1)

		currentCart, err := cart.GetCart(ctx, pool, cartID, merchantUUID)
		if err != nil || len(currentCart.Items) == 0 {
			return mcp.NewToolResultError("cart is empty or not found"), nil
		}

		// Prepare items for evaluation
		bundleItems := make([]pricing.BundleItemInput, len(currentCart.Items))
		for i, it := range currentCart.Items {
			bundleItems[i] = pricing.BundleItemInput{
				ID:         it.ProductID.String(),
				BasePrice:  it.UnitBasePricePaise,
				FloorPrice: it.UnitFloorPricePaise,
				Quantity:   it.Quantity,
			}
		}

		maxDiscountPercent := db.GetMerchantSettingInt(ctx, pool, merchant.ID, "max_discount_percent", 20)
		requireHumanApproval := db.GetMerchantSettingBool(ctx, pool, merchant.ID, "enable_human_approval", false)

		evalResult := pricing.EvaluateBundleOffer(pricing.BundleEvaluationInput{
			Items:              bundleItems,
			ProposedTotalPrice: proposedBundlePrice,
			AttemptNumber:      attemptNumber,
			MaxAttempts:        3,
			MaxDiscountPercent: maxDiscountPercent,
			RequireHumanReview: requireHumanApproval,
		})

		if evalResult.Decision == "approved" {
			// Apply allocations to cart items in DB
			for _, alloc := range evalResult.Allocations {
				prodUUID, _ := uuid.Parse(alloc.ID)
				_, _ = pool.Exec(ctx, `UPDATE cart_items SET unit_agreed_price_paise = $1, line_total_paise = $2 WHERE cart_id = $3 AND product_id = $4;`,
					alloc.UnitAgreedPrice, alloc.LineTotalPaise, cartID, prodUUID)
			}
			// Update cart totals
			subtotal, tax, total := cart.RecalculateCartTotals(currentCart.Items, 0)
			_, _ = pool.Exec(ctx, `UPDATE carts SET subtotal_paise = $1, tax_paise = $2, total_paise = $3, negotiated_bundle = true, updated_at = NOW() WHERE id = $4;`,
				subtotal, tax, total, cartID)
		}

		_ = auditLogger.Log(ctx, audit.Entry{
			MerchantID:    merchant.ID,
			CorrelationID: correlationID,
			ToolName:      "negotiate_cart_bundle",
			Input: map[string]any{
				"cart_id":               cartIDStr,
				"proposed_bundle_price": proposedBundlePrice,
				"attempt_number":        attemptNumber,
			},
			Decision:   evalResult.Decision,
			ReasonCode: evalResult.ReasonCode,
			Output:     evalResult,
			DurationMs: time.Since(start).Milliseconds(),
		})

		respBytes, _ := json.Marshal(evalResult)
		return mcp.NewToolResultText(string(respBytes)), nil
	}
}

func handleCheckoutCart(
	pool *pgxpool.Pool,
	rzpClient *razorpay.Client,
	auditLogger *audit.Logger,
	cfg *config.Config,
) server.ToolHandlerFunc {
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

		cartIDStr, err := request.RequireString("cart_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: cart_id"), nil
		}
		cartID, _ := uuid.Parse(cartIDStr)

		idempotencyKey, err := request.RequireString("idempotency_key")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: idempotency_key"), nil
		}

		currentCart, err := cart.GetCart(ctx, pool, cartID, merchantUUID)
		if err != nil || len(currentCart.Items) == 0 {
			return mcp.NewToolResultError("cart is empty or not found"), nil
		}

		// Create Razorpay payment link with cart total
		customerPhone := request.GetString("customer_phone", "")
		customerEmail := request.GetString("customer_email", "")

		itemDesc := fmt.Sprintf("Multi-item cart purchase (%d items) from %s", len(currentCart.Items), merchant.Name)

		linkReq := razorpay.CreatePaymentLinkRequest{
			Amount:        currentCart.TotalPaise,
			Currency:      "INR",
			Description:   itemDesc,
			CustomerPhone: customerPhone,
			CustomerEmail: customerEmail,
			UPILink:       true,
		}

		linkResp, err := rzpClient.CreatePaymentLinkWithAuth(ctx, linkReq, merchant.RazorpayKeyID, merchant.RazorpayKeySecret)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("razorpay payment link creation failed: %v", err)), nil
		}

		// Save master order
		_, err = pool.Exec(ctx, `
			INSERT INTO orders (
				merchant_id, razorpay_order_id, product_id, agreed_price, status, idempotency_key, payment_link, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, 'created', $5, $6, NOW(), NOW()
			);
		`, merchant.ID, linkResp.ID, currentCart.Items[0].ProductID, currentCart.TotalPaise, idempotencyKey, linkResp.ShortURL)

		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to record order: %v", err)), nil
		}

		// Update cart status to locked
		_, _ = pool.Exec(ctx, `UPDATE carts SET status = 'locked', idempotency_key = $1, updated_at = NOW() WHERE id = $2;`, idempotencyKey, cartID)

		checkoutResp := map[string]any{
			"order_id":        linkResp.ID,
			"checkout_link":   linkResp.ShortURL,
			"status":          "created",
			"cart_id":         cartIDStr,
			"total_paise":     currentCart.TotalPaise,
			"item_count":      len(currentCart.Items),
			"idempotency_key": idempotencyKey,
		}

		_ = auditLogger.Log(ctx, audit.Entry{
			MerchantID:    merchant.ID,
			CorrelationID: correlationID,
			ToolName:      "checkout_cart",
			Input: map[string]any{
				"cart_id":         cartIDStr,
				"idempotency_key": idempotencyKey,
			},
			Decision:   "approved",
			ReasonCode: "CART_CHECKOUT_CREATED",
			Output:     checkoutResp,
			DurationMs: time.Since(start).Milliseconds(),
		})

		respBytes, _ := json.Marshal(checkoutResp)
		return mcp.NewToolResultText(string(respBytes)), nil
	}
}
