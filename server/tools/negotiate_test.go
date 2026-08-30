package tools

import (
	"context"
	"encoding/json"
	"os"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/sohampawar1866/merchant-mcp/server/audit"
	"github.com/sohampawar1866/merchant-mcp/server/config"
	"github.com/sohampawar1866/merchant-mcp/server/db"
)

func TestNegotiate_DeliberateFailureCase_BelowFloor(t *testing.T) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://agentic:agentic@localhost:5432/agentic_checkout?sslmode=disable"
	}

	ctx := context.Background()
	pool, err := db.NewPool(ctx, dbURL)
	if err != nil {
		t.Skipf("Database unavailable: %v", err)
		return
	}
	defer pool.Close()

	_ = db.RunMigrations(ctx, pool)
	_ = db.AutoSeed(ctx, pool, "../../data/catalog.seed.json")

	cfg := config.Load()
	auditLogger := audit.NewLogger(pool, "full")
	handler := handleNegotiateOffer(pool, auditLogger, cfg)

	// AirBass X2 Pro: base_price = 179900 (₹1,799), floor_price = 149900 (₹1,499)
	productID := "11111111-1111-1111-1111-111111111111"
	sessionID := "deliberate-failure-session-" + uuid.New().String()

	// Propose ₹1,000 (100000 paise) -> Below floor!
	req := mcp.CallToolRequest{
		Params: mcp.CallToolParams{
			Name: "negotiate_offer",
			Arguments: map[string]any{
				"product_id":       productID,
				"proposed_price":   100000,
				"agent_session_id": sessionID,
			},
		},
	}

	res, err := handler(ctx, req)
	if err != nil {
		t.Fatalf("handler execution error: %v", err)
	}
	if res.IsError {
		t.Fatalf("expected structured tool outcome, got error: %v", res.Content)
	}

	textContent := res.Content[0].(mcp.TextContent).Text

	// ZERO-LEAKAGE ASSERTION: floor_price must NEVER be exposed
	if strings.Contains(textContent, "floor_price") {
		t.Fatalf("CRITICAL SECURITY VIOLATION: negotiate_offer leaked 'floor_price'!\nPayload: %s", textContent)
	}

	var negResp NegotiateOfferResponse
	if err := json.Unmarshal([]byte(textContent), &negResp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if negResp.Decision != "rejected" {
		t.Errorf("expected decision 'rejected', got '%s'", negResp.Decision)
	}
	if negResp.ReasonCode != "BELOW_FLOOR" {
		t.Errorf("expected reason_code 'BELOW_FLOOR', got '%s'", negResp.ReasonCode)
	}
	if negResp.CounterOffer <= 149900 {
		t.Errorf("expected counter_offer > floor_price (149900), got %d", negResp.CounterOffer)
	}
	if negResp.Attempt != 1 {
		t.Errorf("expected attempt 1, got %d", negResp.Attempt)
	}
}

func TestNegotiate_StepLadder_And_Lockout(t *testing.T) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://agentic:agentic@localhost:5432/agentic_checkout?sslmode=disable"
	}

	ctx := context.Background()
	pool, err := db.NewPool(ctx, dbURL)
	if err != nil {
		t.Skipf("Database unavailable: %v", err)
		return
	}
	defer pool.Close()

	_ = db.RunMigrations(ctx, pool)
	_ = db.AutoSeed(ctx, pool, "../../data/catalog.seed.json")

	cfg := config.Load()
	cfg.MaxNegotiationAttempts = 3
	auditLogger := audit.NewLogger(pool, "full")
	handler := handleNegotiateOffer(pool, auditLogger, cfg)

	productID := "11111111-1111-1111-1111-111111111111"
	sessionID := "ladder-session-" + uuid.New().String()

	makeAttempt := func(attemptNum int) NegotiateOfferResponse {
		req := mcp.CallToolRequest{
			Params: mcp.CallToolParams{
				Name: "negotiate_offer",
				Arguments: map[string]any{
					"product_id":       productID,
					"proposed_price":   100000, // Below floor every time
					"agent_session_id": sessionID,
				},
			},
		}
		res, err := handler(ctx, req)
		if err != nil {
			t.Fatalf("attempt %d handler error: %v", attemptNum, err)
		}
		textContent := res.Content[0].(mcp.TextContent).Text
		var r NegotiateOfferResponse
		if err := json.Unmarshal([]byte(textContent), &r); err != nil {
			t.Fatalf("attempt %d unmarshal error: %v", attemptNum, err)
		}
		return r
	}

	// Attempt 1
	r1 := makeAttempt(1)
	if r1.Decision != "rejected" || r1.ReasonCode != "BELOW_FLOOR" || r1.Attempt != 1 {
		t.Fatalf("attempt 1 mismatch: %+v", r1)
	}

	// Attempt 2
	r2 := makeAttempt(2)
	if r2.Decision != "rejected" || r2.ReasonCode != "BELOW_FLOOR" || r2.Attempt != 2 {
		t.Fatalf("attempt 2 mismatch: %+v", r2)
	}
	if r2.CounterOffer >= r1.CounterOffer {
		t.Fatalf("attempt 2 counter (%d) should be lower than attempt 1 (%d)", r2.CounterOffer, r1.CounterOffer)
	}

	// Attempt 3 (Final attempt)
	r3 := makeAttempt(3)
	if r3.Decision != "rejected" || r3.ReasonCode != "BELOW_FLOOR" || r3.Attempt != 3 {
		t.Fatalf("attempt 3 mismatch: %+v", r3)
	}
	if r3.CounterOffer != 149900 { // effective floor
		t.Fatalf("attempt 3 counter should be at floor 149900, got %d", r3.CounterOffer)
	}

	// Attempt 4 (Exceeded max attempts)
	r4 := makeAttempt(4)
	if r4.Decision != "rejected" || r4.ReasonCode != "MAX_ATTEMPTS_EXCEEDED" {
		t.Fatalf("attempt 4 should be MAX_ATTEMPTS_EXCEEDED, got %+v", r4)
	}
}

func TestNegotiate_ApprovedWithinBounds(t *testing.T) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://agentic:agentic@localhost:5432/agentic_checkout?sslmode=disable"
	}

	ctx := context.Background()
	pool, err := db.NewPool(ctx, dbURL)
	if err != nil {
		t.Skipf("Database unavailable: %v", err)
		return
	}
	defer pool.Close()

	_ = db.RunMigrations(ctx, pool)
	_ = db.AutoSeed(ctx, pool, "../../data/catalog.seed.json")

	cfg := config.Load()
	auditLogger := audit.NewLogger(pool, "full")
	handler := handleNegotiateOffer(pool, auditLogger, cfg)

	productID := "11111111-1111-1111-1111-111111111111"
	sessionID := "approved-session-" + uuid.New().String()

	// Propose ₹1,650 (165000 paise) -> Within floor (149900) and base (179900)
	req := mcp.CallToolRequest{
		Params: mcp.CallToolParams{
			Name: "negotiate_offer",
			Arguments: map[string]any{
				"product_id":       productID,
				"proposed_price":   165000,
				"agent_session_id": sessionID,
			},
		},
	}

	res, err := handler(ctx, req)
	if err != nil {
		t.Fatalf("handler error: %v", err)
	}

	textContent := res.Content[0].(mcp.TextContent).Text
	var r NegotiateOfferResponse
	if err := json.Unmarshal([]byte(textContent), &r); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}

	if r.Decision != "approved" || r.ReasonCode != "WITHIN_BOUNDS" || r.FinalPrice != 165000 {
		t.Fatalf("expected approved at 165000 paise, got %+v", r)
	}

	// Verify row in negotiations table
	var recordedDecision, recordedReason string
	var recordedPrice int
	query := `SELECT decision, reason_code, proposed_price FROM negotiations WHERE product_id = $1 AND agent_session_id = $2;`
	err = pool.QueryRow(ctx, query, productID, sessionID).Scan(&recordedDecision, &recordedReason, &recordedPrice)
	if err != nil {
		t.Fatalf("failed to query negotiations row: %v", err)
	}

	if recordedDecision != "approved" || recordedReason != "WITHIN_BOUNDS" || recordedPrice != 165000 {
		t.Fatalf("negotiations record mismatch: got (%s, %s, %d)", recordedDecision, recordedReason, recordedPrice)
	}
}
