package webhook

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sohampawar1866/merchant-mcp/server/audit"
	"github.com/sohampawar1866/merchant-mcp/server/db"
)

// RazorpayWebhookEvent defines the minimal payload structure from Razorpay webhooks.
type RazorpayWebhookEvent struct {
	Event   string `json:"event"` // e.g. "payment.captured", "order.paid", "payment.failed"
	Payload struct {
		Payment struct {
			Entity struct {
				ID      string `json:"id"`
				OrderID string `json:"order_id"`
				Status  string `json:"status"` // "captured", "failed"
				Amount  int    `json:"amount"`
			} `json:"entity"`
		} `json:"payment"`
		Order struct {
			Entity struct {
				ID     string `json:"id"`
				Status string `json:"status"` // "paid"
				Amount int    `json:"amount"`
			} `json:"entity"`
		} `json:"order"`
	} `json:"payload"`
}

// Receiver handles Razorpay webhook notifications across multiple merchants.
type Receiver struct {
	pool        *pgxpool.Pool
	auditLogger *audit.Logger
	strictMode  bool
	passphrase  string
	mockSecret  string // only used in test environments when pool is nil
}

// NewReceiver creates a new webhook receiver instance for multi-tenant production.
func NewReceiver(pool *pgxpool.Pool, auditLogger *audit.Logger, strictMode bool, passphrase string) *Receiver {
	return &Receiver{
		pool:        pool,
		auditLogger: auditLogger,
		strictMode:  strictMode,
		passphrase:  passphrase,
	}
}

// NewReceiverForTest creates a receiver with a mock secret for unit tests without a database.
func NewReceiverForTest(auditLogger *audit.Logger, mockSecret string, strictMode bool, passphrase string) *Receiver {
	return &Receiver{
		pool:        nil,
		auditLogger: auditLogger,
		strictMode:  strictMode,
		passphrase:  passphrase,
		mockSecret:  mockSecret,
	}
}

// VerifySignature validates the HMAC-SHA256 signature from Razorpay.
func VerifySignature(rawBody []byte, signature, secret string) bool {
	if secret == "" {
		return true // Allow simulated offline webhooks if secret is unconfigured
	}
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(rawBody)
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	return subtle.ConstantTimeCompare([]byte(expectedSig), []byte(signature)) == 1
}

// ServeHTTP processes incoming webhook requests.
func (rec *Receiver) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	correlationID := uuid.New()

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	signature := r.Header.Get("X-Razorpay-Signature")

	// 1. Parse Event Payload
	var event RazorpayWebhookEvent
	if err := json.Unmarshal(bodyBytes, &event); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	orderID := event.Payload.Payment.Entity.OrderID
	if orderID == "" {
		orderID = event.Payload.Order.Entity.ID
	}
	paymentID := event.Payload.Payment.Entity.ID

	// 2. Identify Merchant from matching Order or URL query param
	merchantID := r.URL.Query().Get("merchant_id")
	if merchantID == "" && rec.pool != nil && orderID != "" {
		_ = rec.pool.QueryRow(r.Context(), `
			SELECT merchant_id FROM orders WHERE razorpay_order_id = $1 OR payment_link LIKE '%' || $1 || '%';
		`, orderID).Scan(&merchantID)
	}
	if merchantID == "" {
		log.Printf("webhook: cannot resolve merchant_id from URL param or order lookup for order '%s' — rejecting", orderID)
		http.Error(w, `{"error":"MERCHANT_UNRESOLVABLE","message":"Cannot identify merchant for this webhook — include ?merchant_id= in the webhook URL or ensure the order exists in the database"}`, http.StatusBadRequest)
		return
	}

	// 3. Resolve Merchant Webhook Secret strictly from Database
	activeSecret := rec.mockSecret
	if rec.pool != nil && merchantID != "" {
		if m, err := db.GetMerchantByID(r.Context(), rec.pool, merchantID, rec.passphrase); err == nil && m.RazorpayWebhookSecret != "" {
			activeSecret = m.RazorpayWebhookSecret
		} else {
			activeSecret = db.GetMerchantSettingString(r.Context(), rec.pool, merchantID, "razorpay_webhook_secret", "")
		}
	}

	activeStrictMode := rec.strictMode
	if rec.pool != nil && merchantID != "" {
		activeStrictMode = db.GetMerchantSettingBool(r.Context(), rec.pool, merchantID, "webhook_strict_mode", rec.strictMode)
	}

	if activeSecret == "" && activeStrictMode {
		log.Printf("webhook: store '%s' does not have a webhook secret configured in database — rejecting", merchantID)
		http.Error(w, `{"error":"WEBHOOK_SECRET_NOT_CONFIGURED","message":"Merchant webhook secret is not configured in database"}`, http.StatusUnauthorized)
		return
	}

	if activeSecret != "" {
		valid := VerifySignature(bodyBytes, signature, activeSecret)
		if !valid {
			log.Printf("webhook: invalid HMAC signature for merchant %s: %s", merchantID, signature)
			if activeStrictMode {
				_ = rec.auditLogger.Log(r.Context(), audit.Entry{
					MerchantID:    merchantID,
					CorrelationID: correlationID,
					ToolName:      "webhook_razorpay",
					Input:         map[string]string{"signature": signature, "merchant_id": merchantID},
					Decision:      "rejected",
					ReasonCode:    "INVALID_WEBHOOK_SIGNATURE",
					ErrorMessage:  "HMAC signature mismatch",
					DurationMs:    time.Since(start).Milliseconds(),
				})
				http.Error(w, "Invalid signature", http.StatusBadRequest)
				return
			}
		}
	}

	var newStatus string
	switch event.Event {
	case "payment.captured", "order.paid":
		newStatus = "paid"
	case "payment.failed":
		newStatus = "failed"
	default:
		newStatus = "created"
	}

	// 4. Update order in PostgreSQL
	if rec.pool != nil && orderID != "" {
		updateQuery := `
			UPDATE orders
			SET status = $1, updated_at = NOW()
			WHERE razorpay_order_id = $2 OR payment_link LIKE '%' || $2 || '%';
		`
		res, err := rec.pool.Exec(r.Context(), updateQuery, newStatus, orderID)
		if err != nil {
			log.Printf("webhook: failed to update order %s status to %s: %v", orderID, newStatus, err)
		} else {
			log.Printf("webhook: updated order %s status to %s (rows affected: %d)", orderID, newStatus, res.RowsAffected())
		}
	}

	// 5. Record Audit Log with merchant_id
	_ = rec.auditLogger.Log(r.Context(), audit.Entry{
		MerchantID:    merchantID,
		CorrelationID: correlationID,
		ToolName:      "webhook_razorpay",
		Input:         map[string]any{"event": event.Event, "order_id": orderID, "payment_id": paymentID, "merchant_id": merchantID},
		Decision:      newStatus,
		ReasonCode:    event.Event,
		Output:        map[string]string{"status": "ok", "applied_status": newStatus},
		DurationMs:    time.Since(start).Milliseconds(),
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}
