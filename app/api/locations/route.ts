import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse, requireRole } from '@/lib/middleware';
import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  address: z.string().optional(),
  description: z.string().optional(),
});

// GET /api/locations - ดึงรายการสถานที่
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    let query = 'SELECT * FROM locations';
    const params: any[] = [];
    
    if (search) {
      query += ' WHERE name ILIKE $1 OR address ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY name';

    const result = await pool.query(query, params);

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Get locations error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/locations - สร้างสถานที่ใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    if (!requireRole(['Admin'])(user)) {
      return createErrorResponse('Forbidden: Admin access required', 403);
    }

    const body = await request.json();
    const validationResult = locationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors[0].message,
        400
      );
    }

    const data = validationResult.data;

    const result = await pool.query(
      `INSERT INTO locations (name, address, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.address || null, data.description || null]
    );

    return createSuccessResponse(result.rows[0], 'Location created successfully');
  } catch (error) {
    console.error('Create location error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

