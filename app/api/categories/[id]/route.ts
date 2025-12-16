import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse, requireRole } from '@/lib/middleware';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  assetType: z.enum(['Hardware', 'Software', 'Physical Asset']),
  description: z.string().optional(),
});

// GET /api/categories/[id] - ดึงข้อมูลหมวดหมู่รายการเดียว
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return createErrorResponse('Invalid category ID', 400);
    }

    const result = await pool.query(
      'SELECT * FROM categories WHERE category_id = $1',
      [categoryId]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Category not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get category error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/categories/[id] - อัปเดตหมวดหมู่
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    if (!requireRole(['Admin'])(user)) {
      return createErrorResponse('Forbidden: Admin access required', 403);
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return createErrorResponse('Invalid category ID', 400);
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

    // Check if category exists
    const existing = await pool.query(
      'SELECT category_id FROM categories WHERE category_id = $1',
      [categoryId]
    );

    if (existing.rows.length === 0) {
      return createErrorResponse('Category not found', 404);
    }

    // Check for duplicate name+type
    const duplicate = await pool.query(
      'SELECT category_id FROM categories WHERE name = $1 AND asset_type = $2 AND category_id != $3',
      [data.name, data.assetType, categoryId]
    );

    if (duplicate.rows.length > 0) {
      return createErrorResponse('Category with this name and type already exists', 400);
    }

    const result = await pool.query(
      `UPDATE categories 
       SET name = $1, asset_type = $2, description = $3
       WHERE category_id = $4
       RETURNING *`,
      [data.name, data.assetType, data.description || null, categoryId]
    );

    return createSuccessResponse(result.rows[0], 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/categories/[id] - ลบหมวดหมู่
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    if (!requireRole(['Admin'])(user)) {
      return createErrorResponse('Forbidden: Admin access required', 403);
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return createErrorResponse('Invalid category ID', 400);
    }

    // Check if category is used by any assets
    const assetsUsing = await pool.query(
      'SELECT COUNT(*) as count FROM assets WHERE category_id = $1 AND deleted_at IS NULL',
      [categoryId]
    );

    if (parseInt(assetsUsing.rows[0].count) > 0) {
      return createErrorResponse('Cannot delete category that is being used by assets', 400);
    }

    await pool.query('DELETE FROM categories WHERE category_id = $1', [categoryId]);

    return createSuccessResponse(null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

