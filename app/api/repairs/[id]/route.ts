import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/repairs/[id] - ดึงข้อมูลงานซ่อม
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      return createErrorResponse('Invalid ticket ID', 400);
    }

    // Get ticket details
    const ticketQuery = `
      SELECT 
        rt.*,
        pt.name as problem_type_name,
        u1.full_name as reported_by_name,
        u1.username as reported_by_username,
        u2.full_name as assigned_to_name,
        u2.username as assigned_to_username
      FROM repair_tickets rt
      LEFT JOIN problem_types pt ON rt.problem_type_id = pt.problem_type_id
      LEFT JOIN users u1 ON rt.reported_by = u1.user_id
      LEFT JOIN users u2 ON rt.assigned_to = u2.user_id
      WHERE rt.ticket_id = $1
    `;
    const ticketResult = await pool.query(ticketQuery, [ticketId]);

    if (ticketResult.rows.length === 0) {
      return createErrorResponse('Ticket not found', 404);
    }

    // Get attachments
    const attachmentsQuery = `
      SELECT ra.*, u.full_name as uploaded_by_name
      FROM repair_attachments ra
      LEFT JOIN users u ON ra.uploaded_by = u.user_id
      WHERE ra.ticket_id = $1
      ORDER BY ra.uploaded_at DESC
    `;
    const attachmentsResult = await pool.query(attachmentsQuery, [ticketId]);

    // Get timeline
    const timelineQuery = `
      SELECT rt.*, u.full_name as created_by_name
      FROM repair_timeline rt
      LEFT JOIN users u ON rt.created_by = u.user_id
      WHERE rt.ticket_id = $1
      ORDER BY rt.created_at ASC
    `;
    const timelineResult = await pool.query(timelineQuery, [ticketId]);

    // Get spare parts used
    const sparePartsQuery = `
      SELECT 
        rsp.*,
        sp.name as spare_part_name,
        sp.part_code,
        u.full_name as used_by_name
      FROM repair_spare_parts rsp
      LEFT JOIN spare_parts sp ON rsp.spare_part_id = sp.spare_part_id
      LEFT JOIN users u ON rsp.used_by = u.user_id
      WHERE rsp.ticket_id = $1
      ORDER BY rsp.used_at DESC
    `;
    const sparePartsResult = await pool.query(sparePartsQuery, [ticketId]);

    return createSuccessResponse({
      ticket: ticketResult.rows[0],
      attachments: attachmentsResult.rows,
      timeline: timelineResult.rows,
      spareParts: sparePartsResult.rows,
    });
  } catch (error) {
    console.error('Get repair error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/repairs/[id] - อัปเดตงานซ่อม
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      return createErrorResponse('Invalid ticket ID', 400);
    }

    const body = await request.json();

    // Get current ticket
    const currentTicket = await pool.query(
      'SELECT status FROM repair_tickets WHERE ticket_id = $1',
      [ticketId]
    );

    if (currentTicket.rows.length === 0) {
      return createErrorResponse('Ticket not found', 404);
    }

    const currentStatus = currentTicket.rows[0].status;
    const newStatus = body.status || currentStatus;

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (body.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      updateValues.push(body.status);
      paramIndex++;

      // Update timestamps based on status
      if (body.status === 'Assigned' && currentStatus === 'Pending') {
        updateFields.push(`assigned_at = CURRENT_TIMESTAMP`);
      }
      if (body.status === 'In Progress' && currentStatus !== 'In Progress') {
        updateFields.push(`started_at = CURRENT_TIMESTAMP`);
      }
      if (body.status === 'Completed' && currentStatus !== 'Completed') {
        updateFields.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }

    if (body.assignedTo !== undefined) {
      updateFields.push(`assigned_to = $${paramIndex}`);
      updateValues.push(body.assignedTo);
      paramIndex++;
    }

    if (body.priority !== undefined) {
      updateFields.push(`priority = $${paramIndex}`);
      updateValues.push(body.priority);
      paramIndex++;
    }

    if (body.rootCause !== undefined) {
      updateFields.push(`root_cause = $${paramIndex}`);
      updateValues.push(body.rootCause);
      paramIndex++;
    }

    if (body.solution !== undefined) {
      updateFields.push(`solution = $${paramIndex}`);
      updateValues.push(body.solution);
      paramIndex++;
    }

    if (body.totalCost !== undefined) {
      updateFields.push(`total_cost = $${paramIndex}`);
      updateValues.push(body.totalCost);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return createErrorResponse('No fields to update', 400);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(ticketId);

    const updateQuery = `
      UPDATE repair_tickets
      SET ${updateFields.join(', ')}
      WHERE ticket_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    // Add timeline entry if status changed
    if (body.status && body.status !== currentStatus) {
      await pool.query(
        `INSERT INTO repair_timeline (ticket_id, status, note, created_by) 
         VALUES ($1, $2, $3, $4)`,
        [ticketId, body.status, body.note || `เปลี่ยนสถานะเป็น ${body.status}`, user.userId]
      );
    }

    return createSuccessResponse(result.rows[0], 'Ticket updated successfully');
  } catch (error) {
    console.error('Update repair error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

