package tools

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"github.com/sohampawar1866/merchant-mcp/server/audit"
	"github.com/sohampawar1866/merchant-mcp/server/config"
	"github.com/sohampawar1866/merchant-mcp/server/wallet"
)

// RegisterWalletTools registers autonomous agent wallet MCP tools.
func RegisterWalletTools(
	s *server.MCPServer,
	pool *pgxpool.Pool,
	auditLogger *audit.Logger,
	cfg *config.Config,
) {
	walletBalanceTool := mcp.NewTool(
		"get_agent_wallet_balance",
		mcp.WithDescription("Inspects the autonomous AI buyer's delegated wallet balance, per-transaction spending caps, remaining monthly allowance, and category whitelists (NPCI UPI Circle / AP2 model)."),
		mcp.WithString("agent_id", mcp.Description("Optional unique identifier of the AI agent (default: 'claude-buyer-01')")),
	)
	s.AddTool(walletBalanceTool, handleGetAgentWalletBalance(pool, auditLogger, cfg))
}

func handleGetAgentWalletBalance(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		agentID := request.GetString("agent_id", "claude-buyer-01")

		w, err := wallet.GetOrCreateWallet(ctx, pool, agentID)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to query agent wallet: %v", err)), nil
		}

		resp := map[string]any{
			"agent_id":                   w.AgentID,
			"status":                     w.Status,
			"balance_paise":              w.BalancePaise,
			"balance_inr":                fmt.Sprintf("₹%.2f", float64(w.BalancePaise)/100.0),
			"per_transaction_cap_paise":  w.PerTransactionCapPaise,
			"per_transaction_cap_inr":    fmt.Sprintf("₹%.2f", float64(w.PerTransactionCapPaise)/100.0),
			"monthly_allowance_paise":    w.MonthlyAllowancePaise,
			"monthly_spent_paise":        w.MonthlySpentPaise,
			"monthly_remaining_inr":      fmt.Sprintf("₹%.2f", float64(w.MonthlyAllowancePaise-w.MonthlySpentPaise)/100.0),
			"whitelisted_categories":     w.WhitelistedCategories,
			"delegated_protocol":         "NPCI UPI Circle / AP2 Delegated Mandate",
		}

		respBytes, _ := json.Marshal(resp)
		return mcp.NewToolResultText(string(respBytes)), nil
	}
}
