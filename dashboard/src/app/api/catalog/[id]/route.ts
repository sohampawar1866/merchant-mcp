import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      name,
      description,
      category,
      tags,
      base_price,
      floor_price,
      stock,
      attributes,
    } = body;

    const pool = getDbPool();

    const basePricePaise = typeof base_price === 'number' ? Math.round(base_price) : parseInt(base_price, 10);
    const floorPricePaise = typeof floor_price === 'number' ? Math.round(floor_price) : parseInt(floor_price, 10);

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
      WHERE id = $9
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
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
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
    const pool = getDbPool();

    const deleteQuery = `DELETE FROM products WHERE id = $1 RETURNING id;`;
    const result = await pool.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted_id: id });
  } catch (error: any) {
    console.error('API /api/catalog/[id] DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
