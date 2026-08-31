import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { randomUUID } from 'crypto';

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
      SELECT id, merchant_id, name, description, category, tags, base_price, floor_price, stock, attributes, created_at, updated_at
      FROM products
      WHERE merchant_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [merchantId]);

    const formatted = result.rows.map((row) => ({
      ...row,
      formatted_base_price: Math.round(row.base_price / 100).toLocaleString('en-IN'),
      formatted_floor_price: Math.round(row.floor_price / 100).toLocaleString('en-IN'),
    }));

    return NextResponse.json({
      merchant_id: merchantId,
      products: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    console.error('API /api/catalog GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      merchant_id,
      name,
      description,
      category,
      tags = [],
      base_price,
      floor_price,
      stock = 0,
      attributes = {},
      tags_source = 'merchant_created',
    } = body;

    const { searchParams } = new URL(request.url);
    const effectiveMerchantId =
      merchant_id ||
      searchParams.get('merchant_id') ||
      request.headers.get('x-merchant-id') ||
      null;

    if (!effectiveMerchantId) {
      return NextResponse.json(
        {
          error: 'MISSING_MERCHANT_ID',
          message: 'merchant_id is required to create a product.',
          hint: 'Include merchant_id in the request body or pass ?merchant_id= as a query parameter.',
        },
        { status: 400 }
      );
    }

    if (!name || base_price === undefined || floor_price === undefined) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'name, base_price, and floor_price are required' },
        { status: 400 }
      );
    }

    const basePricePaise = typeof base_price === 'number' ? Math.round(base_price) : parseInt(base_price, 10);
    const floorPricePaise = typeof floor_price === 'number' ? Math.round(floor_price) : parseInt(floor_price, 10);

    if (floorPricePaise > basePricePaise) {
      return NextResponse.json(
        { error: 'INVALID_PRICING', message: 'Floor price cannot be higher than base price' },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    const id = randomUUID();

    const insertQuery = `
      INSERT INTO products (
        id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      )
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      id,
      effectiveMerchantId,
      name,
      description || '',
      category || 'general',
      tags,
      tags_source,
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
