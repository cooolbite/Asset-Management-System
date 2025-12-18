import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/contracts/[id] - ดึงข้อมูลสัญญา
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const contractId = parseInt(params.id);
    if (isNaN(contractId)) {
      return createErrorResponse('Invalid contract ID', 400);
    }

    const query = `
      SELECT 
        c.*,
        u.full_name as created_by_name
      FROM contracts c
      LEFT JOIN users u ON c.created_by = u.user_id
      WHERE c.contract_id = $1
    `;

    const result = await pool.query(query, [contractId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Contract not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get contract error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

