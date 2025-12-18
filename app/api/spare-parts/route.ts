import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/spare-parts - ดึงรายการอะไหล่
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(
        sp.part_code ILIKE $${paramIndex} OR 
        sp.name ILIKE $${paramIndex} OR 
        sp.brand ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      conditions.push(`sp.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM spare_parts sp ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        sp.*,
        COALESCE(sps.quantity, 0) as stock_quantity,
        COALESCE(sps.min_stock, 5) as min_stock,
        COALESCE(sps.max_stock, NULL) as max_stock,
        sps.location as stock_location
      FROM spare_parts sp
      LEFT JOIN spare_parts_stock sps ON sp.spare_part_id = sps.spare_part_id
      ${whereClause}
      ORDER BY sp.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Filter low stock if requested
    let filteredResults = result.rows;
    if (lowStock) {
      filteredResults = result.rows.filter((row: any) => 
        row.stock_quantity <= row.min_stock
      );
    }

    return createSuccessResponse({
      spareParts: filteredResults,
      pagination: {
        page,
        limit,
        total: lowStock ? filteredResults.length : total,
        totalPages: Math.ceil((lowStock ? filteredResults.length : total) / limit),
      },
    });
  } catch (error) {
    console.error('Get spare parts error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/spare-parts - สร้างอะไหล่ใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.name) {
      return createErrorResponse('Name is required', 400);
    }

    // Generate part code if not provided
    let partCode = body.partCode;
    if (!partCode) {
      const year = new Date().getFullYear().toString().slice(-2);
      const countResult = await pool.query(
        `SELECT COUNT(*) + 1 as next_num FROM spare_parts WHERE part_code LIKE $1`,
        [`SP${year}%`]
      );
      const nextNum = countResult.rows[0].next_num;
      partCode = `SP${year}${nextNum.toString().padStart(4, '0')}`;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert spare part
      const insertPartQuery = `
        INSERT INTO spare_parts (part_code, name, category, brand, model, unit_price, unit, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const partResult = await client.query(insertPartQuery, [
        partCode,
        body.name,
        body.category || null,
        body.brand || null,
        body.model || null,
        body.unitPrice || 0,
        body.unit || 'ชิ้น',
        body.description || null,
      ]);

      // Create stock entry
      const insertStockQuery = `
        INSERT INTO spare_parts_stock (spare_part_id, quantity, min_stock, max_stock, location)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(insertStockQuery, [
        partResult.rows[0].spare_part_id,
        body.initialQuantity || 0,
        body.minStock || 5,
        body.maxStock || null,
        body.location || null,
      ]);

      await client.query('COMMIT');

      return createSuccessResponse(partResult.rows[0], 'Spare part created successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    if (error.code === '23505') {
      return createErrorResponse('Part code already exists', 400);
    }
    console.error('Create spare part error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

