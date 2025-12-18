import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/computers - ดึงรายการคอมพิวเตอร์
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const computerType = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(
        c.asset_code ILIKE $${paramIndex} OR 
        c.name ILIKE $${paramIndex} OR 
        c.serial_number ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`c.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (computerType) {
      conditions.push(`c.computer_type = $${paramIndex}`);
      params.push(computerType);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM computers c ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        c.*,
        u1.full_name as it_responsible_name,
        u2.full_name as user_name,
        u3.full_name as created_by_name
      FROM computers c
      LEFT JOIN users u1 ON c.it_responsible_id = u1.user_id
      LEFT JOIN users u2 ON c.user_id = u2.user_id
      LEFT JOIN users u3 ON c.created_by = u3.user_id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return createSuccessResponse({
      computers: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get computers error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/computers - สร้างคอมพิวเตอร์ใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.name || !body.computerType) {
      return createErrorResponse('Name and computer type are required', 400);
    }

    // Generate asset code
    const prefix = body.assetCodePrefix || 'PC';
    const assetCodeResult = await pool.query('SELECT generate_asset_code($1) as asset_code', [prefix]);
    const assetCode = assetCodeResult.rows[0].asset_code;

    const insertQuery = `
      INSERT INTO computers (
        asset_code, name, brand, model, serial_number, computer_type, cpu, ram, storage,
        storage_type, os, os_version, purchase_date, purchase_price, warranty_expiry_date,
        warranty_alert_days, contract_number, contract_start_date, contract_end_date,
        monthly_rent, lessor_company, lessor_contact, it_responsible_id, user_id,
        branch, department, status, description, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      assetCode,
      body.name,
      body.brand || null,
      body.model || null,
      body.serialNumber || null,
      body.computerType,
      body.cpu || null,
      body.ram || null,
      body.storage || null,
      body.storageType || null,
      body.os || null,
      body.osVersion || null,
      body.purchaseDate || null,
      body.purchasePrice || 0,
      body.warrantyExpiryDate || null,
      body.warrantyAlertDays || 30,
      body.contractNumber || null,
      body.contractStartDate || null,
      body.contractEndDate || null,
      body.monthlyRent || null,
      body.lessorCompany || null,
      body.lessorContact || null,
      body.itResponsibleId || null,
      body.userId || null,
      body.branch || null,
      body.department || null,
      body.status || 'Available',
      body.description || null,
      user.userId,
    ]);

    return createSuccessResponse(result.rows[0], 'Computer created successfully');
  } catch (error) {
    console.error('Create computer error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

