package tools

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"github.com/sohampawar1866/merchant-mcp/server/audit"
	"github.com/sohampawar1866/merchant-mcp/server/config"
)

// MatchOption represents a product match annotated with natural-language reason.
// Crucially, internal fields like floor_price are omitted.
type MatchOption struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Price       int    `json:"price"` // in paise
	Stock       int    `json:"stock"`
	Category    string `json:"category,omitempty"`
	MatchReason string `json:"match_reason"`
}

// FindAndPriceResponse represents the consolidated output of the composite tool.
type FindAndPriceResponse struct {
	Options      []MatchOption `json:"options"`
	TotalMatches int           `json:"total_matches"`
	ParsedBudget int           `json:"parsed_budget_paise,omitempty"`
}

// RegisterCompositeTools registers the composite find_and_price tool on the MCP server.
func RegisterCompositeTools(
	s *server.MCPServer,
	pool *pgxpool.Pool,
	auditLogger *audit.Logger,
	cfg *config.Config,
) {
	compositeTool := mcp.NewTool(
		"find_and_price",
		mcp.WithDescription("Consolidated search + price-check composite tool. Takes natural language buyer intent (e.g. 'earbuds under 2000 rupees with good bass'), resolves budget and features server-side, and returns matched options with explanations in a single call."),
		mcp.WithString("intent",
			mcp.Required(),
			mcp.Description("Natural language buyer purchase intent (e.g. 'earbuds under 2000 rupees, good bass', 'mechanical keyboard below 6000')"),
		),
	)
	s.AddTool(compositeTool, handleFindAndPrice(pool, auditLogger, cfg))
}

var (
	budgetRegexes = []*regexp.Regexp{
		regexp.MustCompile(`(?i)(?:under|below|less than|within|<|budget of)\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)*)`),
		regexp.MustCompile(`(?i)(?:rs\.?|inr|₹)\s*([0-9]+(?:,[0-9]+)*)\s*(?:or less|max|ceiling)`),
		regexp.MustCompile(`(?i)([0-9]+(?:,[0-9]+)*)\s*(?:rupees|rs\.?|inr)\s*(?:max|budget|limit)`),
	}
)

func parseIntentBudget(intent string) (int, string) {
	parsedBudgetPaise := 0
	cleanKeywords := intent

	for _, re := range budgetRegexes {
		if match := re.FindStringSubmatch(intent); len(match) > 1 {
			rawNum := strings.ReplaceAll(match[1], ",", "")
			if rupees, err := strconv.Atoi(rawNum); err == nil && rupees > 0 {
				parsedBudgetPaise = rupees * 100 // convert rupees to paise
				cleanKeywords = re.ReplaceAllString(cleanKeywords, "")
				break
			}
		}
	}

	// Clean stop phrases
	cleanKeywords = strings.TrimSpace(cleanKeywords)
	cleanKeywords = regexp.MustCompile(`(?i)\b(rupees|rs|inr|under|below|for|with|and|a|an|the|good|best)\b`).ReplaceAllString(cleanKeywords, " ")
	cleanKeywords = strings.Join(strings.Fields(cleanKeywords), " ")

	return parsedBudgetPaise, cleanKeywords
}

func handleFindAndPrice(
	pool *pgxpool.Pool,
	auditLogger *audit.Logger,
	cfg *config.Config,
) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		start := time.Now()
		correlationID := uuid.New()

		intent, err := request.RequireString("intent")
		if err != nil {
			return mcp.NewToolResultError("missing required parameter: intent"), nil
		}

		parsedBudget, cleanKeywords := parseIntentBudget(intent)

		inputArgs := map[string]any{
			"intent":              intent,
			"parsed_budget_paise": parsedBudget,
			"clean_keywords":      cleanKeywords,
		}

		if pool == nil {
			resp := FindAndPriceResponse{Options: []MatchOption{}, TotalMatches: 0}
			respBytes, _ := json.Marshal(resp)
			return mcp.NewToolResultText(string(respBytes)), nil
		}

		words := strings.Fields(cleanKeywords)
		var queryBuilder strings.Builder
		queryArgs := make([]any, 0)

		queryBuilder.WriteString(`
			SELECT id, name, description, category, tags, base_price, stock, attributes
			FROM products
			WHERE 1=1
		`)

		if parsedBudget > 0 {
			queryArgs = append(queryArgs, parsedBudget)
			queryBuilder.WriteString(fmt.Sprintf(" AND base_price <= $%d", len(queryArgs)))
		}

		if len(words) > 0 {
			queryBuilder.WriteString(" AND (")
			for i, word := range words {
				if i > 0 {
					queryBuilder.WriteString(" OR ")
				}
				queryArgs = append(queryArgs, "%"+word+"%")
				argIdx := len(queryArgs)
				queryBuilder.WriteString(fmt.Sprintf("(name ILIKE $%d OR description ILIKE $%d OR category ILIKE $%d OR array_to_string(tags, ' ') ILIKE $%d)",
					argIdx, argIdx, argIdx, argIdx))
			}
			queryBuilder.WriteString(")")
		}

		queryBuilder.WriteString(" ORDER BY base_price ASC LIMIT 10;")

		rows, err := pool.Query(ctx, queryBuilder.String(), queryArgs...)
		if err != nil {
			errOutput := fmt.Sprintf("composite query failed: %v", err)
			_ = auditLogger.Log(ctx, audit.Entry{
				CorrelationID: correlationID,
				ToolName:      "find_and_price",
				Input:         inputArgs,
				Decision:      "failed",
				ErrorMessage:  errOutput,
				DurationMs:    time.Since(start).Milliseconds(),
			})
			return mcp.NewToolResultError(errOutput), nil
		}
		defer rows.Close()

		options := make([]MatchOption, 0)
		for rows.Next() {
			var id, name, desc, cat string
			var basePrice, stock int
			var tags []string
			var attrBytes []byte

			if err := rows.Scan(&id, &name, &desc, &cat, &tags, &basePrice, &stock, &attrBytes); err != nil {
				continue
			}

			// Generate explainable match reason
			var reasons []string
			if parsedBudget > 0 && basePrice <= parsedBudget {
				reasons = append(reasons, fmt.Sprintf("under budget (₹%.2f)", float64(parsedBudget)/100))
			}
			if len(words) > 0 {
				reasons = append(reasons, "matched search intent")
			}
			if len(reasons) == 0 {
				reasons = append(reasons, "popular catalog item")
			}

			matchReason := strings.Join(reasons, ", ")

			options = append(options, MatchOption{
				ID:          id,
				Name:        name,
				Price:       basePrice,
				Stock:       stock,
				Category:    cat,
				MatchReason: matchReason,
			})
		}

		// Fallback: if no keyword matches found but budget provided, return items within budget
		if len(options) == 0 && parsedBudget > 0 {
			fallbackRows, err := pool.Query(ctx, "SELECT id, name, description, category, tags, base_price, stock, attributes FROM products WHERE base_price <= $1 ORDER BY base_price ASC LIMIT 5;", parsedBudget)
			if err == nil {
				defer fallbackRows.Close()
				for fallbackRows.Next() {
					var id, name, desc, cat string
					var basePrice, stock int
					var tags []string
					var attrBytes []byte
					if err := fallbackRows.Scan(&id, &name, &desc, &cat, &tags, &basePrice, &stock, &attrBytes); err == nil {
						options = append(options, MatchOption{
							ID:          id,
							Name:        name,
							Price:       basePrice,
							Stock:       stock,
							Category:    cat,
							MatchReason: fmt.Sprintf("within budget (₹%.2f)", float64(parsedBudget)/100),
						})
					}
				}
			}
		}

		response := FindAndPriceResponse{
			Options:      options,
			TotalMatches: len(options),
			ParsedBudget: parsedBudget,
		}

		respBytes, _ := json.Marshal(response)

		_ = auditLogger.Log(ctx, audit.Entry{
			CorrelationID: correlationID,
			ToolName:      "find_and_price",
			Input:         inputArgs,
			Decision:      "approved",
			ReasonCode:    "MATCHES_FOUND",
			Output:        response,
			DurationMs:    time.Since(start).Milliseconds(),
		})

		return mcp.NewToolResultText(string(respBytes)), nil
	}
}
