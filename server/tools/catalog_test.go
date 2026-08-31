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

func TestSearchCatalog_ZeroLeakageAndResults(t *testing.T) {
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
	handler := handleSearchCatalog(pool, auditLogger, cfg)

	// Test 1: Search query for earbuds
	req := mcp.CallToolRequest{
		Params: mcp.CallToolParams{
			Name: "search_catalog",
			Arguments: map[string]any{
				"merchant_api_key": "demo-key-1",
				"query":            "earbuds",
				"limit":            5,
			},
		},
	}

	res, err := handler(ctx, req)
	if err != nil {
		t.Fatalf("search_catalog handler failed: %v", err)
	}
	if res.IsError {
		t.Fatalf("expected success, got tool error: %v", res.Content)
	}

	textContent := res.Content[0].(mcp.TextContent).Text

	// ZERO-LEAKAGE ASSERTION 1: Substring inspection
	if strings.Contains(textContent, "floor_price") {
		t.Fatalf("CRITICAL SECURITY VIOLATION: search_catalog output leaks 'floor_price'!\nPayload: %s", textContent)
	}
	if strings.Contains(textContent, "margin") {
		t.Fatalf("CRITICAL SECURITY VIOLATION: search_catalog output leaks 'margin'!\nPayload: %s", textContent)
	}

	// ZERO-LEAKAGE ASSERTION 2: Structural JSON Unmarshal verification
	var rawMaps []map[string]any
	var searchResp SearchCatalogResponse
	if err := json.Unmarshal([]byte(textContent), &searchResp); err != nil {
		t.Fatalf("failed to unmarshal SearchCatalogResponse: %v", err)
	}

	// Also unmarshal into arbitrary map to ensure the field wasn't just ignored by Go's struct unmarshaler
	var fullResponseMap map[string]any
	_ = json.Unmarshal([]byte(textContent), &fullResponseMap)
	if results, ok := fullResponseMap["results"].([]any); ok {
		for _, item := range results {
			if itemMap, ok := item.(map[string]any); ok {
				if _, hasFloor := itemMap["floor_price"]; hasFloor {
					t.Fatalf("CRITICAL SECURITY VIOLATION: raw JSON item has 'floor_price' key: %+v", itemMap)
				}
				rawMaps = append(rawMaps, itemMap)
			}
		}
	}

	if len(searchResp.Results) == 0 {
		t.Fatalf("expected at least 1 search result for 'earbuds', got 0")
	}

	foundAirBass := false
	for _, p := range searchResp.Results {
		if strings.Contains(strings.ToLower(p.Name), "airbass") {
			foundAirBass = true
		}
		if p.Price <= 0 {
			t.Errorf("expected positive price in paise, got %d", p.Price)
		}
	}
	if !foundAirBass {
		t.Errorf("expected AirBass earbuds in search results")
	}
}

func TestSearchCatalog_CategoryAndPriceFilter(t *testing.T) {
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
	handler := handleSearchCatalog(pool, auditLogger, cfg)

	// Filter by Category = 'Wearables' and max_price = 200000 (₹2,000)
	req := mcp.CallToolRequest{
		Params: mcp.CallToolParams{
			Name: "search_catalog",
			Arguments: map[string]any{
				"merchant_api_key": "demo-key-1",
				"category":         "Wearables",
				"max_price":        200000,
			},
		},
	}

	res, err := handler(ctx, req)
	if err != nil {
		t.Fatalf("handler error: %v", err)
	}

	textContent := res.Content[0].(mcp.TextContent).Text
	var searchResp SearchCatalogResponse
	if err := json.Unmarshal([]byte(textContent), &searchResp); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}

	for _, p := range searchResp.Results {
		if p.Category != "Wearables" {
			t.Errorf("expected Category 'Wearables', got '%s'", p.Category)
		}
		if p.Price > 200000 {
			t.Errorf("expected price <= 200000 paise, got %d", p.Price)
		}
	}
}

func TestGetProductDetails_ZeroLeakageAndLookup(t *testing.T) {
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
	handler := handleGetProductDetails(pool, auditLogger, cfg)

	// Known static seed ID
	targetID := "11111111-1111-1111-1111-111111111111"
	req := mcp.CallToolRequest{
		Params: mcp.CallToolParams{
			Name: "get_product_details",
			Arguments: map[string]any{
				"merchant_api_key": "demo-key-1",
				"product_id":       targetID,
			},
		},
	}

	res, err := handler(ctx, req)
	if err != nil {
		t.Fatalf("get_product_details handler error: %v", err)
	}
	if res.IsError {
		t.Fatalf("expected success, got error: %v", res.Content)
	}

	textContent := res.Content[0].(mcp.TextContent).Text

	// ZERO-LEAKAGE ASSERTION 2: Substring inspection
	if strings.Contains(textContent, "floor_price") {
		t.Fatalf("CRITICAL SECURITY VIOLATION: get_product_details output leaks 'floor_price'!\nPayload: %s", textContent)
	}

	var product PublicProduct
	if err := json.Unmarshal([]byte(textContent), &product); err != nil {
		t.Fatalf("failed to parse product: %v", err)
	}

	if product.ID != targetID {
		t.Errorf("expected product ID %s, got %s", targetID, product.ID)
	}
	if product.Name != "AirBass X2 Pro Wireless Earbuds" {
		t.Errorf("unexpected product name: %s", product.Name)
	}
	if product.Price != 179900 {
		t.Errorf("expected price 179900 paise, got %d", product.Price)
	}
}

func TestGetProductDetails_NotFound(t *testing.T) {
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

	cfg := config.Load()
	auditLogger := audit.NewLogger(pool, "full")
	handler := handleGetProductDetails(pool, auditLogger, cfg)

	req := mcp.CallToolRequest{
		Params: mcp.CallToolParams{
			Name: "get_product_details",
			Arguments: map[string]any{
				"merchant_api_key": "demo-key-1",
				"product_id":       "00000000-0000-0000-0000-000000000000",
			},
		},
	}

	res, err := handler(ctx, req)
	if err != nil {
		t.Fatalf("expected nil transport error, got: %v", err)
	}
	if !res.IsError {
		t.Fatalf("expected isError=true for non-existent product, got false")
	}
}
