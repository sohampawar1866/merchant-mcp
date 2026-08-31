import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getMerchantId(request: NextRequest): string | null {
  const { searchParams } = new URL(request.url);
  return searchParams.get('merchant_id') || request.headers.get('x-merchant-id') || null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      merchant_id,
      name,
      description,
      category,
      tags,
      base_price,
      floor_price,
      stock,
      attributes,
    } = body;

    const effectiveMerchantId =
      merchant_id || getMerchantId(request);

    if (!effectiveMerchantId) {
      return NextResponse.json(
        {
          error: 'MISSING_MERCHANT_ID',
          message: 'merchant_id is required to update a product.',
          hint: 'Include merchant_id in the request body or pass ?merchant_id= as a query parameter.',
        },
        { status: 400 }
      );
    }

    const pool = getDbPool();

    const basePricePaise =
      typeof base_price === 'number'
        ? Math.round(base_price)
        : base_price
        ? parseInt(base_price, 10)
        : null;
    const floorPricePaise =
      typeof floor_price === 'number'
        ? Math.round(floor_price)
        : floor_price
        ? parseInt(floor_price, 10)
        : null;

    const updateQuery = `
      UPDATE products
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        tags = COALESCE($4, tags),
        base_price = COALESCE($5, base_price),
        floor_price = COALESCE($6, floor_price),
        stock = COALESCE($7, stock),
        attributes = COALESCE($8, attributes),
        updated_at = NOW()
      WHERE id = $9 AND merchant_id = $10
      RETURNING *;
    `;

    const result = await pool.query(updateQuery, [
      name,
      description,
      category,
      tags,
      basePricePaise,
      floorPricePaise,
      stock !== undefined ? parseInt(stock, 10) : null,
      attributes ? JSON.stringify(attributes) : null,
      id,
      effectiveMerchantId,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'PRODUCT_NOT_FOUND', message: 'Product not found in this store or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: result.rows[0] });
  } catch (error: any) {
    console.error('API /api/catalog/[id] PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const merchantId = getMerchantId(request);

    if (!merchantId) {
      return NextResponse.json(
        {
          error: 'MISSING_MERCHANT_ID',
          message: 'merchant_id is required to delete a product.',
          hint: 'Pass ?merchant_id= as a query parameter or set the X-Merchant-Id header.',
        },
        { status: 400 }
      );
    }

    const pool = getDbPool();

    const deleteQuery = `DELETE FROM products WHERE id = $1 AND merchant_id = $2 RETURNING id;`;
    const result = await pool.query(deleteQuery, [id, merchantId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'PRODUCT_NOT_FOUND', message: 'Product not found in this store or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted_id: id });
  } catch (error: any) {
    console.error('API /api/catalog/[id] DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
