import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/printers - ดึงรายการเครื่องพิมพ์
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(
        p.asset_code ILIKE $${paramIndex} OR 
        p.name ILIKE $${paramIndex} OR 
        p.serial_number ILIKE $${paramIndex} OR
        p.ip_address ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`p.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM printers p ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        p.*,
        u.full_name as it_responsible_name,
        u2.full_name as created_by_name,
        l.name as location_name
      FROM printers p
      LEFT JOIN users u ON p.it_responsible_id = u.user_id
      LEFT JOIN users u2 ON p.created_by = u2.user_id
      LEFT JOIN locations l ON p.location_id = l.location_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return createSuccessResponse({
      printers: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get printers error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/printers - สร้างเครื่องพิมพ์ใหม่
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

    // Generate asset code
    const prefix = body.assetCodePrefix || 'PRT';
    const assetCodeResult = await pool.query('SELECT generate_asset_code($1) as asset_code', [prefix]);
    const assetCode = assetCodeResult.rows[0].asset_code;

    const insertQuery = `
      INSERT INTO printers (
        asset_code, name, brand, model, serial_number, printer_type, color_type,
        ip_address, purchase_date, purchase_price, warranty_expiry_date,
        warranty_alert_days, location_id, branch, department, it_responsible_id,
        is_shared, status, description, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      assetCode,
      body.name,
      body.brand || null,
      body.model || null,
      body.serialNumber || null,
      body.printerType || null,
      body.colorType || null,
      body.ipAddress || null,
      body.purchaseDate || null,
      body.purchasePrice || 0,
      body.warrantyExpiryDate || null,
      body.warrantyAlertDays || 30,
      body.locationId || null,
      body.branch || null,
      body.department || null,
      body.itResponsibleId || null,
      body.isShared !== undefined ? body.isShared : false,
      body.status || 'Available',
      body.description || null,
      user.userId,
    ]);

    return createSuccessResponse(result.rows[0], 'Printer created successfully');
  } catch (error) {
    console.error('Create printer error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

