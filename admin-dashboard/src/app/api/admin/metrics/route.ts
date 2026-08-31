import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pool = getDbPool();

  try {
    // 1. Merchant Counts
    const merchantsRes = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended
      FROM merchants;
    `);
    const merchantStats = merchantsRes.rows[0];

    // 2. Global Platform GMV & Orders
    const ordersRes = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'paid') as paid_orders,
        COALESCE(SUM(agreed_price) FILTER (WHERE status = 'paid'), 0) as gmv_paise
      FROM orders;
    `);
    const orderStats = ordersRes.rows[0];

    // 3. Global Negotiations
    const negRes = await pool.query(`
      SELECT 
        COUNT(*) as total_negotiations,
        COUNT(*) FILTER (WHERE decision = 'approved') as approved_negotiations,
        COUNT(*) FILTER (WHERE decision = 'rejected') as rejected_negotiations
      FROM negotiations;
    `);
    const negStats = negRes.rows[0];

    const totalNeg = parseInt(negStats.total_negotiations, 10) || 0;
    const approvedNeg = parseInt(negStats.approved_negotiations, 10) || 0;
    const platformSuccessRate = totalNeg > 0 ? Math.round((approvedNeg / totalNeg) * 100) : 100;

    // 4. Global Audit Activity
    const auditRes = await pool.query(`
      SELECT 
        COUNT(*) as total_tool_calls,
        COALESCE(AVG(duration_ms), 0) as avg_latency_ms
      FROM audit_log;
    `);
    const auditStats = auditRes.rows[0];

    // 5. Per-merchant summary breakdown
    const breakdownRes = await pool.query(`
      SELECT 
        m.id,
        m.name,
        m.status,
        m.api_key,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.agreed_price) FILTER (WHERE o.status = 'paid'), 0) as revenue_paise
      FROM merchants m
      LEFT JOIN products p ON p.merchant_id = m.id
      LEFT JOIN orders o ON o.merchant_id = m.id
      GROUP BY m.id, m.name, m.status, m.api_key
      ORDER BY revenue_paise DESC, m.created_at ASC;
    `);

    const gmvPaise = parseInt(orderStats.gmv_paise, 10) || 0;

    return NextResponse.json({
      merchants: {
        total: parseInt(merchantStats.total, 10) || 0,
        active: parseInt(merchantStats.active, 10) || 0,
        suspended: parseInt(merchantStats.suspended, 10) || 0,
      },
      platform_gmv: {
        total_paise: gmvPaise,
        formatted_rupees: Math.round(gmvPaise / 100).toLocaleString('en-IN'),
      },
      orders: {
        total: parseInt(orderStats.total_orders, 10) || 0,
        paid: parseInt(orderStats.paid_orders, 10) || 0,
      },
      negotiations: {
        total: totalNeg,
        approved: approvedNeg,
        rejected: parseInt(negStats.rejected_negotiations, 10) || 0,
        success_rate_percent: platformSuccessRate,
      },
      telemetry: {
        total_tool_calls: parseInt(auditStats.total_tool_calls, 10) || 0,
        avg_latency_ms: Math.round(parseFloat(auditStats.avg_latency_ms) || 0),
      },
      merchant_breakdown: breakdownRes.rows.map((row) => ({
        ...row,
        formatted_revenue: Math.round(row.revenue_paise / 100).toLocaleString('en-IN'),
      })),
    });
  } catch (error: any) {
    console.error('Admin metrics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch platform metrics' }, { status: 500 });
  }
}
