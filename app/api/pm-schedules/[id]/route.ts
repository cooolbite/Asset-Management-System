import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/pm-schedules/[id] - ดึงข้อมูลตาราง PM
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const scheduleId = parseInt(params.id);
    if (isNaN(scheduleId)) {
      return createErrorResponse('Invalid schedule ID', 400);
    }

    // Get schedule
    const scheduleQuery = `
      SELECT 
        pms.*,
        u.full_name as assigned_to_name,
        e.name as equipment_name,
        e.asset_code as equipment_code,
        c.name as computer_name,
        c.asset_code as computer_code,
        p.name as printer_name,
        p.asset_code as printer_code
      FROM pm_schedules pms
      LEFT JOIN users u ON pms.assigned_to = u.user_id
      LEFT JOIN equipment e ON pms.equipment_id = e.equipment_id
      LEFT JOIN computers c ON pms.computer_id = c.computer_id
      LEFT JOIN printers p ON pms.printer_id = p.printer_id
      WHERE pms.schedule_id = $1
    `;

    const scheduleResult = await pool.query(scheduleQuery, [scheduleId]);

    if (scheduleResult.rows.length === 0) {
      return createErrorResponse('PM schedule not found', 404);
    }

    // Get checklist
    const checklistQuery = `
      SELECT * FROM pm_checklists
      WHERE schedule_id = $1
      ORDER BY item_order ASC
    `;

    const checklistResult = await pool.query(checklistQuery, [scheduleId]);

    return createSuccessResponse({
      schedule: scheduleResult.rows[0],
      checklist: checklistResult.rows,
    });
  } catch (error) {
    console.error('Get PM schedule error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

