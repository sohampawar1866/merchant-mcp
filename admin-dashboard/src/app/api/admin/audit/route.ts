import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const pool = getDbPool();
  const { searchParams } = new URL(request.url);

  try {
    const merchantId = searchParams.get('merchant_id') || '';
    const tool = searchParams.get('tool') || '';
    const decision = searchParams.get('decision') || '';
    const search = searchParams.get('search') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (merchantId && merchantId !== 'all') {
      values.push(merchantId);
      conditions.push(`a.merchant_id = $${values.length}`);
    }

    if (tool && tool !== 'all') {
      values.push(tool);
      conditions.push(`a.tool_name = $${values.length}`);
    }

    if (decision && decision !== 'all') {
      values.push(decision);
      conditions.push(`a.decision = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const idx = values.length;
      conditions.push(`(
        a.correlation_id::text ILIKE $${idx}
        OR a.tool_name ILIKE $${idx}
        OR a.reason_code ILIKE $${idx}
        OR a.input::text ILIKE $${idx}
        OR a.output::text ILIKE $${idx}
        OR m.name ILIKE $${idx}
      )`);
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `
      SELECT COUNT(*) as total
      FROM audit_log a
      LEFT JOIN merchants m ON a.merchant_id = m.id
      WHERE ${whereClause};
    `;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    values.push(limit);
    const limitIdx = values.length;
    values.push(offset);
    const offsetIdx = values.length;

    const dataQuery = `
      SELECT 
        a.id,
        a.merchant_id,
        COALESCE(m.name, 'Unknown Merchant') as merchant_name,
        a.correlation_id,
        a.tool_name,
        a.input,
        a.decision,
        a.reason_code,
        a.output,
        a.duration_ms,
        a.error_message,
        a.created_at
      FROM audit_log a
      LEFT JOIN merchants m ON a.merchant_id = m.id
      WHERE ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const dataRes = await pool.query(dataQuery, values);

    return NextResponse.json({
      success: true,
      entries: dataRes.rows,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Admin cross-merchant audit error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
