-- +goose Up
-- +goose StatementBegin
CREATE TABLE negotiations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id),
    agent_session_id TEXT,
    proposed_price  INTEGER NOT NULL,
    decision        TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
    reason_code     TEXT,
    counter_offer   INTEGER,
    attempt_number  INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_negotiations_product_id ON negotiations(product_id);
CREATE INDEX idx_negotiations_agent_session ON negotiations(agent_session_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS negotiations;
-- +goose StatementEnd
