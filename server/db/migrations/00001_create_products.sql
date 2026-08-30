-- +goose Up
-- +goose StatementBegin
CREATE TABLE products (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    description   TEXT,
    category      TEXT,
    tags          TEXT[] DEFAULT '{}',
    tags_source   TEXT DEFAULT 'ai' CHECK (tags_source IN ('ai', 'merchant_edited')),
    base_price    INTEGER NOT NULL,
    floor_price   INTEGER NOT NULL,
    stock         INTEGER NOT NULL DEFAULT 0,
    attributes    JSONB DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS products;
-- +goose StatementEnd
