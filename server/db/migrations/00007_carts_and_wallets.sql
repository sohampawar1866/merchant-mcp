-- +goose Up
-- +goose StatementBegin

-- 1. Unified Multi-Product Carts Table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    agent_session_id VARCHAR(255) NOT NULL,
    customer_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'negotiating', 'locked', 'checked_out', 'expired')),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    subtotal_paise INT NOT NULL DEFAULT 0,
    tax_paise INT NOT NULL DEFAULT 0,
    discount_paise INT NOT NULL DEFAULT 0,
    total_paise INT NOT NULL DEFAULT 0,
    negotiated_bundle BOOLEAN NOT NULL DEFAULT FALSE,
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 2. Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_base_price_paise INT NOT NULL,
    unit_agreed_price_paise INT NOT NULL,
    tax_rate_bps INT NOT NULL DEFAULT 1800, -- 18.00% GST
    tax_amount_paise INT NOT NULL DEFAULT 0,
    line_total_paise INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Autonomous Agent Wallets Table (NPCI UPI Circle / AP2 model)
CREATE TABLE IF NOT EXISTS agent_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(255) NOT NULL UNIQUE, -- e.g. "claude-buyer-01" or "default"
    user_id VARCHAR(255) NOT NULL DEFAULT 'primary_user',
    balance_paise BIGINT NOT NULL DEFAULT 500000 CHECK (balance_paise >= 0), -- Default ₹5,000 allowance
    monthly_allowance_paise BIGINT NOT NULL DEFAULT 1500000, -- ₹15,000 max monthly
    monthly_spent_paise BIGINT NOT NULL DEFAULT 0,
    per_transaction_cap_paise INT NOT NULL DEFAULT 200000, -- ₹2,000 per txn auto-approval cap
    whitelisted_categories TEXT[] DEFAULT ARRAY['Audio', 'Desk Accessories', 'Smart Home', 'Wearables', 'general'],
    last_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Agent Double-Entry Wallet Ledger Table
CREATE TABLE IF NOT EXISTS agent_wallet_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES agent_wallets(id),
    order_id VARCHAR(255),
    cart_id UUID REFERENCES carts(id),
    entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN ('CREDIT_ALLOWANCE', 'DEBIT_PURCHASE', 'REFUND_CREDIT')),
    amount_paise INT NOT NULL,
    balance_after_paise BIGINT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Merchant Campaigns Table
CREATE TABLE IF NOT EXISTS merchant_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    name VARCHAR(255) NOT NULL,
    discount_percent INT NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 50),
    target_category VARCHAR(100),
    min_bundle_items INT NOT NULL DEFAULT 2,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_carts_session ON carts(merchant_id, agent_session_id, status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_agent_wallets_agent ON agent_wallets(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_ledger_wallet ON agent_wallet_ledger(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchant_campaigns ON merchant_campaigns(merchant_id, status);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS merchant_campaigns CASCADE;
DROP TABLE IF EXISTS agent_wallet_ledger CASCADE;
DROP TABLE IF EXISTS agent_wallets CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
-- +goose StatementEnd
