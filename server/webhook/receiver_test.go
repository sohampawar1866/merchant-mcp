package webhook

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/sohampawar1866/merchant-mcp/server/audit"
)

func TestWebhook_ValidHMACSignature(t *testing.T) {
	secret := "test_secret_12345"
	auditLogger := audit.NewLogger(nil, "full")
	receiver := NewReceiverForTest(auditLogger, secret, true, "test_passphrase")

	payload := []byte(`{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test_999","order_id":"order_test_999","status":"captured","amount":165000}}}}`)

	// Compute valid HMAC
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	validSignature := hex.EncodeToString(mac.Sum(nil))

	req := httptest.NewRequest("POST", "/webhook/razorpay?merchant_id=00000000-0000-0000-0000-000000000001", bytes.NewReader(payload))
	req.Header.Set("X-Razorpay-Signature", validSignature)
	w := httptest.NewRecorder()

	receiver.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected HTTP 200 for valid signature, got: %d (%s)", w.Code, w.Body.String())
	}
}

func TestWebhook_InvalidHMACSignature_StrictMode(t *testing.T) {
	secret := "test_secret_12345"
	auditLogger := audit.NewLogger(nil, "full")
	receiver := NewReceiverForTest(auditLogger, secret, true, "test_passphrase") // strict mode = true

	payload := []byte(`{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_bad","order_id":"order_bad","status":"captured","amount":100}}}}`)

	req := httptest.NewRequest("POST", "/webhook/razorpay?merchant_id=00000000-0000-0000-0000-000000000001", bytes.NewReader(payload))
	req.Header.Set("X-Razorpay-Signature", "invalid_forged_signature_hex")
	w := httptest.NewRecorder()

	receiver.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected HTTP 400 for invalid signature in strict mode, got: %d", w.Code)
	}
}
