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
	"github.com/sohampawar1866/merchant-mcp/server/cache"
	"github.com/sohampawar1866/merchant-mcp/server/config"
	"github.com/sohampawar1866/merchant-mcp/server/db"
	"github.com/sohampawar1866/merchant-mcp/server/razorpay"
)

// CreateCheckoutResponse defines the response returned when an order is created.
type CreateCheckoutResponse struct {
	OrderID        string `json:"order_id"`
	CheckoutLink   string `json:"checkout_link"`
	Status         string `json:"status"` // "created", "paid"
	AgreedPrice    int    `json:"agreed_price"` // in paise
	IdempotencyKey string `json:"idempotency_key"`
}

// CheckOrderStatusResponse defines the response for order status inquiry.
type CheckOrderStatusResponse struct {
	OrderID     string `json:"order_id"`
	Status      string `json:"status"` // "created", "paid", "failed", "cancelled"
	AgreedPrice int    `json:"agreed_price"` // in paise
	PaymentLink string `json:"payment_link,omitempty"`
}

// RegisterCheckoutTools registers create_checkout and check_order_status tools.
func RegisterCheckoutTools(
	s *server.MCPServer,
	pool *pgxpool.Pool,
	rzpClient *razorpay.Client,
	cacheInstance *cache.Cache,
	auditLogger *audit.Logger,
	cfg *config.Config,
) {
	// 1. Tool: create_checkout
	checkoutTool := mcp.NewTool(
		"create_checkout",
		mcp.WithDescription("Initiate checkout and generate a Razorpay payment link for an approved purchase. Gated and strictly idempotent."),
		mcp.WithString("product_id",
			mcp.Required(),
			mcp.Description("The UUID of the product being purchased"),
		),
		mcp.WithNumber("agreed_price",
			mcp.Required(),
			mcp.Description("The agreed purchase price in INR paise (e.g. 165000 for ₹1,650.00). Must be at or above merchant floor price."),
		),
		mcp.WithString("idempotency_key",
			mcp.Required(),
			mcp.Description("Unique client-generated UUID idempotency key to prevent double charging on retries"),
		),
		mcp.WithString("agent_session_id",
			mcp.Description("Optional session identifier for rate limiting"),
		),
		mcp.WithString("customer_phone",
			mcp.Description("Optional customer mobile number for SMS checkout dispatch"),
		),
		mcp.WithString("customer_email",
			mcp.Description("Optional customer email address"),
		),
		mcp.WithString("merchant_api_key",
			mcp.Description("Optional merchant API key"),
		),
	)
	s.AddTool(checkoutTool, handleCreateCheckout(pool, rzpClient, cacheInstance, auditLogger, cfg))

	// 2. Tool: check_order_status
	statusTool := mcp.NewTool(
		"check_order_status",
		mcp.WithDescription("Check the payment status of an existing order or payment link by order ID."),
		mcp.WithString("order_id",
			mcp.Required(),
			mcp.Description("The Razorpay order ID or internal order UUID to check"),
		),
		mcp.WithString("merchant_api_key",
			mcp.Description("Optional merchant API key"),
		),
	)
	s.AddTool(statusTool, handleCheckOrderStatus(pool, rzpClient, auditLogger, cfg))
}

func handleCreateCheckout(
	pool *pgxpool.Pool,
	rzpClient *razorpay.Client,
	cacheInstance *cache.Cache,
	auditLogger *audit.Logger,
	cfg *config.Config,
) server.ToolHandlerFunc {
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

		agreedPrice, err := request.RequireInt("agreed_price")
		if err != nil {
			return mcp.NewToolResultError("missing or invalid parameter: agreed_price (must be integer paise)"), nil
		}

		idempotencyKey, err := request.RequireString("idempotency_key")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: idempotency_key"), nil
		}

		sessionID := request.GetString("agent_session_id", "default-session")
		customerPhone := request.GetString("customer_phone", "")
		customerEmail := request.GetString("customer_email", "")

		inputArgs := map[string]any{
			"merchant_id":      merchant.ID,
			"product_id":       productID,
			"agreed_price":     agreedPrice,
			"idempotency_key":  idempotencyKey,
			"agent_session_id": sessionID,
			"customer_phone":   customerPhone,
			"customer_email":   customerEmail,
		}

		// 1. Session Rate Limiting Check (Dynamic threshold from merchant store_settings)
		maxRateLimit := db.GetMerchantSettingInt(ctx, pool, merchant.ID, "max_tool_calls_per_minute", cfg.MaxToolCallsPerMinute)
		if cacheInstance != nil {
			sessionKey := fmt.Sprintf("%s:%s", merchant.ID, sessionID)
			allowed, _, err := cacheInstance.AllowToolCall(ctx, sessionKey, maxRateLimit)
			if err == nil && !allowed {
				errOutput := "rate limit exceeded: too many tool requests in current minute"
				_ = auditLogger.Log(ctx, audit.Entry{
					MerchantID:    merchant.ID,
					CorrelationID: correlationID,
					ToolName:      "create_checkout",
					Input:         inputArgs,
					Decision:      "rejected",
					ReasonCode:    "RATE_LIMIT_EXCEEDED",
					ErrorMessage:  errOutput,
					DurationMs:    time.Since(start).Milliseconds(),
				})
				return mcp.NewToolResultError(errOutput), nil
			}
		}

		if pool == nil {
			return mcp.NewToolResultError("database connection unavailable"), nil
		}

		// 2. IDEMPOTENCY CHECK: Return existing order if idempotency_key was already processed for this merchant
		var existingOrderID, existingPaymentLink, existingStatus string
		var existingPrice int
		checkQuery := `SELECT razorpay_order_id, payment_link, agreed_price, status FROM orders WHERE idempotency_key = $1 AND merchant_id = $2;`
		err = pool.QueryRow(ctx, checkQuery, idempotencyKey, merchant.ID).Scan(&existingOrderID, &existingPaymentLink, &existingPrice, &existingStatus)
		if err == nil {
			// Idempotent hit! Return existing order directly without re-charging
			response := CreateCheckoutResponse{
				OrderID:        existingOrderID,
				CheckoutLink:   existingPaymentLink,
				Status:         existingStatus,
				AgreedPrice:    existingPrice,
				IdempotencyKey: idempotencyKey,
			}
			respBytes, _ := json.Marshal(response)

			_ = auditLogger.Log(ctx, audit.Entry{
				MerchantID:    merchant.ID,
				CorrelationID: correlationID,
				ToolName:      "create_checkout",
				Input:         inputArgs,
				Decision:      "approved",
				ReasonCode:    "IDEMPOTENT_HIT",
				Output:        response,
				DurationMs:    time.Since(start).Milliseconds(),
			})
			return mcp.NewToolResultText(string(respBytes)), nil
		}

		// 3. Query Product and verify Floor Price gating for this merchant
		var productName string
		var basePrice, floorPrice, stock int
		productQuery := `SELECT name, base_price, floor_price, stock FROM products WHERE id = $1 AND merchant_id = $2;`
		err = pool.QueryRow(ctx, productQuery, productID, merchant.ID).Scan(&productName, &basePrice, &floorPrice, &stock)
		if err != nil {
			if err == pgx.ErrNoRows {
				_ = auditLogger.Log(ctx, audit.Entry{
					MerchantID:    merchant.ID,
					CorrelationID: correlationID,
					ToolName:      "create_checkout",
					Input:         inputArgs,
					Decision:      "rejected",
					ReasonCode:    "PRODUCT_NOT_FOUND",
					DurationMs:    time.Since(start).Milliseconds(),
				})
				return mcp.NewToolResultError(fmt.Sprintf("product not found with id: %s in store: %s", productID, merchant.Name)), nil
			}
			return mcp.NewToolResultError(fmt.Sprintf("database query failed: %v", err)), nil
		}

		if stock <= 0 {
			_ = auditLogger.Log(ctx, audit.Entry{
				MerchantID:    merchant.ID,
				CorrelationID: correlationID,
				ToolName:      "create_checkout",
				Input:         inputArgs,
				Decision:      "rejected",
				ReasonCode:    "PRODUCT_OUT_OF_STOCK",
				DurationMs:    time.Since(start).Milliseconds(),
			})
			return mcp.NewToolResultError("product is currently out of stock"), nil
		}

		// Strictly enforce floor price gating on checkout
		if agreedPrice < floorPrice {
			errOutput := fmt.Sprintf("gated rejection: proposed price (%d paise) is below merchant floor price", agreedPrice)
			_ = auditLogger.Log(ctx, audit.Entry{
				MerchantID:    merchant.ID,
				CorrelationID: correlationID,
				ToolName:      "create_checkout",
				Input:         inputArgs,
				Decision:      "rejected",
				ReasonCode:    "BELOW_FLOOR",
				ErrorMessage:  errOutput,
				DurationMs:    time.Since(start).Milliseconds(),
			})
			return mcp.NewToolResultError(errOutput), nil
		}

		// 4. Create Razorpay Payment Link using decrypted merchant credentials
		keyID := merchant.RazorpayKeyID
		keySecret := merchant.RazorpayKeySecret
		if keyID == "" {
			keyID = db.GetMerchantSettingString(ctx, pool, merchant.ID, "razorpay_key_id", cfg.RazorpayKeyID)
		}
		if keySecret == "" {
			keySecret = db.GetMerchantSettingString(ctx, pool, merchant.ID, "razorpay_key_secret", cfg.RazorpayKeySecret)
		}

		deliveryMode := db.GetMerchantSettingString(ctx, pool, merchant.ID, "checkout_delivery_mode", cfg.CheckoutDeliveryMode)
		upiLink := (deliveryMode == "upi_link")

		linkResp, err := rzpClient.CreatePaymentLinkWithAuth(ctx, razorpay.CreatePaymentLinkRequest{
			Amount:         agreedPrice,
			Currency:       "INR",
			Description:    fmt.Sprintf("Purchase of %s (%s)", productName, merchant.Name),
			CustomerPhone:  customerPhone,
			CustomerEmail:  customerEmail,
			UPILink:        upiLink,
			CallbackURL:    "http://localhost:3000/order/success",
			CallbackMethod: "get",
		}, keyID, keySecret)
		if err != nil {
			errOutput := fmt.Sprintf("razorpay payment link creation failed: %v", err)
			_ = auditLogger.Log(ctx, audit.Entry{
				MerchantID:    merchant.ID,
				CorrelationID: correlationID,
				ToolName:      "create_checkout",
				Input:         inputArgs,
				Decision:      "failed",
				ErrorMessage:  errOutput,
				DurationMs:    time.Since(start).Milliseconds(),
			})
			return mcp.NewToolResultError(errOutput), nil
		}

		// 5. Persist order into PostgreSQL with merchant_id
		insertQuery := `
			INSERT INTO orders (
				merchant_id, razorpay_order_id, product_id, agreed_price, status, idempotency_key, payment_link, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, 'created', $5, $6, NOW(), NOW()
			);
		`
		_, err = pool.Exec(ctx, insertQuery, merchant.ID, linkResp.ID, productID, agreedPrice, idempotencyKey, linkResp.ShortURL)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to save order: %v", err)), nil
		}

		// 6. Cache idempotency key
		if cacheInstance != nil {
			_ = cacheInstance.SetIdempotencyKey(ctx, fmt.Sprintf("%s:%s", merchant.ID, idempotencyKey), linkResp.ID, 24*time.Hour)
		}

		// 7. Return checkout response
		response := CreateCheckoutResponse{
			OrderID:        linkResp.ID,
			CheckoutLink:   linkResp.ShortURL,
			Status:         "created",
			AgreedPrice:    agreedPrice,
			IdempotencyKey: idempotencyKey,
		}

		respBytes, _ := json.Marshal(response)

		_ = auditLogger.Log(ctx, audit.Entry{
			MerchantID:    merchant.ID,
			CorrelationID: correlationID,
			ToolName:      "create_checkout",
			Input:         inputArgs,
			Decision:      "approved",
			ReasonCode:    "CHECKOUT_CREATED",
			Output:        response,
			DurationMs:    time.Since(start).Milliseconds(),
		})

		return mcp.NewToolResultText(string(respBytes)), nil
	}
}

func handleCheckOrderStatus(
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

		orderID, err := request.RequireString("order_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: order_id"), nil
		}

		inputArgs := map[string]any{
			"merchant_id": merchant.ID,
			"order_id":    orderID,
		}

		if pool == nil {
			return mcp.NewToolResultError("database connection unavailable"), nil
		}

		var id, razorpayOrderID, status, paymentLink string
		var agreedPrice int

		query := `
			SELECT id, razorpay_order_id, status, agreed_price, payment_link
			FROM orders
			WHERE merchant_id = $1 AND (razorpay_order_id = $2 OR id::text = $2);
		`
		err = pool.QueryRow(ctx, query, merchant.ID, orderID).Scan(&id, &razorpayOrderID, &status, &agreedPrice, &paymentLink)
		if err != nil {
			if err == pgx.ErrNoRows {
				_ = auditLogger.Log(ctx, audit.Entry{
					MerchantID:    merchant.ID,
					CorrelationID: correlationID,
					ToolName:      "check_order_status",
					Input:         inputArgs,
					Decision:      "n/a",
					ReasonCode:    "ORDER_NOT_FOUND",
					DurationMs:    time.Since(start).Milliseconds(),
				})
				return mcp.NewToolResultError(fmt.Sprintf("order not found with id: %s for store %s", orderID, merchant.Name)), nil
			}
			return mcp.NewToolResultError(fmt.Sprintf("database query failed: %v", err)), nil
		}

		// If status is not marked as paid, poll Razorpay API live for immediate sync
		if status != "paid" && rzpClient != nil && razorpayOrderID != "" {
			if linkResp, err := rzpClient.FetchPaymentLinkWithAuth(ctx, razorpayOrderID, merchant.RazorpayKeyID, merchant.RazorpayKeySecret); err == nil && linkResp != nil {
				if linkResp.Status == "paid" {
					status = "paid"
					_, _ = pool.Exec(ctx, `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1;`, id)
					_ = auditLogger.Log(ctx, audit.Entry{
						MerchantID:    merchant.ID,
						CorrelationID: correlationID,
						ToolName:      "check_order_status_sync",
						Input:         inputArgs,
						Decision:      "paid",
						ReasonCode:    "PAYMENT_CAPTURED_POLL",
						DurationMs:    time.Since(start).Milliseconds(),
					})
				}
			}
		}

		response := CheckOrderStatusResponse{
			OrderID:     razorpayOrderID,
			Status:      status,
			AgreedPrice: agreedPrice,
			PaymentLink: paymentLink,
		}

		respBytes, _ := json.Marshal(response)

		_ = auditLogger.Log(ctx, audit.Entry{
			MerchantID:    merchant.ID,
			CorrelationID: correlationID,
			ToolName:      "check_order_status",
			Input:         inputArgs,
			Decision:      "n/a",
			Output:        response,
			DurationMs:    time.Since(start).Milliseconds(),
		})

		return mcp.NewToolResultText(string(respBytes)), nil
	}
}
