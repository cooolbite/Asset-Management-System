import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/computers/[id] - ดึงข้อมูลคอมพิวเตอร์
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const computerId = parseInt(params.id);
    if (isNaN(computerId)) {
      return createErrorResponse('Invalid computer ID', 400);
    }

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
      WHERE c.computer_id = $1
    `;

    const result = await pool.query(query, [computerId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Computer not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get computer error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/computers/[id] - อัปเดตคอมพิวเตอร์
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const computerId = parseInt(params.id);
    if (isNaN(computerId)) {
      return createErrorResponse('Invalid computer ID', 400);
    }

    const body = await request.json();

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'brand', 'model', 'cpu', 'ram', 'storage', 'os', 'status'
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
    updateValues.push(computerId);

    const updateQuery = `
      UPDATE computers
      SET ${updateFields.join(', ')}
      WHERE computer_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return createErrorResponse('Computer not found', 404);
    }

    return createSuccessResponse(result.rows[0], 'Computer updated successfully');
  } catch (error) {
    console.error('Update computer error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

