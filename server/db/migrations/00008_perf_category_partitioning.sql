-- +goose Up
-- +goose StatementBegin
-- 1. Composite Index for Multi-Tenant Category Partitioning (Sub-5ms index scan)
CREATE INDEX IF NOT EXISTS idx_products_merchant_category ON products(merchant_id, category);

-- 2. Composite Index for In-Stock Product Filtering
CREATE INDEX IF NOT EXISTS idx_products_merchant_stock ON products(merchant_id, stock) WHERE stock > 0;

-- 3. Composite Index for Order Status Lookup by Tenant
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON orders(merchant_id, status);

-- 4. Composite Index for Audit Trail queries
CREATE INDEX IF NOT EXISTS idx_audit_log_merchant_created ON audit_log(merchant_id, created_at DESC);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_products_merchant_category;
DROP INDEX IF EXISTS idx_products_merchant_stock;
DROP INDEX IF EXISTS idx_orders_merchant_status;
DROP INDEX IF EXISTS idx_audit_log_merchant_created;
-- +goose StatementEnd
