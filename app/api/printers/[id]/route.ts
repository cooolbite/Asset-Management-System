import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/printers/[id] - ดึงข้อมูลเครื่องพิมพ์
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const printerId = parseInt(params.id);
    if (isNaN(printerId)) {
      return createErrorResponse('Invalid printer ID', 400);
    }

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
      WHERE p.printer_id = $1
    `;

    const result = await pool.query(query, [printerId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Printer not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get printer error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/printers/[id] - อัปเดตเครื่องพิมพ์
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const printerId = parseInt(params.id);
    if (isNaN(printerId)) {
      return createErrorResponse('Invalid printer ID', 400);
    }

    const body = await request.json();

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'brand', 'model', 'serial_number', 'printer_type', 'color_type',
      'ip_address', 'purchase_date', 'purchase_price', 'warranty_expiry_date',
      'warranty_alert_days', 'location_id', 'branch', 'department',
      'it_responsible_id', 'is_shared', 'status', 'description'
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
    updateValues.push(printerId);

    const updateQuery = `
      UPDATE printers
      SET ${updateFields.join(', ')}
      WHERE printer_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return createErrorResponse('Printer not found', 404);
    }

    return createSuccessResponse(result.rows[0], 'Printer updated successfully');
  } catch (error) {
    console.error('Update printer error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

