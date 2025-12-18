import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/borrow-requests - ดึงรายการคำขอยืม
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const requestedBy = searchParams.get('requestedBy') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`br.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (requestedBy) {
      conditions.push(`br.requested_by = $${paramIndex}`);
      params.push(parseInt(requestedBy));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM borrow_requests br ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        br.*,
        u1.full_name as requested_by_name,
        u1.username as requested_by_username,
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
      ${whereClause}
      ORDER BY br.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return createSuccessResponse({
      requests: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get borrow requests error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/borrow-requests - สร้างคำขอยืมใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.requestReason || !body.borrowDate || !body.expectedReturnDate) {
      return createErrorResponse('Request reason, borrow date, and expected return date are required', 400);
    }

    // Generate request number
    const year = new Date().getFullYear();
    const countResult = await pool.query(
      `SELECT COUNT(*) + 1 as next_num FROM borrow_requests WHERE request_number LIKE $1`,
      [`BR${year}%`]
    );
    const nextNum = countResult.rows[0].next_num;
    const requestNumber = `BR${year}${nextNum.toString().padStart(6, '0')}`;

    const insertQuery = `
      INSERT INTO borrow_requests (
        request_number, equipment_id, computer_id, monitor_id, printer_id, network_device_id,
        requested_by, request_reason, borrow_date, expected_return_date, condition_before
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      requestNumber,
      body.equipmentId || null,
      body.computerId || null,
      body.monitorId || null,
      body.printerId || null,
      body.networkDeviceId || null,
      user.userId,
      body.requestReason,
      body.borrowDate,
      body.expectedReturnDate,
      body.conditionBefore || null,
    ]);

    return createSuccessResponse(result.rows[0], 'Borrow request created successfully');
  } catch (error) {
    console.error('Create borrow request error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

