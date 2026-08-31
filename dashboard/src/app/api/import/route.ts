import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { link_url = '', title = '', amount_paise = 0, merchant_id } = body;

    if (!merchant_id) {
      return NextResponse.json(
        {
          error: 'MISSING_MERCHANT_ID',
          message: 'merchant_id is required to import products.',
          hint: 'Include merchant_id in the request body.',
        },
        { status: 400 }
      );
    }

    const pool = getDbPool();

    // Verify merchant exists
    const merchantRes = await pool.query('SELECT id FROM merchants WHERE id = $1;', [merchant_id]);
    if (merchantRes.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'MERCHANT_NOT_FOUND',
          message: `No merchant found with id '${merchant_id}'.`,
        },
        { status: 404 }
      );
    }

    const sampleProducts = [
      {
        name: title || 'SonicBlast Portable Bluetooth Speaker',
        description: 'Compact 20W rugged outdoor speaker with deep bass, 18-hour playback, and IP67 waterproof rating.',
        category: 'audio',
        tags: ['audio', 'wireless', 'bluetooth', 'speaker', 'waterproof', 'portable'],
        base_price: amount_paise || 249900,
        floor_price: Math.round((amount_paise || 249900) * 0.85),
        stock: 25,
        attributes: { color: 'Storm Black', battery: '18 hours', power: '20W' },
      },
    ];

    const inserted = [];
    for (const p of sampleProducts) {
      const id = randomUUID();
      const res = await pool.query(
        `INSERT INTO products (
          id, merchant_id, name, description, category, tags, base_price, floor_price, stock, attributes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *;`,
        [id, merchant_id, p.name, p.description, p.category, p.tags, p.base_price, p.floor_price, p.stock, JSON.stringify(p.attributes)]
      );
      inserted.push(res.rows[0]);
    }

    return NextResponse.json({
      success: true,
      merchant_id,
      message: `Imported ${inserted.length} product(s) into store catalog`,
      imported_products: inserted,
    });
  } catch (error: any) {
    console.error('API /api/import error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import product' }, { status: 500 });
  }
}
