import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse, requireRole } from '@/lib/middleware';
import { assetCreateSchema } from '@/lib/validation';

// GET /api/assets - ดึงรายการทรัพย์สิน
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const assetType = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const locationId = searchParams.get('locationId') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = ['a.deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(
        a.serial_number ILIKE $${paramIndex} OR 
        a.asset_name ILIKE $${paramIndex} OR 
        a.description ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (assetType) {
      conditions.push(`a.asset_type = $${paramIndex}`);
      params.push(assetType);
      paramIndex++;
    }

    if (status) {
      conditions.push(`a.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (locationId) {
      conditions.push(`a.location_id = $${paramIndex}`);
      params.push(parseInt(locationId));
      paramIndex++;
    }

    if (categoryId) {
      conditions.push(`a.category_id = $${paramIndex}`);
      params.push(parseInt(categoryId));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sortBy and sortOrder
    const allowedSortColumns = ['serial_number', 'asset_name', 'acquisition_date', 'cost', 'status', 'created_at'];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM assets a
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get assets with pagination
    const query = `
      SELECT 
        a.asset_id,
        a.serial_number,
        a.asset_name,
        a.asset_type,
        a.category_id,
        c.name as category_name,
        a.location_id,
        l.name as location_name,
        a.acquisition_date,
        a.cost,
        a.status,
        a.description,
        a.vendor_supplier,
        a.warranty_expiry_date,
        a.current_user_id,
        u.username as current_user_username,
        a.created_at,
        a.updated_at
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.category_id
      LEFT JOIN locations l ON a.location_id = l.location_id
      LEFT JOIN users u ON a.current_user_id = u.user_id
      ${whereClause}
      ORDER BY a.${validSortBy} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return createSuccessResponse({
      assets: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get assets error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/assets - สร้างทรัพย์สินใหม่
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Check if user is Admin
    if (!requireRole(['Admin'])(user)) {
      return createErrorResponse('Forbidden: Admin access required', 403);
    }

    const body = await request.json();

    // Validate input
    const validationResult = assetCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors[0].message,
        400
      );
    }

    const data = validationResult.data;

    // Check if serial number already exists
    const existingAsset = await pool.query(
      'SELECT asset_id FROM assets WHERE serial_number = $1 AND deleted_at IS NULL',
      [data.serialNumber]
    );

    if (existingAsset.rows.length > 0) {
      return createErrorResponse('Serial number already exists', 400);
    }

    // Verify category exists
    const categoryCheck = await pool.query(
      'SELECT category_id FROM categories WHERE category_id = $1',
      [data.categoryId]
    );

    if (categoryCheck.rows.length === 0) {
      return createErrorResponse('Category not found', 400);
    }

    // Verify location exists
    const locationCheck = await pool.query(
      'SELECT location_id FROM locations WHERE location_id = $1',
      [data.locationId]
    );

    if (locationCheck.rows.length === 0) {
      return createErrorResponse('Location not found', 400);
    }

    // Insert asset
    const insertQuery = `
      INSERT INTO assets (
        serial_number, asset_name, asset_type, category_id, location_id,
        acquisition_date, cost, status, description, vendor_supplier,
        warranty_expiry_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      data.serialNumber,
      data.assetName,
      data.assetType,
      data.categoryId,
      data.locationId,
      data.acquisitionDate,
      data.cost,
      data.status || 'Available',
      data.description || null,
      data.vendorSupplier || null,
      data.warrantyExpiryDate || null,
      user.userId,
    ]);

    return createSuccessResponse(result.rows[0], 'Asset created successfully');
  } catch (error) {
    console.error('Create asset error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

