import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getDbPool();
    const res = await pool.query(`
      SELECT 
        m.id, 
        m.name, 
        m.api_key, 
        m.status, 
        m.razorpay_key_id,
        m.created_at,
        COUNT(p.id)::int AS product_count
      FROM merchants m
      LEFT JOIN products p ON m.id = p.merchant_id
      GROUP BY m.id, m.name, m.api_key, m.status, m.razorpay_key_id, m.created_at
      ORDER BY m.created_at ASC;
    `);

    return NextResponse.json({
      merchants: res.rows,
      count: res.rows.length,
    });
  } catch (error: any) {
    console.error('API /api/merchants error:', error);
    return NextResponse.json(
      { error: 'DATABASE_ERROR', message: error.message || 'Failed to fetch merchants list' },
      { status: 500 }
    );
  }
}
