import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/software-licenses/[id] - ดึงข้อมูลซอฟต์แวร์
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const licenseId = parseInt(params.id);
    if (isNaN(licenseId)) {
      return createErrorResponse('Invalid license ID', 400);
    }

    const query = `
      SELECT 
        sl.*,
        u.full_name as created_by_name,
        (sl.total_licenses - sl.used_licenses) as available_licenses
      FROM software_licenses sl
      LEFT JOIN users u ON sl.created_by = u.user_id
      WHERE sl.license_id = $1
    `;

    const result = await pool.query(query, [licenseId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Software license not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get software license error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

