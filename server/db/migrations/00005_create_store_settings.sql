-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS store_settings (
    key          VARCHAR(64) PRIMARY KEY,
    value        TEXT NOT NULL,
    description  TEXT,
    category     VARCHAR(32) NOT NULL DEFAULT 'general',
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial complete store settings, credentials, and feature flags
INSERT INTO store_settings (key, value, description, category) VALUES
    ('razorpay_key_id', '', 'Razorpay API Key ID for orders & checkout links', 'credentials'),
    ('razorpay_key_secret', '', 'Razorpay API Key Secret', 'credentials'),
    ('razorpay_webhook_secret', 'agentic_checkout_secret_2026', 'HMAC SHA-256 secret for verifying payment webhooks', 'credentials'),
    ('mcp_transport', 'streamablehttp', 'Active MCP transport protocol (streamablehttp, sse, or stdio)', 'transport'),
    ('enable_find_and_price', 'true', 'Enable AI natural language product intent search & price matching', 'features'),
    ('enable_negotiation', 'true', 'Enable autonomous price bargaining and discount concession ladder', 'features'),
    ('enable_human_approval', 'false', 'Require human merchant manual approval for all discount proposals', 'guardrails'),
    ('max_negotiation_attempts', '3', 'Maximum bargaining rounds per product session before lockout', 'guardrails'),
    ('max_discount_percent', '20', 'Maximum allowable concession discount percentage', 'guardrails'),
    ('max_tool_calls_per_minute', '30', 'Rate limit threshold per agent session per minute', 'security'),
    ('enable_catalog_cache', 'true', 'Cache product lookups in Redis for sub-millisecond responses', 'performance'),
    ('audit_log_level', 'full', 'Audit log detail level (full or decisions_only)', 'telemetry'),
    ('webhook_strict_mode', 'true', 'Enforce strict cryptographic HMAC-SHA256 signature verification', 'security')
ON CONFLICT (key) DO NOTHING;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS store_settings;
-- +goose StatementEnd
