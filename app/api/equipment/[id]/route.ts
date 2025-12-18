import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/equipment/[id] - ดึงข้อมูลอุปกรณ์
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const equipmentId = parseInt(params.id);
    if (isNaN(equipmentId)) {
      return createErrorResponse('Invalid equipment ID', 400);
    }

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
      WHERE e.equipment_id = $1
    `;

    const result = await pool.query(query, [equipmentId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Equipment not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get equipment error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/equipment/[id] - อัปเดตอุปกรณ์
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const equipmentId = parseInt(params.id);
    if (isNaN(equipmentId)) {
      return createErrorResponse('Invalid equipment ID', 400);
    }

    const body = await request.json();

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'brand', 'model', 'serial_number', 'purchase_date', 'purchase_price',
      'warranty_expiry_date', 'warranty_alert_days', 'department', 'owner_id',
      'location_id', 'status', 'allow_borrow', 'ip_address', 'mac_address', 'description'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(body[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return createErrorResponse('No fields to update', 400);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(equipmentId);

    const updateQuery = `
      UPDATE equipment
      SET ${updateFields.join(', ')}
      WHERE equipment_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return createErrorResponse('Equipment not found', 404);
    }

    return createSuccessResponse(result.rows[0], 'Equipment updated successfully');
  } catch (error) {
    console.error('Update equipment error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

