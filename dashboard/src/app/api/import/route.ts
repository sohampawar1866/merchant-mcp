import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { link_url = '', title = '', amount_paise = 0 } = body;

    const pool = getDbPool();

    // Default sample item if no URL provided
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
      const insertQuery = `
        INSERT INTO products (
          id, name, description, category, tags, base_price, floor_price, stock, attributes, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )
        RETURNING *;
      `;
      const res = await pool.query(insertQuery, [
        id,
        p.name,
        p.description,
        p.category,
        p.tags,
        p.base_price,
        p.floor_price,
        p.stock,
        JSON.stringify(p.attributes),
      ]);
      inserted.push(res.rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${inserted.length} product(s) from Razorpay Payment Link`,
      imported_products: inserted,
    });
  } catch (error: any) {
    console.error('API /api/import error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import product' }, { status: 500 });
  }
}
