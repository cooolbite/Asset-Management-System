import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/domains/[id] - ดึงข้อมูลโดเมน
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const domainId = parseInt(params.id);
    if (isNaN(domainId)) {
      return createErrorResponse('Invalid domain ID', 400);
    }

    const query = `
      SELECT 
        d.*,
        u.full_name as created_by_name
      FROM domains d
      LEFT JOIN users u ON d.created_by = u.user_id
      WHERE d.domain_id = $1
    `;

    const result = await pool.query(query, [domainId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Domain not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get domain error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

