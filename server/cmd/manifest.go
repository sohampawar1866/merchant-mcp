package main

import (
	"encoding/json"
	"net/http"
)

// AgentManifest represents an NPCI UAP / AP2 compliant machine discovery manifest.
type AgentManifest struct {
	SchemaVersion       string                 `json:"schema_version"`
	Platform            string                 `json:"platform"`
	ProtocolCompliance  []string               `json:"protocol_compliance"`
	MerchantGatewayURL  string                 `json:"merchant_gateway_url"`
	MCPDiscoveryURL     string                 `json:"mcp_discovery_url"`
	AutonomousMandates  map[string]any         `json:"autonomous_mandates"`
	SupportedCapabilities []string             `json:"supported_capabilities"`
	Security            map[string]any         `json:"security"`
}

func handleAgentManifest(w http.ResponseWriter, r *http.Request) {
	manifest := AgentManifest{
		SchemaVersion: "2026-03-01",
		Platform:      "AgenticCheckout Autonomous Commerce Clearinghouse",
		ProtocolCompliance: []string{
			"NPCI Unified Agent Protocol (UAP v1.0)",
			"FIDO Agent Payments Protocol (AP2)",
			"Model Context Protocol (MCP 2024-11-05 / StreamableHTTP)",
		},
		MerchantGatewayURL: "http://localhost:8080/mcp",
		MCPDiscoveryURL:    "http://localhost:8080/.well-known/mcp.json",
		AutonomousMandates: map[string]any{
			"model":                     "NPCI UPI Circle / Pre-Funded Double-Entry Ledger",
			"default_monthly_allowance": "₹15,000.00",
			"per_transaction_cap":       "₹2,000.00",
			"step_up_2fa_rail":          "Razorpay Payment Links / UPI AutoPay",
		},
		SupportedCapabilities: []string{
			"catalog_semantic_search",
			"multi_turn_bargaining_ladder",
			"multi_product_cart_sessions",
			"ai_growth_dynamic_bundling",
			"zero_click_autonomous_wallet_debit",
			"human_in_the_loop_step_up_2fa",
			"realtime_razorpay_settlement_polling",
			"tenant_cryptographic_vault_pgcrypto",
		},
		Security: map[string]any{
			"margin_firewall":      "Zero Margin Leakage (Floor Prices Structurally Omitted)",
			"arithmetic_precision": "64-bit Integer Paise Math (Zero Floating-Point Drift)",
			"vault_encryption":     "PostgreSQL pgcrypto Symmetric Vault (Zero Plaintext Secrets)",
			"kill_switch":          "Sub-10ms Cross-Store Tenant Suspension",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	_ = json.NewEncoder(w).Encode(manifest)
}

func handleMCPManifest(w http.ResponseWriter, r *http.Request) {
	mcpDiscovery := map[string]any{
		"mcpServers": map[string]any{
			"agentic-checkout": map[string]any{
				"url":       "http://localhost:8080/mcp",
				"transport": "streamablehttp",
				"tools": []string{
					"search_catalog",
					"get_product_details",
					"find_and_price",
					"negotiate_offer",
					"create_cart",
					"add_to_cart",
					"remove_from_cart",
					"view_cart",
					"negotiate_cart_bundle",
					"get_upsell_bundle",
					"get_agent_wallet_balance",
					"checkout_cart",
					"create_checkout",
					"check_order_status",
				},
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	_ = json.NewEncoder(w).Encode(mcpDiscovery)
}
