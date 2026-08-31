import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getMerchantId(request: NextRequest): string | null {
  const { searchParams } = new URL(request.url);
  return searchParams.get('merchant_id') || request.headers.get('x-merchant-id') || null;
}

export async function GET(request: NextRequest) {
  const merchantId = getMerchantId(request);
  if (!merchantId) {
    return NextResponse.json(
      {
        error: 'MISSING_MERCHANT_ID',
        message: 'No merchant_id provided. Pass ?merchant_id= as a query parameter.',
        hint: 'Visit /onboard to register your store and get an ID.',
      },
      { status: 400 }
    );
  }

  const pool = getDbPool();

  try {
    const res = await pool.query(
      `SELECT key, value, description, category, updated_at FROM store_settings WHERE merchant_id = $1 ORDER BY category, key;`,
      [merchantId]
    );

    const settingsMap: Record<string, any> = {};
    for (const row of res.rows) {
      settingsMap[row.key] = {
        value: row.value,
        description: row.description,
        category: row.category,
        updated_at: row.updated_at,
      };
    }

    return NextResponse.json({ success: true, merchant_id: merchantId, settings: settingsMap });
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
    const { key, value, merchant_id } = body;

    if (!merchant_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_MERCHANT_ID',
          message: 'merchant_id is required to update store settings.',
          hint: 'Include merchant_id in the request body.',
        },
        { status: 400 }
      );
    }

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'MISSING_FIELDS', message: 'key and value are required' },
        { status: 400 }
      );
    }

    await pool.query(
      `
      INSERT INTO store_settings (merchant_id, key, value, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (merchant_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `,
      [merchant_id, key, String(value)]
    );

    return NextResponse.json({ success: true, merchant_id, key, value });
  } catch (error: any) {
    console.error('Failed to update store setting:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database update error' },
      { status: 500 }
    );
  }
}
