package audit

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// DefaultDemoMerchantID is used when merchant_id is not specified
const DefaultDemoMerchantID = "00000000-0000-0000-0000-000000000001"

// Entry defines a single audit log record for an MCP tool call.
type Entry struct {
	MerchantID    string    `json:"merchant_id,omitempty"`
	CorrelationID uuid.UUID `json:"correlation_id"`
	ToolName      string    `json:"tool_name"`
	Input         any       `json:"input"`
	Decision      string    `json:"decision"` // "approved", "rejected", "pending_approval", or "n/a" for read-only
	ReasonCode    string    `json:"reason_code"` // Optional reason code (e.g. "BELOW_FLOOR", "MAX_ATTEMPTS_EXCEEDED", "OK")
	Output        any       `json:"output"`
	ErrorMessage  string    `json:"error_message,omitempty"`
	DurationMs    int64     `json:"duration_ms"`
}

// Logger handles persistence of audit entries into PostgreSQL.
type Logger struct {
	pool     *pgxpool.Pool
	logLevel string // "full" or "decisions_only"
}

// NewLogger creates a new audit logger instance.
func NewLogger(pool *pgxpool.Pool, logLevel string) *Logger {
	if logLevel == "" {
		logLevel = "full"
	}
	return &Logger{
		pool:     pool,
		logLevel: logLevel,
	}
}

// Log writes a structured audit log entry into the database.
func (l *Logger) Log(ctx context.Context, entry Entry) error {
	if entry.CorrelationID == uuid.Nil {
		entry.CorrelationID = uuid.New()
	}

	if entry.Decision == "" {
		entry.Decision = "n/a"
	}

	merchantID := entry.MerchantID
	if merchantID == "" {
		merchantID = DefaultDemoMerchantID
	}

	var inputBytes, outputBytes []byte
	var err error

	if l.logLevel == "decisions_only" {
		// Store minimal payload for decisions_only mode
		inputBytes = []byte("{}")
		outputBytes = []byte("{}")
	} else {
		if entry.Input != nil {
			inputBytes, err = json.Marshal(entry.Input)
			if err != nil {
				inputBytes = []byte(fmt.Sprintf(`{"raw_error":%q}`, err.Error()))
			}
		} else {
			inputBytes = []byte("{}")
		}

		if entry.Output != nil {
			outputBytes, err = json.Marshal(entry.Output)
			if err != nil {
				outputBytes = []byte(fmt.Sprintf(`{"raw_error":%q}`, err.Error()))
			}
		} else {
			outputBytes = []byte("{}")
		}
	}

	if l.pool == nil {
		log.Printf("[AUDIT-FALLBACK] merchant=%s tool=%s correlation_id=%s decision=%s reason=%s duration=%dms",
			merchantID, entry.ToolName, entry.CorrelationID, entry.Decision, entry.ReasonCode, entry.DurationMs)
		return nil
	}

	query := `
		INSERT INTO audit_log (
			merchant_id, correlation_id, tool_name, input, decision, reason_code, output, error_message, duration_ms, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
		);
	`

	_, err = l.pool.Exec(ctx, query,
		merchantID,
		entry.CorrelationID,
		entry.ToolName,
		inputBytes,
		entry.Decision,
		entry.ReasonCode,
		outputBytes,
		entry.ErrorMessage,
		entry.DurationMs,
	)
	if err != nil {
		log.Printf("audit: failed to persist audit log for tool %s (%s): %v", entry.ToolName, entry.CorrelationID, err)
		return fmt.Errorf("audit: failed to insert log: %w", err)
	}

	return nil
}
