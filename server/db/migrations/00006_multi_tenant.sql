-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS merchants (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    TEXT NOT NULL,
    razorpay_key_id         TEXT NOT NULL,
    razorpay_key_secret     BYTEA NOT NULL,
    razorpay_webhook_secret BYTEA NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    feature_overrides       JSONB DEFAULT '{}',
    api_key                 TEXT UNIQUE NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_api_key ON merchants(api_key);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);

-- Seed initial demo merchants
INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'Demo Store 1 (Audio & Gadgets)',
        'rzp_test_demo1',
        pgp_sym_encrypt('rzp_test_secret_demo1', 'agentic_platform_master_passphrase_2026'),
        pgp_sym_encrypt('agentic_checkout_secret_2026', 'agentic_platform_master_passphrase_2026'),
        'active',
        'demo-key-1'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'Demo Store 2 (Lifestyle & Gear)',
        'rzp_test_demo2',
        pgp_sym_encrypt('rzp_test_secret_demo2', 'agentic_platform_master_passphrase_2026'),
        pgp_sym_encrypt('agentic_checkout_secret_2026', 'agentic_platform_master_passphrase_2026'),
        'active',
        'demo-key-2'
    )
ON CONFLICT (id) DO NOTHING;

-- Add merchant_id columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES merchants(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES merchants(id);
ALTER TABLE negotiations ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES merchants(id);
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES merchants(id);
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES merchants(id);

-- Backfill existing rows to Demo Store 1
UPDATE products SET merchant_id = '00000000-0000-0000-0000-000000000001' WHERE merchant_id IS NULL;
UPDATE orders SET merchant_id = '00000000-0000-0000-0000-000000000001' WHERE merchant_id IS NULL;
UPDATE negotiations SET merchant_id = '00000000-0000-0000-0000-000000000001' WHERE merchant_id IS NULL;
UPDATE audit_log SET merchant_id = '00000000-0000-0000-0000-000000000001' WHERE merchant_id IS NULL;
UPDATE store_settings SET merchant_id = '00000000-0000-0000-0000-000000000001' WHERE merchant_id IS NULL;

-- Enforce NOT NULL constraints
ALTER TABLE products ALTER COLUMN merchant_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN merchant_id SET NOT NULL;
ALTER TABLE negotiations ALTER COLUMN merchant_id SET NOT NULL;
ALTER TABLE audit_log ALTER COLUMN merchant_id SET NOT NULL;
ALTER TABLE store_settings ALTER COLUMN merchant_id SET NOT NULL;

-- Re-key store_settings with composite primary key (merchant_id, key)
ALTER TABLE store_settings DROP CONSTRAINT IF EXISTS store_settings_pkey;
ALTER TABLE store_settings ADD CONSTRAINT store_settings_pkey PRIMARY KEY (merchant_id, key);

-- Create performance indexes for tenant filtering
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_merchant_id ON negotiations(merchant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_merchant_id ON audit_log(merchant_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE store_settings DROP CONSTRAINT IF EXISTS store_settings_pkey;
ALTER TABLE store_settings ADD CONSTRAINT store_settings_pkey PRIMARY KEY (key);

ALTER TABLE products DROP COLUMN IF EXISTS merchant_id;
ALTER TABLE orders DROP COLUMN IF EXISTS merchant_id;
ALTER TABLE negotiations DROP COLUMN IF EXISTS merchant_id;
ALTER TABLE audit_log DROP COLUMN IF EXISTS merchant_id;
ALTER TABLE store_settings DROP COLUMN IF EXISTS merchant_id;

DROP TABLE IF EXISTS merchants CASCADE;
-- +goose StatementEnd
