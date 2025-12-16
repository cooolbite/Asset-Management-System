import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/transactions - ดึงประวัติการ Check-in/Check-out
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const assetId = searchParams.get('assetId');
    const userId = searchParams.get('userId');
    const transactionType = searchParams.get('type') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Staff can only see their own transactions
    if (user.role === 'Staff') {
      conditions.push(`t.performed_by = $${paramIndex}`);
      params.push(user.userId);
      paramIndex++;
    }

    if (assetId) {
      conditions.push(`t.asset_id = $${paramIndex}`);
      params.push(parseInt(assetId));
      paramIndex++;
    }

    if (userId) {
      conditions.push(`t.performed_by = $${paramIndex}`);
      params.push(parseInt(userId));
      paramIndex++;
    }

    if (transactionType) {
      conditions.push(`t.transaction_type = $${paramIndex}`);
      params.push(transactionType);
      paramIndex++;
    }

    if (dateFrom) {
      conditions.push(`DATE(t.transaction_date) >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      conditions.push(`DATE(t.transaction_date) <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get transactions with pagination
    const query = `
      SELECT 
        t.*,
        a.serial_number,
        a.asset_name,
        a.asset_type,
        u.username as performed_by_username,
        u.full_name as performed_by_fullname
      FROM transactions t
      LEFT JOIN assets a ON t.asset_id = a.asset_id
      LEFT JOIN users u ON t.performed_by = u.user_id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return createSuccessResponse({
      transactions: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

