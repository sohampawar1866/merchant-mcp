import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tool = searchParams.get('tool') || '';
    const decision = searchParams.get('decision') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const pool = getDbPool();

    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (search) {
      values.push(`%${search}%`);
      const idx = values.length;
      conditions.push(`(
        correlation_id::text ILIKE $${idx}
        OR tool_name ILIKE $${idx}
        OR reason_code ILIKE $${idx}
        OR input::text ILIKE $${idx}
        OR output::text ILIKE $${idx}
      )`);
    }

    if (tool && tool !== 'all') {
      values.push(tool);
      conditions.push(`tool_name = $${values.length}`);
    }

    if (decision && decision !== 'all') {
      values.push(decision);
      conditions.push(`decision = $${values.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `SELECT COUNT(*) as total FROM audit_log WHERE ${whereClause};`;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    values.push(limit);
    const limitIdx = values.length;
    values.push(offset);
    const offsetIdx = values.length;

    const dataQuery = `
      SELECT id, correlation_id, tool_name, input, decision, reason_code, output, duration_ms, error_message, created_at
      FROM audit_log
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const dataRes = await pool.query(dataQuery, values);

    return NextResponse.json({
      entries: dataRes.rows,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('API /api/audit error:', error);
    return NextResponse.json({ error: error.message || 'Failed to query audit logs' }, { status: 500 });
  }
}
