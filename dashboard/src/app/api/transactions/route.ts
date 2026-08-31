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

  try {
    const pool = getDbPool();

    const query = `
      SELECT 
        o.id, o.razorpay_order_id, o.product_id,
        p.name as product_name, p.category as product_category,
        o.agreed_price, o.status, o.idempotency_key, o.payment_link, o.created_at, o.updated_at
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.merchant_id = $1
      ORDER BY o.created_at DESC
      LIMIT 100;
    `;

    const result = await pool.query(query, [merchantId]);

    const formattedTransactions = result.rows.map((row) => ({
      ...row,
      formatted_price: Math.round(row.agreed_price / 100).toLocaleString('en-IN'),
    }));

    return NextResponse.json({
      merchant_id: merchantId,
      transactions: formattedTransactions,
      total: formattedTransactions.length,
    });
  } catch (error: any) {
    console.error('API /api/transactions error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}
