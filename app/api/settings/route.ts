import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse, requireRole } from '@/lib/middleware';

// GET /api/settings - ดึงการตั้งค่าระบบ
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Only Admin can view settings
    if (!requireRole(['Admin'])(user)) {
      return createErrorResponse('Forbidden: Admin access required', 403);
    }

    const result = await pool.query(
      'SELECT * FROM system_settings ORDER BY category, setting_key'
    );

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Get settings error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/settings - อัปเดตการตั้งค่าระบบ
export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Only Admin can update settings
    if (!requireRole(['Admin'])(user)) {
      return createErrorResponse('Forbidden: Admin access required', 403);
    }

    const body = await request.json();

    if (!body.settings || !Array.isArray(body.settings)) {
      return createErrorResponse('Settings array is required', 400);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const setting of body.settings) {
        await client.query(
          `UPDATE system_settings 
           SET setting_value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
           WHERE setting_key = $3`,
          [setting.value, user.userId, setting.key]
        );
      }

      await client.query('COMMIT');

      return createSuccessResponse({}, 'Settings updated successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update settings error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

