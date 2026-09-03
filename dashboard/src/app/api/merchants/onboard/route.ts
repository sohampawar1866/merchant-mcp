import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { randomBytes, randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const pool = getDbPool();

  try {
    const body = await req.json();
    const {
      name,
      razorpay_key_id,
      razorpay_key_secret,
      razorpay_webhook_secret = 'agentic_checkout_secret_2026',
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Store name is required' }, { status: 400 });
    }
    if (!razorpay_key_id || !razorpay_key_id.trim()) {
      return NextResponse.json({ success: false, error: 'Razorpay Key ID is required' }, { status: 400 });
    }
    if (!razorpay_key_secret || !razorpay_key_secret.trim()) {
      return NextResponse.json({ success: false, error: 'Razorpay Key Secret is required' }, { status: 400 });
    }

    const passphrase =
      process.env.ENCRYPTION_PASSPHRASE || 'agentic_platform_master_passphrase_2026';
    const apiKey = `mc_live_${randomBytes(16).toString('hex')}`;
    const merchantId = randomUUID();

    // Ensure pgcrypto and table exists
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // Insert merchant with pgp_sym_encrypt
    const insertMerchantQuery = `
      INSERT INTO merchants (
        id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, feature_overrides, api_key, created_at
      ) VALUES (
        $1, $2, $3, pgp_sym_encrypt($4, $6), pgp_sym_encrypt($5, $6), 'active', '{}'::jsonb, $7, NOW()
      )
      RETURNING id, name, razorpay_key_id, status, api_key, created_at;
    `;

    const res = await pool.query(insertMerchantQuery, [
      merchantId,
      name.trim(),
      razorpay_key_id.trim(),
      razorpay_key_secret.trim(),
      razorpay_webhook_secret.trim(),
      passphrase,
      apiKey,
    ]);

    const merchant = res.rows[0];

    // Seed default store settings for this merchant
    const seedSettingsQuery = `
      INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
        ($1, 'razorpay_key_id', $2, 'Razorpay API Key ID', 'credentials'),
        ($1, 'razorpay_key_secret', $3, 'Razorpay API Key Secret', 'credentials'),
        ($1, 'razorpay_webhook_secret', $4, 'HMAC SHA-256 secret for verifying payment webhooks', 'credentials'),
        ($1, 'mcp_transport', 'streamablehttp', 'Active MCP transport protocol', 'transport'),
        ($1, 'enable_find_and_price', 'true', 'Enable AI natural language intent search', 'features'),
        ($1, 'enable_negotiation', 'true', 'Enable autonomous price bargaining', 'features'),
        ($1, 'enable_human_approval', 'false', 'Require merchant approval for discounts', 'guardrails'),
        ($1, 'max_negotiation_attempts', '3', 'Max bargaining rounds before lockout', 'guardrails'),
        ($1, 'max_discount_percent', '20', 'Max concession percentage ceiling', 'guardrails'),
        ($1, 'max_tool_calls_per_minute', '30', 'Rate limit threshold per agent session', 'security'),
        ($1, 'enable_catalog_cache', 'true', 'Cache product lookups in Redis', 'performance'),
        ($1, 'audit_log_level', 'full', 'Audit log detail level', 'telemetry'),
        ($1, 'webhook_strict_mode', 'true', 'Strict cryptographic HMAC verification', 'security')
      ON CONFLICT (merchant_id, key) DO NOTHING;
    `;

    await pool.query(seedSettingsQuery, [
      merchantId,
      razorpay_key_id.trim(),
      razorpay_key_secret.trim(),
      razorpay_webhook_secret.trim(),
    ]);

    // Seed a sample starter product for this store
    const sampleProductId = randomUUID();
    await pool.query(
      `
      INSERT INTO products (
        id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'ai', $7, $8, $9, $10::jsonb, NOW(), NOW()
      ) ON CONFLICT (id) DO NOTHING;
      `,
      [
        sampleProductId,
        merchantId,
        `${name} Signature Item`,
        `Flagship premium product from ${name}. High quality, handcrafted, and AI-negotiable.`,
        'general',
        ['flagship', 'bestseller', 'premium'],
        199900, // ₹1,999.00
        159900, // ₹1,599.00
        25,
        JSON.stringify({ edition: 'First Batch', warranty: '1 Year Standard' }),
      ]
    );

    return NextResponse.json({
      success: true,
      merchant_id: merchant.id,
      name: merchant.name,
      api_key: merchant.api_key,
      message: 'Store onboarded successfully! Save your API key securely - it will not be displayed again.',
    });
  } catch (error: any) {
    console.error('API /api/merchants/onboard error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Onboarding failed' },
      { status: 500 }
    );
  }
}
