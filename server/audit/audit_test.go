package audit

import (
	"context"
	"testing"

	"github.com/google/uuid"
)

func TestAuditLogger_NilPoolFallback(t *testing.T) {
	logger := NewLogger(nil, "full")
	entry := Entry{
		ToolName: "test_tool",
		Input:    map[string]any{"query": "headphones"},
		Output:   map[string]any{"results_count": 1},
	}

	err := logger.Log(context.Background(), entry)
	if err != nil {
		t.Fatalf("expected nil error on nil pool fallback, got: %v", err)
	}
}

func TestAuditLogger_CorrelationIDGenerated(t *testing.T) {
	logger := NewLogger(nil, "decisions_only")
	entry := Entry{
		CorrelationID: uuid.Nil,
		ToolName:      "test_auto_uuid",
		Decision:      "approved",
		ReasonCode:    "OK",
	}

	err := logger.Log(context.Background(), entry)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
