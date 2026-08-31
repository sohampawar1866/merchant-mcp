import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getMerchantId(request: NextRequest): string | null {
  const { searchParams } = new URL(request.url);
  return (
    searchParams.get('merchant_id') ||
    request.headers.get('x-merchant-id') ||
    null
  );
}

export async function GET(request: NextRequest) {
  const merchantId = getMerchantId(request);
  if (!merchantId) {
    return NextResponse.json(
      {
        error: 'MISSING_MERCHANT_ID',
        message: 'No merchant_id provided. Pass ?merchant_id= as a query parameter or set the X-Merchant-Id header.',
        hint: 'Visit /onboard to register your store and get an ID.',
      },
      { status: 400 }
    );
  }

  try {
    const pool = getDbPool();

    // Verify merchant exists
    const merchantRes = await pool.query('SELECT id, name, status, api_key FROM merchants WHERE id = $1;', [merchantId]);
    if (merchantRes.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'MERCHANT_NOT_FOUND',
          message: `No merchant found with id '${merchantId}'.`,
          hint: 'Check the merchant_id or visit /onboard to register a new store.',
        },
        { status: 404 }
      );
    }
    const currentMerchant = merchantRes.rows[0];

    // Orders & Revenue scoped by merchant_id
    const ordersRes = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'paid') as paid_orders,
        COALESCE(SUM(agreed_price) FILTER (WHERE status = 'paid'), 0) as total_revenue_paise
      FROM orders WHERE merchant_id = $1;
    `, [merchantId]);
    const orderStats = ordersRes.rows[0];

    // Negotiations & Success Rate
    const negRes = await pool.query(`
      SELECT
        COUNT(*) as total_negotiations,
        COUNT(*) FILTER (WHERE decision = 'approved') as approved_negotiations,
        COUNT(*) FILTER (WHERE decision = 'rejected') as rejected_negotiations
      FROM negotiations WHERE merchant_id = $1;
    `, [merchantId]);
    const negStats = negRes.rows[0];

    const totalNeg = parseInt(negStats.total_negotiations, 10) || 0;
    const approvedNeg = parseInt(negStats.approved_negotiations, 10) || 0;
    const negotiationSuccessRate = totalNeg > 0 ? Math.round((approvedNeg / totalNeg) * 100) : 100;

    // Audit Tool Invocations & Average Latency
    const auditRes = await pool.query(`
      SELECT
        COUNT(*) as total_invocations,
        COALESCE(AVG(duration_ms), 0) as avg_latency_ms
      FROM audit_log WHERE merchant_id = $1;
    `, [merchantId]);
    const auditStats = auditRes.rows[0];

    // Active Products Count
    const productsRes = await pool.query(
      'SELECT COUNT(*) as total_products, COALESCE(SUM(stock), 0) as total_stock FROM products WHERE merchant_id = $1;',
      [merchantId]
    );
    const productStats = productsRes.rows[0];

    // Recent 5 Orders
    const recentOrdersRes = await pool.query(`
      SELECT 
        o.id, o.razorpay_order_id, o.agreed_price, o.payment_link, o.status, o.created_at,
        p.name as product_name, p.category as product_category
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.merchant_id = $1
      ORDER BY o.created_at DESC LIMIT 5;
    `, [merchantId]);

    const formattedRecentOrders = recentOrdersRes.rows.map((row) => ({
      ...row,
      formatted_price: Math.round(row.agreed_price / 100).toLocaleString('en-IN'),
    }));

    // Recent 5 Shopper Activity items
    const recentActivityRes = await pool.query(`
      SELECT id, correlation_id, tool_name, input, output, decision, reason_code, duration_ms, created_at
      FROM audit_log
      WHERE merchant_id = $1 AND tool_name != 'ai_tagger'
      ORDER BY created_at DESC LIMIT 5;
    `, [merchantId]);

    const totalPaise = parseInt(orderStats.total_revenue_paise, 10) || 0;

    return NextResponse.json({
      merchant: currentMerchant,
      revenue: {
        total_paise: totalPaise,
        formatted_rupees: Math.round(totalPaise / 100).toLocaleString('en-IN'),
      },
      orders: {
        total: parseInt(orderStats.total_orders, 10) || 0,
        paid: parseInt(orderStats.paid_orders, 10) || 0,
      },
      negotiations: {
        total: totalNeg,
        approved: approvedNeg,
        rejected: parseInt(negStats.rejected_negotiations, 10) || 0,
        success_rate_percent: negotiationSuccessRate,
      },
      agent_activity: {
        total_tool_calls: parseInt(auditStats.total_invocations, 10) || 0,
        avg_latency_ms: Math.round(parseFloat(auditStats.avg_latency_ms) || 0),
      },
      catalog: {
        total_products: parseInt(productStats.total_products, 10) || 0,
        total_stock: parseInt(productStats.total_stock, 10) || 0,
      },
      recent_orders: formattedRecentOrders,
      recent_activity: recentActivityRes.rows,
    });
  } catch (error: any) {
    console.error('API /api/metrics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch metrics' }, { status: 500 });
  }
}
