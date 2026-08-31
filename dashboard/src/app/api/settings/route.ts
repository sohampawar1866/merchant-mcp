import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pool = getDbPool();

  try {
    // Ensure table exists and has defaults
    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        key VARCHAR(64) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        category VARCHAR(32) NOT NULL DEFAULT 'general',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      INSERT INTO store_settings (key, value, description, category) VALUES
        ('enable_find_and_price', 'true', 'Enable AI natural language product intent search & price matching', 'features'),
        ('enable_negotiation', 'true', 'Enable autonomous price bargaining and discount concession ladder', 'features'),
        ('enable_human_approval', 'false', 'Require human merchant manual approval for all discount proposals', 'guardrails'),
        ('max_negotiation_attempts', '3', 'Maximum bargaining rounds per product session before lockout', 'guardrails'),
        ('max_tool_calls_per_minute', '30', 'Rate limit threshold per agent session per minute', 'security'),
        ('enable_catalog_cache', 'true', 'Cache product lookups in Redis for sub-millisecond responses', 'performance'),
        ('audit_log_level', 'full', 'Audit log detail level (full or decisions_only)', 'telemetry'),
        ('webhook_strict_mode', 'true', 'Enforce strict cryptographic HMAC-SHA256 signature verification', 'security')
      ON CONFLICT (key) DO NOTHING;
    `);

    const res = await pool.query(`SELECT key, value, description, category, updated_at FROM store_settings ORDER BY category, key;`);

    const settingsMap: Record<string, any> = {};
    for (const row of res.rows) {
      settingsMap[row.key] = {
        value: row.value,
        description: row.description,
        category: row.category,
        updated_at: row.updated_at,
      };
    }

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error: any) {
    console.error('Failed to get store settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database query error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const pool = getDbPool();

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing key or value parameter' },
        { status: 400 }
      );
    }

    await pool.query(
      `
      INSERT INTO store_settings (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `,
      [key, String(value)]
    );

    return NextResponse.json({ success: true, key, value });
  } catch (error: any) {
    console.error('Failed to update store setting:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database update error' },
      { status: 500 }
    );
  }
}
