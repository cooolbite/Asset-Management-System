import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/repairs - ดึงรายการงานซ่อม
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const reportedBy = searchParams.get('reportedBy') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const sortBy = searchParams.get('sortBy') || 'reported_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(
        rt.job_id ILIKE $${paramIndex} OR 
        rt.title ILIKE $${paramIndex} OR 
        rt.description ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`rt.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      conditions.push(`rt.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (assignedTo) {
      conditions.push(`rt.assigned_to = $${paramIndex}`);
      params.push(parseInt(assignedTo));
      paramIndex++;
    }

    if (reportedBy) {
      conditions.push(`rt.reported_by = $${paramIndex}`);
      params.push(parseInt(reportedBy));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSortColumns = ['job_id', 'title', 'status', 'priority', 'reported_at', 'completed_at'];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'reported_at';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM repair_tickets rt
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get tickets with pagination
    const query = `
      SELECT 
        rt.ticket_id,
        rt.job_id,
        rt.asset_id,
        rt.equipment_id,
        rt.computer_id,
        rt.monitor_id,
        rt.printer_id,
        rt.network_device_id,
        rt.problem_type_id,
        pt.name as problem_type_name,
        rt.priority,
        rt.status,
        rt.reported_by,
        u1.full_name as reported_by_name,
        u1.username as reported_by_username,
        rt.assigned_to,
        u2.full_name as assigned_to_name,
        u2.username as assigned_to_username,
        rt.title,
        rt.description,
        rt.location,
        rt.reported_at,
        rt.assigned_at,
        rt.started_at,
        rt.completed_at,
        rt.root_cause,
        rt.solution,
        rt.total_cost,
        rt.created_at,
        rt.updated_at
      FROM repair_tickets rt
      LEFT JOIN problem_types pt ON rt.problem_type_id = pt.problem_type_id
      LEFT JOIN users u1 ON rt.reported_by = u1.user_id
      LEFT JOIN users u2 ON rt.assigned_to = u2.user_id
      ${whereClause}
      ORDER BY rt.${validSortBy} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return createSuccessResponse({
      tickets: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get repairs error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/repairs - สร้างงานซ่อมใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description) {
      return createErrorResponse('Title and description are required', 400);
    }

    // Generate Job ID
    const jobIdResult = await pool.query('SELECT generate_job_id() as job_id');
    const jobId = jobIdResult.rows[0].job_id;

    // Insert repair ticket
    const insertQuery = `
      INSERT INTO repair_tickets (
        job_id, asset_id, equipment_id, computer_id, monitor_id, printer_id, network_device_id,
        problem_type_id, priority, status, reported_by, title, description, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      jobId,
      body.assetId || null,
      body.equipmentId || null,
      body.computerId || null,
      body.monitorId || null,
      body.printerId || null,
      body.networkDeviceId || null,
      body.problemTypeId || null,
      body.priority || 'Normal',
      'Pending',
      user.userId,
      body.title,
      body.description,
      body.location || null,
    ]);

    // Create initial timeline entry
    await pool.query(
      `INSERT INTO repair_timeline (ticket_id, status, note, created_by) 
       VALUES ($1, $2, $3, $4)`,
      [result.rows[0].ticket_id, 'Pending', 'สร้างงานซ่อม', user.userId]
    );

    return createSuccessResponse(result.rows[0], 'Repair ticket created successfully');
  } catch (error) {
    console.error('Create repair error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

