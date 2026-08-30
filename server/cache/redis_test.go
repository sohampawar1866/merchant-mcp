package cache

import (
	"context"
	"testing"
	"time"
)

func TestCache_InMemoryIdempotencyAndRateLimiting(t *testing.T) {
	c, err := NewCache("")
	if err != nil {
		t.Fatalf("unexpected error creating in-memory cache: %v", err)
	}

	ctx := context.Background()

	// 1. Test Idempotency
	key := "test-idemp-123"
	payload := `{"order_id":"order_123","status":"created"}`

	err = c.SetIdempotencyKey(ctx, key, payload, 1*time.Hour)
	if err != nil {
		t.Fatalf("failed to set idempotency key: %v", err)
	}

	retrieved, err := c.GetIdempotencyKey(ctx, key)
	if err != nil {
		t.Fatalf("failed to get idempotency key: %v", err)
	}
	if retrieved != payload {
		t.Errorf("expected %s, got %s", payload, retrieved)
	}

	// 2. Test Rate Limiting
	sessionID := "agent-session-abc"
	maxCalls := 3

	for i := 1; i <= maxCalls; i++ {
		allowed, count, err := c.AllowToolCall(ctx, sessionID, maxCalls)
		if err != nil {
			t.Fatalf("rate limit check failed: %v", err)
		}
		if !allowed || count != i {
			t.Fatalf("call %d expected allowed=true (count=%d), got allowed=%v count=%d", i, i, allowed, count)
		}
	}

	// Call 4 should be rejected
	allowed, count, err := c.AllowToolCall(ctx, sessionID, maxCalls)
	if err != nil {
		t.Fatalf("rate limit check failed: %v", err)
	}
	if allowed || count != 4 {
		t.Fatalf("call 4 should be blocked, got allowed=%v, count=%d", allowed, count)
	}
}
