import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse, requireRole } from '@/lib/middleware';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  assetType: z.enum(['Hardware', 'Software', 'Physical Asset']),
  description: z.string().optional(),
});

// GET /api/categories - ดึงรายการหมวดหมู่
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const assetType = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';

    let query = 'SELECT * FROM categories';
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (assetType) {
      conditions.push(`asset_type = $${paramIndex}`);
      params.push(assetType);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY asset_type, name';

    const result = await pool.query(query, params);

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/categories - สร้างหมวดหมู่ใหม่
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
    const validationResult = categorySchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors[0].message,
        400
      );
    }

    const data = validationResult.data;

    // Check for duplicate name+type
    const existing = await pool.query(
      'SELECT category_id FROM categories WHERE name = $1 AND asset_type = $2',
      [data.name, data.assetType]
    );

    if (existing.rows.length > 0) {
      return createErrorResponse('Category with this name and type already exists', 400);
    }

    const result = await pool.query(
      `INSERT INTO categories (name, asset_type, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.assetType, data.description || null]
    );

    return createSuccessResponse(result.rows[0], 'Category created successfully');
  } catch (error) {
    console.error('Create category error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

