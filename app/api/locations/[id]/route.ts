import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse, requireRole } from '@/lib/middleware';
import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  address: z.string().optional(),
  description: z.string().optional(),
});

// GET /api/locations/[id] - ดึงข้อมูลสถานที่รายการเดียว
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const locationId = parseInt(params.id);
    if (isNaN(locationId)) {
      return createErrorResponse('Invalid location ID', 400);
    }

    const result = await pool.query(
      'SELECT * FROM locations WHERE location_id = $1',
      [locationId]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Location not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get location error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/locations/[id] - อัปเดตสถานที่
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    if (!requireRole(['Admin'])(user)) {
      return createErrorResponse('Forbidden: Admin access required', 403);
    }

    const locationId = parseInt(params.id);
    if (isNaN(locationId)) {
      return createErrorResponse('Invalid location ID', 400);
    }

    const body = await request.json();
    const validationResult = locationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors[0].message,
        400
      );
    }

    const data = validationResult.data;

    // Check if location exists
    const existing = await pool.query(
      'SELECT location_id FROM locations WHERE location_id = $1',
      [locationId]
    );

    if (existing.rows.length === 0) {
      return createErrorResponse('Location not found', 404);
    }

    const result = await pool.query(
      `UPDATE locations 
       SET name = $1, address = $2, description = $3, updated_at = CURRENT_TIMESTAMP
       WHERE location_id = $4
       RETURNING *`,
      [data.name, data.address || null, data.description || null, locationId]
    );

    return createSuccessResponse(result.rows[0], 'Location updated successfully');
  } catch (error) {
    console.error('Update location error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/locations/[id] - ลบสถานที่
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    if (!requireRole(['Admin'])(user)) {
      return createErrorResponse('Forbidden: Admin access required', 403);
    }

    const locationId = parseInt(params.id);
    if (isNaN(locationId)) {
      return createErrorResponse('Invalid location ID', 400);
    }

    // Check if location is used by any assets
    const assetsUsing = await pool.query(
      'SELECT COUNT(*) as count FROM assets WHERE location_id = $1 AND deleted_at IS NULL',
      [locationId]
    );

    if (parseInt(assetsUsing.rows[0].count) > 0) {
      return createErrorResponse('Cannot delete location that is being used by assets', 400);
    }

    await pool.query('DELETE FROM locations WHERE location_id = $1', [locationId]);

    return createSuccessResponse(null, 'Location deleted successfully');
  } catch (error) {
    console.error('Delete location error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

