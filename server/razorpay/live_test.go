package razorpay

import (
	"context"
	"testing"

	"github.com/sohampawar1866/merchant-mcp/server/config"
)

func TestRazorpay_LiveAPITestMode(t *testing.T) {
	cfg := config.Load()
	if cfg.RazorpayKeyID == "" || cfg.RazorpayKeySecret == "" {
		t.Skip("Razorpay credentials not set, skipping live API test")
		return
	}

	client := NewClient(cfg.RazorpayKeyID, cfg.RazorpayKeySecret)
	ctx := context.Background()

	// 1. Test live test-mode Order creation
	order, err := client.CreateOrder(ctx, CreateOrderRequest{
		Amount:   165000, // ₹1,650.00
		Currency: "INR",
		Receipt:  "test_receipt_live_1",
	})
	if err != nil {
		t.Fatalf("Live Razorpay Order creation failed: %v", err)
	}

	t.Logf("✓ Live Razorpay Order Created Successfully! ID: %s, Amount: %d paise", order.ID, order.Amount)

	// 2. Test live test-mode Payment Link creation (Standard Payment Link)
	link, err := client.CreatePaymentLink(ctx, CreatePaymentLinkRequest{
		Amount:      165000,
		Currency:    "INR",
		Description: "Live Test: AirBass X2 Pro Earbuds",
		UPILink:     false,
	})
	if err != nil {
		t.Fatalf("Live Razorpay Payment Link creation failed: %v", err)
	}

	t.Logf("✓ Live Razorpay Payment Link Created Successfully! ID: %s, URL: %s", link.ID, link.ShortURL)
}
