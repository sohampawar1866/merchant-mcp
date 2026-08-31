import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pool = getDbPool();
  const { id } = params;

  try {
    const body = await request.json();
    const { feature_overrides } = body;

    const res = await pool.query(
      `UPDATE merchants SET feature_overrides = $1::jsonb WHERE id = $2 RETURNING id, name, feature_overrides;`,
      [JSON.stringify(feature_overrides || {}), id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      merchant: res.rows[0],
    });
  } catch (error: any) {
    console.error('Admin feature overrides error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
