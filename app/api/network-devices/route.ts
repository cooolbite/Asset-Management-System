import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/network-devices - ดึงรายการอุปกรณ์เครือข่าย
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(
        nd.asset_code ILIKE $${paramIndex} OR 
        nd.name ILIKE $${paramIndex} OR 
        nd.serial_number ILIKE $${paramIndex} OR
        nd.ip_address ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`nd.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (type) {
      conditions.push(`nd.device_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM network_devices nd ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        nd.*,
        u.full_name as it_responsible_name,
        u2.full_name as created_by_name
      FROM network_devices nd
      LEFT JOIN users u ON nd.it_responsible_id = u.user_id
      LEFT JOIN users u2 ON nd.created_by = u2.user_id
      ${whereClause}
      ORDER BY nd.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return createSuccessResponse({
      devices: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get network devices error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/network-devices - สร้างอุปกรณ์เครือข่ายใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.name || !body.deviceType) {
      return createErrorResponse('Name and device type are required', 400);
    }

    // Generate asset code
    const prefix = body.assetCodePrefix || 'NET';
    const assetCodeResult = await pool.query('SELECT generate_asset_code($1) as asset_code', [prefix]);
    const assetCode = assetCodeResult.rows[0].asset_code;

    const insertQuery = `
      INSERT INTO network_devices (
        asset_code, name, brand, model, serial_number, device_type, ip_address,
        mac_address, port_count, bandwidth, vlan, firmware_version, location,
        branch, it_responsible_id, purchase_date, purchase_price,
        warranty_expiry_date, warranty_alert_days, status, description, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      assetCode,
      body.name,
      body.brand || null,
      body.model || null,
      body.serialNumber || null,
      body.deviceType,
      body.ipAddress || null,
      body.macAddress || null,
      body.portCount || null,
      body.bandwidth || null,
      body.vlan || null,
      body.firmwareVersion || null,
      body.location || null,
      body.branch || null,
      body.itResponsibleId || null,
      body.purchaseDate || null,
      body.purchasePrice || 0,
      body.warrantyExpiryDate || null,
      body.warrantyAlertDays || 30,
      body.status || 'Available',
      body.description || null,
      user.userId,
    ]);

    return createSuccessResponse(result.rows[0], 'Network device created successfully');
  } catch (error) {
    console.error('Create network device error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

