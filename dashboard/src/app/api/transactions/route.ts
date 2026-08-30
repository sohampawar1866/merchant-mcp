import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getDbPool();

    const query = `
      SELECT 
        o.id,
        o.razorpay_order_id,
        o.product_id,
        p.name as product_name,
        p.category as product_category,
        o.agreed_price,
        o.status,
        o.idempotency_key,
        o.payment_link,
        o.created_at,
        o.updated_at
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
      LIMIT 100;
    `;

    const result = await pool.query(query);

    const formattedTransactions = result.rows.map((row) => ({
      ...row,
      formatted_price: Math.round(row.agreed_price / 100).toLocaleString('en-IN'),
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      total: formattedTransactions.length,
    });
  } catch (error: any) {
    console.error('API /api/transactions error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}
