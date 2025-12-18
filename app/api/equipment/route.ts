import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/equipment - ดึงรายการอุปกรณ์ทั่วไป
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
        e.asset_code ILIKE $${paramIndex} OR 
        e.name ILIKE $${paramIndex} OR 
        e.serial_number ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`e.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM equipment e ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        e.*,
        u1.full_name as owner_name,
        u2.full_name as created_by_name,
        l.name as location_name
      FROM equipment e
      LEFT JOIN users u1 ON e.owner_id = u1.user_id
      LEFT JOIN users u2 ON e.created_by = u2.user_id
      LEFT JOIN locations l ON e.location_id = l.location_id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return createSuccessResponse({
      equipment: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/equipment - สร้างอุปกรณ์ใหม่
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
    const prefix = body.assetCodePrefix || 'EQ';
    const assetCodeResult = await pool.query('SELECT generate_asset_code($1) as asset_code', [prefix]);
    const assetCode = assetCodeResult.rows[0].asset_code;

    const insertQuery = `
      INSERT INTO equipment (
        asset_code, name, brand, model, serial_number, purchase_date, purchase_price,
        warranty_expiry_date, warranty_alert_days, department, owner_id, location_id,
        status, allow_borrow, ip_address, mac_address, description, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      assetCode,
      body.name,
      body.brand || null,
      body.model || null,
      body.serialNumber || null,
      body.purchaseDate || null,
      body.purchasePrice || 0,
      body.warrantyExpiryDate || null,
      body.warrantyAlertDays || 30,
      body.department || null,
      body.ownerId || null,
      body.locationId || null,
      body.status || 'Available',
      body.allowBorrow !== undefined ? body.allowBorrow : true,
      body.ipAddress || null,
      body.macAddress || null,
      body.description || null,
      user.userId,
    ]);

    return createSuccessResponse(result.rows[0], 'Equipment created successfully');
  } catch (error) {
    console.error('Create equipment error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

