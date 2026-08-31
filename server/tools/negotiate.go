package tools

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"github.com/sohampawar1866/merchant-mcp/server/audit"
	"github.com/sohampawar1866/merchant-mcp/server/config"
	"github.com/sohampawar1866/merchant-mcp/server/db"
	"github.com/sohampawar1866/merchant-mcp/server/pricing"
)

// NegotiateOfferResponse defines the structured outcome returned to the AI buyer agent.
// Crucially, internal fields such as floor_price or calculation formulas are NEVER returned.
type NegotiateOfferResponse struct {
	Decision     string `json:"decision"` // "approved", "rejected", "pending_approval"
	ReasonCode   string `json:"reason_code"`
	FinalPrice   int    `json:"final_price,omitempty"`   // in paise (if approved or pending)
	CounterOffer int    `json:"counter_offer,omitempty"` // in paise (if rejected with counter-offer)
	Attempt      int    `json:"attempt_number"`
	MaxAttempts  int    `json:"max_attempts"`
}

// RegisterNegotiateTool registers the negotiate_offer tool on the MCP server.
func RegisterNegotiateTool(s *server.MCPServer, pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) {
	negotiateTool := mcp.NewTool(
		"negotiate_offer",
		mcp.WithDescription("Propose a negotiated price offer for a specific product. Evaluated by a bounded, deterministic rules engine (approval-gated)."),
		mcp.WithString("product_id",
			mcp.Required(),
			mcp.Description("The UUID of the product you want to negotiate price for"),
		),
		mcp.WithNumber("proposed_price",
			mcp.Required(),
			mcp.Description("Your proposed purchase price in INR paise (e.g. 150000 for ₹1,500.00)"),
		),
		mcp.WithString("agent_session_id",
			mcp.Description("Optional session identifier for tracking negotiation history and attempt counts"),
		),
	)

	s.AddTool(negotiateTool, handleNegotiateOffer(pool, auditLogger, cfg))
}

func handleNegotiateOffer(pool *pgxpool.Pool, auditLogger *audit.Logger, cfg *config.Config) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		start := time.Now()
		correlationID := uuid.New()

		productID, err := request.RequireString("product_id")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: product_id"), nil
		}

		proposedPrice, err := request.RequireInt("proposed_price")
		if err != nil {
			return mcp.NewToolResultError("missing or invalid parameter: proposed_price (must be integer paise)"), nil
		}

		sessionID := request.GetString("agent_session_id", "default-session")
		if sessionID == "" {
			sessionID = "default-session"
		}

		inputArgs := map[string]any{
			"product_id":       productID,
			"proposed_price":   proposedPrice,
			"agent_session_id": sessionID,
		}

		if pool == nil {
			return mcp.NewToolResultError("database connection unavailable"), nil
		}

		// 0. Dynamic feature check: Is negotiation enabled live?
		if !db.GetSettingBool(ctx, pool, "enable_negotiation", cfg.EnableNegotiation) {
			resp := NegotiateOfferResponse{
				Decision:    "rejected",
				ReasonCode:  "NEGOTIATION_DISABLED",
				Attempt:     1,
				MaxAttempts: db.GetSettingInt(ctx, pool, "max_negotiation_attempts", cfg.MaxNegotiationAttempts),
			}
			respBytes, _ := json.Marshal(resp)
			_ = auditLogger.Log(ctx, audit.Entry{
				CorrelationID: correlationID,
				ToolName:      "negotiate_offer",
				Input:         inputArgs,
				Decision:      "rejected",
				ReasonCode:    "NEGOTIATION_DISABLED",
				Output:        resp,
				DurationMs:    time.Since(start).Milliseconds(),
			})
			return mcp.NewToolResultText(string(respBytes)), nil
		}

		maxAttempts := db.GetSettingInt(ctx, pool, "max_negotiation_attempts", cfg.MaxNegotiationAttempts)
		requireHumanReview := db.GetSettingBool(ctx, pool, "enable_human_approval", cfg.EnableHumanApproval)

		// 1. Fetch internal product pricing and stock (backend internal only - never exposed to client)
		var basePrice, floorPrice, stock int
		var productName string

		query := `SELECT name, base_price, floor_price, stock FROM products WHERE id = $1;`
		err = pool.QueryRow(ctx, query, productID).Scan(&productName, &basePrice, &floorPrice, &stock)
		if err != nil {
			if err == pgx.ErrNoRows {
				_ = auditLogger.Log(ctx, audit.Entry{
					CorrelationID: correlationID,
					ToolName:      "negotiate_offer",
					Input:         inputArgs,
					Decision:      "rejected",
					ReasonCode:    "PRODUCT_NOT_FOUND",
					DurationMs:    time.Since(start).Milliseconds(),
				})
				return mcp.NewToolResultError(fmt.Sprintf("product not found with id: %s", productID)), nil
			}

			errOutput := fmt.Sprintf("database query failed: %v", err)
			_ = auditLogger.Log(ctx, audit.Entry{
				CorrelationID: correlationID,
				ToolName:      "negotiate_offer",
				Input:         inputArgs,
				Decision:      "rejected",
				ErrorMessage:  errOutput,
				DurationMs:    time.Since(start).Milliseconds(),
			})
			return mcp.NewToolResultError(errOutput), nil
		}

		// 2. Check stock availability
		if stock <= 0 {
			resp := NegotiateOfferResponse{
				Decision:    "rejected",
				ReasonCode:  "PRODUCT_OUT_OF_STOCK",
				Attempt:     1,
				MaxAttempts: maxAttempts,
			}
			respBytes, _ := json.Marshal(resp)

			_ = auditLogger.Log(ctx, audit.Entry{
				CorrelationID: correlationID,
				ToolName:      "negotiate_offer",
				Input:         inputArgs,
				Decision:      "rejected",
				ReasonCode:    "PRODUCT_OUT_OF_STOCK",
				Output:        resp,
				DurationMs:    time.Since(start).Milliseconds(),
			})
			return mcp.NewToolResultText(string(respBytes)), nil
		}

		// 3. Query previous attempt count for this product and session
		var previousAttempts int
		countQuery := `SELECT COUNT(*) FROM negotiations WHERE product_id = $1 AND agent_session_id = $2;`
		_ = pool.QueryRow(ctx, countQuery, productID, sessionID).Scan(&previousAttempts)

		attemptNumber := previousAttempts + 1

		// 4. Evaluate offer with deterministic pricing engine
		evalInput := pricing.EvaluationInput{
			BasePrice:          basePrice,
			FloorPrice:         floorPrice,
			ProposedPrice:      proposedPrice,
			AttemptNumber:      attemptNumber,
			MaxAttempts:        maxAttempts,
			MaxDiscountPercent: 20, // default ceiling
			RequireHumanReview: requireHumanReview,
		}

		evalResult := pricing.EvaluateOffer(evalInput)

		// 5. Persist negotiation attempt into negotiations table
		insertQuery := `
			INSERT INTO negotiations (
				product_id, agent_session_id, proposed_price, decision, reason_code, counter_offer, attempt_number, created_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, NOW()
			);
		`
		var counterOfferVal *int
		if evalResult.CounterOffer > 0 {
			counterOfferVal = &evalResult.CounterOffer
		}

		_, err = pool.Exec(ctx, insertQuery,
			productID,
			sessionID,
			proposedPrice,
			evalResult.Decision,
			evalResult.ReasonCode,
			counterOfferVal,
			attemptNumber,
		)
		if err != nil {
			fmt.Printf("warning: failed to record negotiation row: %v\n", err)
		}

		// 6. Build response object
		response := NegotiateOfferResponse{
			Decision:     evalResult.Decision,
			ReasonCode:   evalResult.ReasonCode,
			FinalPrice:   evalResult.FinalPrice,
			CounterOffer: evalResult.CounterOffer,
			Attempt:      attemptNumber,
			MaxAttempts:  cfg.MaxNegotiationAttempts,
		}

		respBytes, err := json.Marshal(response)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("failed to encode negotiation response: %v", err)), nil
		}

		// 7. Write structured audit log
		_ = auditLogger.Log(ctx, audit.Entry{
			CorrelationID: correlationID,
			ToolName:      "negotiate_offer",
			Input:         inputArgs,
			Decision:      evalResult.Decision,
			ReasonCode:    evalResult.ReasonCode,
			Output:        response,
			DurationMs:    time.Since(start).Milliseconds(),
		})

		return mcp.NewToolResultText(string(respBytes)), nil
	}
}
