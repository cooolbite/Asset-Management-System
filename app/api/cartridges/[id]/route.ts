import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/cartridges/[id] - ดึงข้อมูลตลับหมึก
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const cartridgeId = parseInt(params.id);
    if (isNaN(cartridgeId)) {
      return createErrorResponse('Invalid cartridge ID', 400);
    }

    const query = `
      SELECT 
        c.*,
        COALESCE(cs.quantity, 0) as stock_quantity,
        COALESCE(cs.min_stock, 5) as min_stock,
        cs.location as stock_location
      FROM cartridges c
      LEFT JOIN cartridge_stock cs ON c.cartridge_id = cs.cartridge_id
      WHERE c.cartridge_id = $1
    `;

    const result = await pool.query(query, [cartridgeId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Cartridge not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get cartridge error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

