import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/spare-parts/[id] - ดึงข้อมูลอะไหล่
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const sparePartId = parseInt(params.id);
    if (isNaN(sparePartId)) {
      return createErrorResponse('Invalid spare part ID', 400);
    }

    const query = `
      SELECT 
        sp.*,
        COALESCE(sps.quantity, 0) as stock_quantity,
        COALESCE(sps.min_stock, 5) as min_stock,
        COALESCE(sps.max_stock, NULL) as max_stock,
        sps.location as stock_location
      FROM spare_parts sp
      LEFT JOIN spare_parts_stock sps ON sp.spare_part_id = sps.spare_part_id
      WHERE sp.spare_part_id = $1
    `;

    const result = await pool.query(query, [sparePartId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Spare part not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get spare part error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

