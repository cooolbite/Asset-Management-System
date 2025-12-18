import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/monitors/[id] - ดึงข้อมูลจอภาพ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const monitorId = parseInt(params.id);
    if (isNaN(monitorId)) {
      return createErrorResponse('Invalid monitor ID', 400);
    }

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
      WHERE m.monitor_id = $1
    `;

    const result = await pool.query(query, [monitorId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Monitor not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get monitor error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/monitors/[id] - อัปเดตจอภาพ
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const monitorId = parseInt(params.id);
    if (isNaN(monitorId)) {
      return createErrorResponse('Invalid monitor ID', 400);
    }

    const body = await request.json();

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'brand', 'model', 'serial_number', 'screen_size', 'resolution',
      'display_type', 'ports', 'purchase_date', 'purchase_price',
      'warranty_expiry_date', 'warranty_alert_days', 'computer_id',
      'it_responsible_id', 'branch', 'department', 'status', 'description'
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
    updateValues.push(monitorId);

    const updateQuery = `
      UPDATE monitors
      SET ${updateFields.join(', ')}
      WHERE monitor_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return createErrorResponse('Monitor not found', 404);
    }

    return createSuccessResponse(result.rows[0], 'Monitor updated successfully');
  } catch (error) {
    console.error('Update monitor error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

