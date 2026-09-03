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

func TestMultiTenant_IsolationAndKillSwitch(t *testing.T) {
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

	// Apply migrations
	_ = db.RunMigrations(ctx, pool)

	// Seed Demo 1 and Demo 2
	_ = db.SeedMerchantCatalog(ctx, pool, "00000000-0000-0000-0000-000000000001", "../../data/catalog.seed.json")
	_ = db.SeedMerchantCatalog(ctx, pool, "00000000-0000-0000-0000-000000000002", "../../data/catalog.demo2.seed.json")

	cfg := config.Load()
	auditLogger := audit.NewLogger(pool, "full")

	searchHandler := handleSearchCatalog(pool, auditLogger, cfg)

	// ─────────────────────────────────────────────────────────────
	// TEST 1: Tenant Isolation - Query Store 1 vs Store 2
	// ─────────────────────────────────────────────────────────────
	reqStore1 := mcp.CallToolRequest{
		Params: mcp.CallToolParams{
			Name: "search_catalog",
			Arguments: map[string]any{
				"merchant_api_key": "demo-key-1",
				"query":            "",
			},
		},
	}

	res1, err := searchHandler(ctx, reqStore1)
	if err != nil || res1.IsError {
		t.Fatalf("Store 1 search failed: %v", res1.Content)
	}

	var data1 SearchCatalogResponse
	_ = json.Unmarshal([]byte(res1.Content[0].(mcp.TextContent).Text), &data1)

	for _, p := range data1.Results {
		if strings.Contains(p.Name, "NomadCanvas") || strings.Contains(p.Name, "ThermoVessel") {
			t.Fatalf("TENANT ISOLATION FAILURE: Store 1 leaked Store 2 item '%s'", p.Name)
		}
	}
	t.Logf("✓ Tenant Isolation Verified: Store 1 returned %d products, 0 Store 2 items", len(data1.Results))

	reqStore2 := mcp.CallToolRequest{
		Params: mcp.CallToolParams{
			Name: "search_catalog",
			Arguments: map[string]any{
				"merchant_api_key": "demo-key-2",
				"query":            "",
			},
		},
	}

	res2, err := searchHandler(ctx, reqStore2)
	if err != nil || res2.IsError {
		t.Fatalf("Store 2 search failed: %v", res2.Content)
	}

	var data2 SearchCatalogResponse
	_ = json.Unmarshal([]byte(res2.Content[0].(mcp.TextContent).Text), &data2)

	for _, p := range data2.Results {
		if strings.Contains(p.Name, "AirBass") || strings.Contains(p.Name, "ClearTone") {
			t.Fatalf("TENANT ISOLATION FAILURE: Store 2 leaked Store 1 item '%s'", p.Name)
		}
	}
	t.Logf("✓ Tenant Isolation Verified: Store 2 returned %d products, 0 Store 1 items", len(data2.Results))

	// ─────────────────────────────────────────────────────────────
	// TEST 2: Platform Kill Switch - Suspend & Reactivate Store 2
	// ─────────────────────────────────────────────────────────────
	t.Log("Activating Platform Kill Switch on Demo Store 2...")
	err = db.UpdateMerchantStatus(ctx, pool, "00000000-0000-0000-0000-000000000002", "suspended")
	if err != nil {
		t.Fatalf("Failed to suspend merchant: %v", err)
	}

	// Tool call on suspended store should be immediately rejected
	resSuspended, _ := searchHandler(ctx, reqStore2)
	if !resSuspended.IsError {
		t.Fatalf("KILL SWITCH FAILURE: Expected tool to be blocked when store is suspended, got success")
	}
	errorMsg := resSuspended.Content[0].(mcp.TextContent).Text
	if !strings.Contains(errorMsg, "MERCHANT_SUSPENDED") {
		t.Fatalf("KILL SWITCH FAILURE: Expected MERCHANT_SUSPENDED error, got: %s", errorMsg)
	}
	t.Logf("✓ Platform Kill Switch Verified: Tool invocation blocked with '%s'", errorMsg)

	// Tool call on Store 1 should still succeed uninterrupted
	resStore1Alive, err := searchHandler(ctx, reqStore1)
	if err != nil || resStore1Alive.IsError {
		t.Fatalf("Collateral damage failure: Store 1 was affected by Store 2 suspension")
	}
	t.Log("✓ Store 1 remains operational while Store 2 is suspended")

	// Reactivate Store 2
	_ = db.UpdateMerchantStatus(ctx, pool, "00000000-0000-0000-0000-000000000002", "active")
	resReactivated, _ := searchHandler(ctx, reqStore2)
	if resReactivated.IsError {
		t.Fatalf("Reactivation failed: Store 2 still blocked after reactivation")
	}
	t.Log("✓ Store 2 reactivated successfully")
}
