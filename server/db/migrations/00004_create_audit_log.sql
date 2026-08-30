-- +goose Up
-- +goose StatementBegin
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id  UUID NOT NULL,
    tool_name       TEXT NOT NULL,
    input           JSONB NOT NULL,
    decision        TEXT,
    reason_code     TEXT,
    output          JSONB,
    error_message   TEXT,
    duration_ms     INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_correlation_id ON audit_log(correlation_id);
CREATE INDEX idx_audit_log_tool_name ON audit_log(tool_name);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS audit_log;
-- +goose StatementEnd
