import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/pm-schedules - ดึงรายการตาราง PM
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('isActive');
    const assignedTo = searchParams.get('assignedTo');
    const dueSoon = searchParams.get('dueSoon') === 'true';

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (isActive !== null) {
      conditions.push(`pms.is_active = $${paramIndex}`);
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (assignedTo) {
      conditions.push(`pms.assigned_to = $${paramIndex}`);
      params.push(parseInt(assignedTo));
      paramIndex++;
    }

    if (dueSoon) {
      const days = 7; // Default 7 days
      conditions.push(`pms.next_due_date <= CURRENT_DATE + INTERVAL '${days} days'`);
      conditions.push(`pms.next_due_date >= CURRENT_DATE`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        pms.*,
        u.full_name as assigned_to_name,
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
      FROM pm_schedules pms
      LEFT JOIN users u ON pms.assigned_to = u.user_id
      LEFT JOIN equipment e ON pms.equipment_id = e.equipment_id
      LEFT JOIN computers c ON pms.computer_id = c.computer_id
      LEFT JOIN monitors m ON pms.monitor_id = m.monitor_id
      LEFT JOIN printers p ON pms.printer_id = p.printer_id
      LEFT JOIN network_devices nd ON pms.network_device_id = nd.network_device_id
      ${whereClause}
      ORDER BY pms.next_due_date ASC
    `;

    const result = await pool.query(query, params);

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Get PM schedules error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/pm-schedules - สร้างตาราง PM ใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.scheduleName || !body.frequencyType || !body.nextDueDate) {
      return createErrorResponse('Schedule name, frequency type, and next due date are required', 400);
    }

    const insertQuery = `
      INSERT INTO pm_schedules (
        schedule_name, equipment_id, computer_id, monitor_id, printer_id, network_device_id,
        frequency_type, frequency_value, next_due_date, assigned_to, is_active, alert_days, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      body.scheduleName,
      body.equipmentId || null,
      body.computerId || null,
      body.monitorId || null,
      body.printerId || null,
      body.networkDeviceId || null,
      body.frequencyType,
      body.frequencyValue || 1,
      body.nextDueDate,
      body.assignedTo || null,
      body.isActive !== undefined ? body.isActive : true,
      body.alertDays || 7,
      user.userId,
    ]);

    // Create checklist items if provided
    if (body.checklistItems && Array.isArray(body.checklistItems)) {
      for (let i = 0; i < body.checklistItems.length; i++) {
        const item = body.checklistItems[i];
        await pool.query(
          `INSERT INTO pm_checklists (schedule_id, item_name, item_order, is_required)
           VALUES ($1, $2, $3, $4)`,
          [result.rows[0].schedule_id, item.name, i + 1, item.isRequired !== false]
        );
      }
    }

    return createSuccessResponse(result.rows[0], 'PM schedule created successfully');
  } catch (error) {
    console.error('Create PM schedule error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

