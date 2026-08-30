import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getDbPool();
    const query = `
      SELECT id, name, description, category, tags, base_price, floor_price, stock, attributes, created_at, updated_at
      FROM products
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query);

    const formatted = result.rows.map((row) => ({
      ...row,
      formatted_base_price: Math.round(row.base_price / 100).toLocaleString('en-IN'),
      formatted_floor_price: Math.round(row.floor_price / 100).toLocaleString('en-IN'),
    }));

    return NextResponse.json({ products: formatted, total: formatted.length });
  } catch (error: any) {
    console.error('API /api/catalog GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      tags = [],
      base_price, // in paise or rupees
      floor_price,
      stock = 0,
      attributes = {},
      tags_source = 'merchant_created',
    } = body;

    if (!name || base_price === undefined || floor_price === undefined) {
      return NextResponse.json(
        { error: 'Name, base_price, and floor_price are required' },
        { status: 400 }
      );
    }

    const basePricePaise = typeof base_price === 'number' ? Math.round(base_price) : parseInt(base_price, 10);
    const floorPricePaise = typeof floor_price === 'number' ? Math.round(floor_price) : parseInt(floor_price, 10);

    if (floorPricePaise > basePricePaise) {
      return NextResponse.json(
        { error: 'Floor price cannot be higher than base price' },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    const id = randomUUID();

    const insertQuery = `
      INSERT INTO products (
        id, name, description, category, tags, base_price, floor_price, stock, attributes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      id,
      name,
      description || '',
      category || 'general',
      tags,
      basePricePaise,
      floorPricePaise,
      parseInt(stock, 10) || 0,
      JSON.stringify(attributes),
    ]);

    return NextResponse.json({ product: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/catalog POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
