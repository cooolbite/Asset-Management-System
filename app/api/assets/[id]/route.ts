import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse, requireRole } from '@/lib/middleware';
import { assetUpdateSchema } from '@/lib/validation';

// GET /api/assets/[id] - ดึงข้อมูลทรัพย์สินรายการเดียว
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const assetId = parseInt(params.id);
    if (isNaN(assetId)) {
      return createErrorResponse('Invalid asset ID', 400);
    }

    const query = `
      SELECT 
        a.*,
        c.name as category_name,
        l.name as location_name,
        u.username as current_user_username,
        creator.username as creator_username,
        updater.username as updater_username
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.category_id
      LEFT JOIN locations l ON a.location_id = l.location_id
      LEFT JOIN users u ON a.current_user_id = u.user_id
      LEFT JOIN users creator ON a.created_by = creator.user_id
      LEFT JOIN users updater ON a.updated_by = updater.user_id
      WHERE a.asset_id = $1 AND a.deleted_at IS NULL
    `;

    const result = await pool.query(query, [assetId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Asset not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get asset error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/assets/[id] - อัปเดตข้อมูลทรัพย์สิน
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const assetId = parseInt(params.id);
    if (isNaN(assetId)) {
      return createErrorResponse('Invalid asset ID', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = assetUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors[0].message,
        400
      );
    }

    // Check if asset exists
    const existingAsset = await pool.query(
      'SELECT asset_id, status FROM assets WHERE asset_id = $1 AND deleted_at IS NULL',
      [assetId]
    );

    if (existingAsset.rows.length === 0) {
      return createErrorResponse('Asset not found', 404);
    }

    // Check if asset is in use (cannot update if in use, except status)
    if (existingAsset.rows[0].status === 'In Use' && body.status !== 'In Use') {
      // Allow status change from In Use
    }

    const data = validationResult.data;

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (data.assetName !== undefined) {
      updateFields.push(`asset_name = $${paramIndex}`);
      updateValues.push(data.assetName);
      paramIndex++;
    }

    if (data.assetType !== undefined) {
      updateFields.push(`asset_type = $${paramIndex}`);
      updateValues.push(data.assetType);
      paramIndex++;
    }

    if (data.categoryId !== undefined) {
      // Verify category exists
      const categoryCheck = await pool.query(
        'SELECT category_id FROM categories WHERE category_id = $1',
        [data.categoryId]
      );
      if (categoryCheck.rows.length === 0) {
        return createErrorResponse('Category not found', 400);
      }
      updateFields.push(`category_id = $${paramIndex}`);
      updateValues.push(data.categoryId);
      paramIndex++;
    }

    if (data.locationId !== undefined) {
      // Verify location exists
      const locationCheck = await pool.query(
        'SELECT location_id FROM locations WHERE location_id = $1',
        [data.locationId]
      );
      if (locationCheck.rows.length === 0) {
        return createErrorResponse('Location not found', 400);
      }
      updateFields.push(`location_id = $${paramIndex}`);
      updateValues.push(data.locationId);
      paramIndex++;
    }

    if (data.acquisitionDate !== undefined) {
      updateFields.push(`acquisition_date = $${paramIndex}`);
      updateValues.push(data.acquisitionDate);
      paramIndex++;
    }

    if (data.cost !== undefined) {
      updateFields.push(`cost = $${paramIndex}`);
      updateValues.push(data.cost);
      paramIndex++;
    }

    if (data.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      updateValues.push(data.status);
      paramIndex++;
    }

    if (data.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      updateValues.push(data.description);
      paramIndex++;
    }

    if (data.vendorSupplier !== undefined) {
      updateFields.push(`vendor_supplier = $${paramIndex}`);
      updateValues.push(data.vendorSupplier);
      paramIndex++;
    }

    if (data.warrantyExpiryDate !== undefined) {
      updateFields.push(`warranty_expiry_date = $${paramIndex}`);
      updateValues.push(data.warrantyExpiryDate);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return createErrorResponse('No fields to update', 400);
    }

    // Add updated_by and updated_at
    updateFields.push(`updated_by = $${paramIndex}`);
    updateValues.push(user.userId);
    paramIndex++;

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add asset_id for WHERE clause
    updateValues.push(assetId);

    const updateQuery = `
      UPDATE assets
      SET ${updateFields.join(', ')}
      WHERE asset_id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return createErrorResponse('Asset not found or could not be updated', 404);
    }

    return createSuccessResponse(result.rows[0], 'Asset updated successfully');
  } catch (error) {
    console.error('Update asset error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

