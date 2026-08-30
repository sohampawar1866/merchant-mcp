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

// Receiver handles Razorpay webhook notifications.
type Receiver struct {
	pool        *pgxpool.Pool
	auditLogger *audit.Logger
	secret      string
	strictMode  bool
}

// NewReceiver creates a new webhook receiver instance.
func NewReceiver(pool *pgxpool.Pool, auditLogger *audit.Logger, secret string, strictMode bool) *Receiver {
	return &Receiver{
		pool:        pool,
		auditLogger: auditLogger,
		secret:      secret,
		strictMode:  strictMode,
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

	// 1. Signature Verification
	if rec.secret != "" {
		valid := VerifySignature(bodyBytes, signature, rec.secret)
		if !valid {
			log.Printf("webhook: invalid HMAC signature received: %s", signature)
			if rec.strictMode {
				_ = rec.auditLogger.Log(r.Context(), audit.Entry{
					CorrelationID: correlationID,
					ToolName:      "webhook_razorpay",
					Input:         map[string]string{"signature": signature},
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

	// 2. Parse Event Payload
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

	var newStatus string
	switch event.Event {
	case "payment.captured", "order.paid":
		newStatus = "paid"
	case "payment.failed":
		newStatus = "failed"
	default:
		newStatus = "created"
	}

	// 3. Update order in PostgreSQL
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

	// 4. Record Audit Log
	_ = rec.auditLogger.Log(r.Context(), audit.Entry{
		CorrelationID: correlationID,
		ToolName:      "webhook_razorpay",
		Input:         map[string]any{"event": event.Event, "order_id": orderID, "payment_id": paymentID},
		Decision:      newStatus,
		ReasonCode:    event.Event,
		Output:        map[string]string{"status": "ok", "applied_status": newStatus},
		DurationMs:    time.Since(start).Milliseconds(),
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}
