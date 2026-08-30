package razorpay

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClient_MissingCredentialsValidation(t *testing.T) {
	client := NewClient("", "")
	ctx := context.Background()

	_, err := client.CreateOrder(ctx, CreateOrderRequest{
		Amount:   179900,
		Currency: "INR",
		Receipt:  "rcpt_123",
	})
	if err == nil {
		t.Fatal("expected error when credentials are missing, got nil")
	}

	_, err = client.CreatePaymentLink(ctx, CreatePaymentLinkRequest{
		Amount:      179900,
		Description: "AirBass Earbuds",
	})
	if err == nil {
		t.Fatal("expected error when credentials are missing for payment link, got nil")
	}
}

func TestClient_HTTPBasicAuthAndPayload(t *testing.T) {
	expectedKeyID := "rzp_test_key123"
	expectedSecret := "secret456"

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, pass, ok := r.BasicAuth()
		if !ok || user != expectedKeyID || pass != expectedSecret {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		if r.URL.Path == "/orders" {
			var req CreateOrderRequest
			_ = json.NewDecoder(r.Body).Decode(&req)
			resp := OrderResponse{
				ID:       "order_live_123",
				Amount:   req.Amount,
				Currency: "INR",
				Status:   "created",
				Receipt:  req.Receipt,
			}
			w.WriteHeader(http.StatusOK)
			_ = json.NewEncoder(w).Encode(resp)
			return
		}

		if r.URL.Path == "/payment_links" {
			var payload map[string]any
			_ = json.NewDecoder(r.Body).Decode(&payload)
			resp := PaymentLinkResponse{
				ID:       "plink_live_123",
				ShortURL: "https://rzp.io/rzp/testlink",
				Status:   "created",
				Amount:   179900,
				Currency: "INR",
			}
			w.WriteHeader(http.StatusOK)
			_ = json.NewEncoder(w).Encode(resp)
			return
		}

		w.WriteHeader(http.StatusNotFound)
	}))
	defer server.Close()

	client := NewClient(expectedKeyID, expectedSecret)
	client.baseURL = server.URL // Override for mock server

	ctx := context.Background()
	order, err := client.CreateOrder(ctx, CreateOrderRequest{
		Amount:  165000,
		Receipt: "test_receipt",
	})
	if err != nil {
		t.Fatalf("failed to create order against mock server: %v", err)
	}
	if order.ID != "order_live_123" || order.Amount != 165000 {
		t.Errorf("unexpected order response: %+v", order)
	}

	link, err := client.CreatePaymentLink(ctx, CreatePaymentLinkRequest{
		Amount:      179900,
		Description: "Test Link",
	})
	if err != nil {
		t.Fatalf("failed to create payment link against mock server: %v", err)
	}
	if link.ID != "plink_live_123" || link.ShortURL != "https://rzp.io/rzp/testlink" {
		t.Errorf("unexpected payment link response: %+v", link)
	}
}
