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
    const { status } = body;

    if (status !== 'active' && status !== 'suspended') {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be 'active' or 'suspended'" },
        { status: 400 }
      );
    }

    const res = await pool.query(
      `UPDATE merchants SET status = $1 WHERE id = $2 RETURNING id, name, status;`,
      [status, id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });
    }

    const updated = res.rows[0];

    return NextResponse.json({
      success: true,
      merchant: updated,
      message: `Store '${updated.name}' is now ${updated.status}. ${
        updated.status === 'suspended' ? 'Platform kill switch activated - all tool calls will be immediately blocked.' : 'Store reactivated.'
      }`,
    });
  } catch (error: any) {
    console.error('Admin status toggle error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
