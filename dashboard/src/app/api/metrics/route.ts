import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getDbPool();

    // 1. Orders & Revenue
    const ordersQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'paid') as paid_orders,
        COALESCE(SUM(agreed_price) FILTER (WHERE status = 'paid'), 0) as total_revenue_paise
      FROM orders;
    `;
    const ordersRes = await pool.query(ordersQuery);
    const orderStats = ordersRes.rows[0];

    // 2. Negotiations & Success Rate
    const negQuery = `
      SELECT
        COUNT(*) as total_negotiations,
        COUNT(*) FILTER (WHERE decision = 'approved') as approved_negotiations,
        COUNT(*) FILTER (WHERE decision = 'rejected') as rejected_negotiations
      FROM negotiations;
    `;
    const negRes = await pool.query(negQuery);
    const negStats = negRes.rows[0];

    const totalNeg = parseInt(negStats.total_negotiations, 10) || 0;
    const approvedNeg = parseInt(negStats.approved_negotiations, 10) || 0;
    const negotiationSuccessRate = totalNeg > 0 ? Math.round((approvedNeg / totalNeg) * 100) : 100;

    // 3. Audit Tool Invocations & Average Latency
    const auditQuery = `
      SELECT
        COUNT(*) as total_invocations,
        COALESCE(AVG(duration_ms), 0) as avg_latency_ms
      FROM audit_log;
    `;
    const auditRes = await pool.query(auditQuery);
    const auditStats = auditRes.rows[0];

    // 4. Active Products Count
    const productsRes = await pool.query('SELECT COUNT(*) as total_products, COALESCE(SUM(stock), 0) as total_stock FROM products;');
    const productStats = productsRes.rows[0];

    // 5. Recent 5 Orders with Product info
    const recentOrdersRes = await pool.query(`
      SELECT 
        o.id,
        o.razorpay_order_id,
        o.agreed_price,
        o.payment_link,
        o.status,
        o.created_at,
        p.name as product_name,
        p.category as product_category
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
      LIMIT 5;
    `);

    const formattedRecentOrders = recentOrdersRes.rows.map((row) => ({
      ...row,
      formatted_price: Math.round(row.agreed_price / 100).toLocaleString('en-IN'),
    }));

    // 6. Recent 5 Shopper Activity items (filter internal tagger tool)
    const recentActivityRes = await pool.query(`
      SELECT
        id,
        correlation_id,
        tool_name,
        input,
        output,
        decision,
        reason_code,
        duration_ms,
        created_at
      FROM audit_log
      WHERE tool_name != 'ai_tagger'
      ORDER BY created_at DESC
      LIMIT 5;
    `);

    const totalPaise = parseInt(orderStats.total_revenue_paise, 10) || 0;
    const formattedRupees = Math.round(totalPaise / 100).toLocaleString('en-IN');

    return NextResponse.json({
      revenue: {
        total_paise: totalPaise,
        formatted_rupees: formattedRupees,
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


