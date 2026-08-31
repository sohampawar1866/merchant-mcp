import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pool = getDbPool();

  try {
    const query = `
      SELECT 
        m.id,
        m.name,
        m.razorpay_key_id,
        m.status,
        m.feature_overrides,
        m.api_key,
        m.created_at,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.agreed_price) FILTER (WHERE o.status = 'paid'), 0) as total_revenue_paise
      FROM merchants m
      LEFT JOIN products p ON p.merchant_id = m.id
      LEFT JOIN orders o ON o.merchant_id = m.id
      GROUP BY m.id, m.name, m.razorpay_key_id, m.status, m.feature_overrides, m.api_key, m.created_at
      ORDER BY m.created_at ASC;
    `;

    const res = await pool.query(query);

    return NextResponse.json({
      success: true,
      merchants: res.rows.map((row) => ({
        ...row,
        formatted_revenue: Math.round(row.total_revenue_paise / 100).toLocaleString('en-IN'),
      })),
    });
  } catch (error: any) {
    console.error('Admin merchants error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
