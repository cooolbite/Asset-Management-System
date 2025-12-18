import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// POST /api/borrow-requests/[id]/approve - อนุมัติคำขอยืม
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const requestId = parseInt(params.id);
    if (isNaN(requestId)) {
      return createErrorResponse('Invalid request ID', 400);
    }

    const body = await request.json();
    const approved = body.approved !== false; // default true

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update request status
      const updateQuery = `
        UPDATE borrow_requests
        SET 
          status = $1,
          approved_by = $2,
          approved_at = CURRENT_TIMESTAMP,
          rejection_reason = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE request_id = $4
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        approved ? 'Approved' : 'Rejected',
        user.userId,
        body.rejectionReason || null,
        requestId,
      ]);

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return createErrorResponse('Request not found', 404);
      }

      // If approved, update equipment status
      if (approved) {
        const request = result.rows[0];
        let updateEquipmentQuery = '';
        let equipmentId = null;

        if (request.equipment_id) {
          updateEquipmentQuery = 'UPDATE equipment SET status = $1 WHERE equipment_id = $2';
          equipmentId = request.equipment_id;
        } else if (request.computer_id) {
          updateEquipmentQuery = 'UPDATE computers SET status = $1 WHERE computer_id = $2';
          equipmentId = request.computer_id;
        } else if (request.monitor_id) {
          updateEquipmentQuery = 'UPDATE monitors SET status = $1 WHERE monitor_id = $2';
          equipmentId = request.monitor_id;
        } else if (request.printer_id) {
          updateEquipmentQuery = 'UPDATE printers SET status = $1 WHERE printer_id = $2';
          equipmentId = request.printer_id;
        } else if (request.network_device_id) {
          updateEquipmentQuery = 'UPDATE network_devices SET status = $1 WHERE network_device_id = $2';
          equipmentId = request.network_device_id;
        }

        if (updateEquipmentQuery && equipmentId) {
          await client.query(updateEquipmentQuery, ['In Use', equipmentId]);
        }
      }

      await client.query('COMMIT');

      return createSuccessResponse(
        result.rows[0],
        approved ? 'Request approved successfully' : 'Request rejected'
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Approve borrow request error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

