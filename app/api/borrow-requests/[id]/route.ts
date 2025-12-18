import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/borrow-requests/[id] - ดึงข้อมูลคำขอยืม
export async function GET(
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

    const query = `
      SELECT 
        br.*,
        u1.full_name as requested_by_name,
        u2.full_name as approved_by_name,
        e.name as equipment_name,
        e.asset_code as equipment_code,
        c.name as computer_name,
        c.asset_code as computer_code,
        m.name as monitor_name,
        m.asset_code as monitor_code,
        p.name as printer_name,
        p.asset_code as printer_code,
        nd.name as network_device_name,
        nd.asset_code as network_device_code
      FROM borrow_requests br
      LEFT JOIN users u1 ON br.requested_by = u1.user_id
      LEFT JOIN users u2 ON br.approved_by = u2.user_id
      LEFT JOIN equipment e ON br.equipment_id = e.equipment_id
      LEFT JOIN computers c ON br.computer_id = c.computer_id
      LEFT JOIN monitors m ON br.monitor_id = m.monitor_id
      LEFT JOIN printers p ON br.printer_id = p.printer_id
      LEFT JOIN network_devices nd ON br.network_device_id = nd.network_device_id
      WHERE br.request_id = $1
    `;

    const result = await pool.query(query, [requestId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Borrow request not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get borrow request error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

