import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/cartridges - ดึงรายการตลับหมึก
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(
        c.model ILIKE $${paramIndex} OR 
        c.brand ILIKE $${paramIndex} OR
        c.printer_model ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM cartridges c ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        c.*,
        COALESCE(cs.quantity, 0) as stock_quantity,
        COALESCE(cs.min_stock, 5) as min_stock,
        cs.location as stock_location
      FROM cartridges c
      LEFT JOIN cartridge_stock cs ON c.cartridge_id = cs.cartridge_id
      ${whereClause}
      ORDER BY c.created_at DESC
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
      cartridges: filteredResults,
      pagination: {
        page,
        limit,
        total: lowStock ? filteredResults.length : total,
        totalPages: Math.ceil((lowStock ? filteredResults.length : total) / limit),
      },
    });
  } catch (error) {
    console.error('Get cartridges error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/cartridges - สร้างตลับหมึกใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.model) {
      return createErrorResponse('Model is required', 400);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert cartridge
      const insertCartridgeQuery = `
        INSERT INTO cartridges (model, brand, color, type, price, printer_model)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const cartridgeResult = await client.query(insertCartridgeQuery, [
        body.model,
        body.brand || null,
        body.color || null,
        body.type || null,
        body.price || 0,
        body.printerModel || null,
      ]);

      // Create stock entry
      const insertStockQuery = `
        INSERT INTO cartridge_stock (cartridge_id, quantity, min_stock, location)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(insertStockQuery, [
        cartridgeResult.rows[0].cartridge_id,
        body.initialQuantity || 0,
        body.minStock || 5,
        body.location || null,
      ]);

      await client.query('COMMIT');

      return createSuccessResponse(cartridgeResult.rows[0], 'Cartridge created successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create cartridge error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

