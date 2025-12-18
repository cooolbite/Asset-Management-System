import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/monitors - ดึงรายการจอภาพ
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
        m.asset_code ILIKE $${paramIndex} OR 
        m.name ILIKE $${paramIndex} OR 
        m.serial_number ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`m.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM monitors m ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        m.*,
        u1.full_name as it_responsible_name,
        u2.full_name as created_by_name,
        c.name as computer_name,
        c.asset_code as computer_code
      FROM monitors m
      LEFT JOIN users u1 ON m.it_responsible_id = u1.user_id
      LEFT JOIN users u2 ON m.created_by = u2.user_id
      LEFT JOIN computers c ON m.computer_id = c.computer_id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return createSuccessResponse({
      monitors: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get monitors error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/monitors - สร้างจอภาพใหม่
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
    const prefix = body.assetCodePrefix || 'MON';
    const assetCodeResult = await pool.query('SELECT generate_asset_code($1) as asset_code', [prefix]);
    const assetCode = assetCodeResult.rows[0].asset_code;

    const insertQuery = `
      INSERT INTO monitors (
        asset_code, name, brand, model, serial_number, screen_size, resolution,
        display_type, ports, purchase_date, purchase_price, warranty_expiry_date,
        warranty_alert_days, computer_id, it_responsible_id, branch, department,
        status, description, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      assetCode,
      body.name,
      body.brand || null,
      body.model || null,
      body.serialNumber || null,
      body.screenSize || null,
      body.resolution || null,
      body.displayType || null,
      body.ports || null,
      body.purchaseDate || null,
      body.purchasePrice || 0,
      body.warrantyExpiryDate || null,
      body.warrantyAlertDays || 30,
      body.computerId || null,
      body.itResponsibleId || null,
      body.branch || null,
      body.department || null,
      body.status || 'Available',
      body.description || null,
      user.userId,
    ]);

    return createSuccessResponse(result.rows[0], 'Monitor created successfully');
  } catch (error) {
    console.error('Create monitor error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

