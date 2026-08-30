package tools

import (
	"context"
	"encoding/json"
	"os"
	"strings"
	"testing"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/sohampawar1866/merchant-mcp/server/audit"
	"github.com/sohampawar1866/merchant-mcp/server/config"
	"github.com/sohampawar1866/merchant-mcp/server/db"
)

func TestFindAndPrice_BudgetParsing(t *testing.T) {
	tests := []struct {
		intent         string
		expectedBudget int
	}{
		{"earbuds under 2000 rupees, good bass", 200000},
		{"smartwatch below ₹4,000 with amoled", 400000},
		{"mechanical keyboard within 6000", 600000},
		{"fast charger under 1500", 150000},
		{"random product with no budget", 0},
	}

	for _, tt := range tests {
		budget, _ := parseIntentBudget(tt.intent)
		if budget != tt.expectedBudget {
			t.Errorf("intent '%s': expected budget %d paise, got %d", tt.intent, tt.expectedBudget, budget)
		}
	}
}

func TestFindAndPrice_ZeroLeakageAndResults(t *testing.T) {
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
	handler := handleFindAndPrice(pool, auditLogger, cfg)

	req := mcp.CallToolRequest{
		Params: mcp.CallToolParams{
			Name: "find_and_price",
			Arguments: map[string]any{
				"intent": "earbuds under 2000 rupees with anc",
			},
		},
	}

	res, err := handler(ctx, req)
	if err != nil {
		t.Fatalf("find_and_price error: %v", err)
	}
	if res.IsError {
		t.Fatalf("expected success, got error: %v", res.Content)
	}

	textContent := res.Content[0].(mcp.TextContent).Text

	// ZERO-LEAKAGE GUARANTEE ASSERTION
	if strings.Contains(textContent, "floor_price") {
		t.Fatalf("CRITICAL SECURITY VIOLATION: find_and_price leaked 'floor_price'!\nPayload: %s", textContent)
	}

	var resp FindAndPriceResponse
	if err := json.Unmarshal([]byte(textContent), &resp); err != nil {
		t.Fatalf("failed to unmarshal find_and_price response: %v", err)
	}

	if resp.TotalMatches == 0 {
		t.Fatalf("expected matches for earbuds under 2000, got 0")
	}

	for _, opt := range resp.Options {
		if opt.Price > 200000 {
			t.Errorf("option %s price %d exceeds requested budget of 200000 paise", opt.Name, opt.Price)
		}
		if opt.MatchReason == "" {
			t.Errorf("expected match reason for %s", opt.Name)
		}
	}
}
