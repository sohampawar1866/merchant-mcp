-- +goose Up
-- +goose StatementBegin

-- 1. Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Merchants Table (Multi-Tenant Core Entity)
CREATE TABLE IF NOT EXISTS merchants (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    TEXT NOT NULL,
    razorpay_key_id         TEXT NOT NULL,
    razorpay_key_secret_enc BYTEA NOT NULL,
    webhook_secret_enc      BYTEA NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    api_key                 TEXT UNIQUE NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_api_key ON merchants(api_key);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);

-- Seed Default Platform Merchants (Idempotent)
INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret_enc, webhook_secret_enc, status, api_key)
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
    ),
    (
        'efe794fa-e1e2-4d30-8f13-cb74b2b5f110',
        'Soham Store',
        'rzp_test_soham',
        pgp_sym_encrypt('rzp_test_secret_soham', 'agentic_platform_master_passphrase_2026'),
        pgp_sym_encrypt('agentic_checkout_secret_2026', 'agentic_platform_master_passphrase_2026'),
        'active',
        'mc_live_573406c24c50bd37afbb1a5013048d49'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Products Table (With Tenant Isolation & Floor Price Protection)
CREATE TABLE IF NOT EXISTS products (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id   UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    description   TEXT,
    category      TEXT,
    tags          TEXT[] DEFAULT '{}',
    tags_source   TEXT DEFAULT 'ai' CHECK (tags_source IN ('ai', 'merchant_edited')),
    base_price    INTEGER NOT NULL CHECK (base_price >= 0),
    floor_price   INTEGER NOT NULL CHECK (floor_price >= 0 AND floor_price <= base_price),
    stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    attributes    JSONB DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Products
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_merchant_category ON products(merchant_id, category);
CREATE INDEX IF NOT EXISTS idx_products_merchant_stock ON products(merchant_id, stock) WHERE stock > 0;

-- 4. Orders Table (With 2FA Razorpay Links & Audit Trail)
CREATE TABLE IF NOT EXISTS orders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id       UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    razorpay_order_id TEXT UNIQUE,
    product_id        UUID REFERENCES products(id) ON DELETE SET NULL,
    agreed_price      INTEGER NOT NULL CHECK (agreed_price >= 0),
    status            TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
    idempotency_key   TEXT UNIQUE NOT NULL,
    payment_link      TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Orders
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON orders(merchant_id, status);

-- 5. Negotiations Table (Dynamic Real-Time Pricing Engine Records)
CREATE TABLE IF NOT EXISTS negotiations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id      UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    agent_session_id TEXT,
    proposed_price   INTEGER NOT NULL,
    decision         TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
    reason_code      TEXT,
    counter_offer    INTEGER,
    attempt_number   INTEGER NOT NULL DEFAULT 1,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Negotiations
CREATE INDEX IF NOT EXISTS idx_negotiations_merchant_id ON negotiations(merchant_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_product_id ON negotiations(product_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_agent_session ON negotiations(agent_session_id);

-- 6. Audit Log Table (Immutable Decision Log & Telemetry)
CREATE TABLE IF NOT EXISTS audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
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

-- Performance Indexes for Audit Log
CREATE INDEX IF NOT EXISTS idx_audit_log_merchant_id ON audit_log(merchant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_correlation_id ON audit_log(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tool_name ON audit_log(tool_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_merchant_created ON audit_log(merchant_id, created_at DESC);

-- 7. Store Settings Table (Composite Key Multi-Tenant Config)
CREATE TABLE IF NOT EXISTS store_settings (
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    key         VARCHAR(100) NOT NULL,
    value       JSONB NOT NULL,
    description TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (merchant_id, key)
);

-- Seed Default Settings for All Stores (Idempotent)
INSERT INTO store_settings (merchant_id, key, value, description)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'negotiation_mode', '"conservative"', 'Discount strategy: conservative, moderate, or aggressive'),
    ('00000000-0000-0000-0000-000000000001', 'max_negotiation_rounds', '3', 'Max back-and-forth negotiation rounds before final offer'),
    ('00000000-0000-0000-0000-000000000001', 'checkout_delivery_mode', '"standard_link"', 'Standard payment link vs UPI direct deep link'),
    ('00000000-0000-0000-0000-000000000001', 'bundle_discount_rate', '0.05', 'Additional discount applied to upsell bundle recommendations'),
    ('00000000-0000-0000-0000-000000000002', 'negotiation_mode', '"moderate"', 'Discount strategy for Store 2'),
    ('00000000-0000-0000-0000-000000000002', 'max_negotiation_rounds', '3', 'Max back-and-forth rounds for Store 2'),
    ('efe794fa-e1e2-4d30-8f13-cb74b2b5f110', 'negotiation_mode', '"conservative"', 'Discount strategy for Soham Store'),
    ('efe794fa-e1e2-4d30-8f13-cb74b2b5f110', 'max_negotiation_rounds', '3', 'Max negotiation rounds for Soham Store'),
    ('efe794fa-e1e2-4d30-8f13-cb74b2b5f110', 'checkout_delivery_mode', '"standard_link"', 'Delivery mode for Soham Store')
ON CONFLICT (merchant_id, key) DO NOTHING;

-- 8. Merchant Campaigns Table (Targeted AI Upsell Bundles)
CREATE TABLE IF NOT EXISTS merchant_campaigns (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id      UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 50),
    target_category  VARCHAR(100),
    min_bundle_items INTEGER NOT NULL DEFAULT 2,
    status           VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
    starts_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_campaigns ON merchant_campaigns(merchant_id, status);

-- 9. Unified Carts Table (Atomic Multi-Item Sessions)
CREATE TABLE IF NOT EXISTS carts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id       UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    agent_session_id  VARCHAR(255) NOT NULL,
    customer_id       VARCHAR(255),
    status            VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'negotiating', 'locked', 'checked_out', 'expired')),
    currency          VARCHAR(10) NOT NULL DEFAULT 'INR',
    subtotal_paise    INTEGER NOT NULL DEFAULT 0,
    tax_paise         INTEGER NOT NULL DEFAULT 0,
    discount_paise    INTEGER NOT NULL DEFAULT 0,
    total_paise       INTEGER NOT NULL DEFAULT 0,
    negotiated_bundle BOOLEAN NOT NULL DEFAULT false,
    idempotency_key   VARCHAR(255) UNIQUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at        TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Performance Indexes for Carts
CREATE INDEX IF NOT EXISTS idx_carts_session ON carts(merchant_id, agent_session_id, status);

-- 10. Cart Items Table (Itemized Line Items with 18% GST)
CREATE TABLE IF NOT EXISTS cart_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id                 UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id              UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    merchant_id             UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    quantity                INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_base_price_paise   INTEGER NOT NULL CHECK (unit_base_price_paise >= 0),
    unit_agreed_price_paise INTEGER NOT NULL CHECK (unit_agreed_price_paise >= 0),
    tax_rate_bps            INTEGER NOT NULL DEFAULT 1800, -- 18.00% GST
    tax_amount_paise        INTEGER NOT NULL DEFAULT 0,
    line_total_paise        INTEGER NOT NULL CHECK (line_total_paise >= 0),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Cart Items
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- 11. Autonomous Agent Wallets Table (NPCI UPI Circle / AP2 Delegated Mandates)
CREATE TABLE IF NOT EXISTS agent_wallets (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id                  VARCHAR(255) NOT NULL UNIQUE, -- e.g. "claude-buyer-01"
    user_id                   VARCHAR(255) NOT NULL DEFAULT 'primary_user',
    balance_paise             BIGINT NOT NULL DEFAULT 500000 CHECK (balance_paise >= 0), -- Default ₹5,000 allowance
    monthly_allowance_paise   BIGINT NOT NULL DEFAULT 1500000, -- ₹15,000 max monthly
    monthly_spent_paise       BIGINT NOT NULL DEFAULT 0,
    per_transaction_cap_paise INTEGER NOT NULL DEFAULT 200000, -- ₹2,000 per txn auto-approval cap
    whitelisted_categories    TEXT[] DEFAULT ARRAY['*'],
    last_reset_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status                    VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'revoked')),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Agent Wallets
CREATE INDEX IF NOT EXISTS idx_agent_wallets_agent ON agent_wallets(agent_id, status);

-- Seed Primary Agent Wallet (Idempotent)
INSERT INTO agent_wallets (agent_id, user_id, balance_paise, monthly_allowance_paise, per_transaction_cap_paise, status)
VALUES 
    ('claude-buyer-01', 'user-soham-01', 500000, 1500000, 200000, 'active')
ON CONFLICT (agent_id) DO NOTHING;

-- 12. Agent Double-Entry Wallet Ledger Table
CREATE TABLE IF NOT EXISTS agent_wallet_ledger (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id           UUID NOT NULL REFERENCES agent_wallets(id) ON DELETE CASCADE,
    order_id            VARCHAR(255),
    cart_id             UUID REFERENCES carts(id) ON DELETE SET NULL,
    entry_type          VARCHAR(50) NOT NULL CHECK (entry_type IN ('CREDIT_ALLOWANCE', 'DEBIT_PURCHASE', 'REFUND_CREDIT')),
    amount_paise        INTEGER NOT NULL,
    balance_after_paise BIGINT NOT NULL,
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Wallet Ledger
CREATE INDEX IF NOT EXISTS idx_agent_ledger_wallet ON agent_wallet_ledger(wallet_id, created_at DESC);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS agent_wallet_ledger CASCADE;
DROP TABLE IF EXISTS agent_wallets CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS merchant_campaigns CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS negotiations CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
-- +goose StatementEnd
