import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/problem-types - ดึงรายการประเภทปัญหา
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const result = await pool.query(
      'SELECT * FROM problem_types ORDER BY name ASC'
    );

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Get problem types error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/problem-types - สร้างประเภทปัญหาใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.name) {
      return createErrorResponse('Name is required', 400);
    }

    const result = await pool.query(
      'INSERT INTO problem_types (name, description) VALUES ($1, $2) RETURNING *',
      [body.name, body.description || null]
    );

    return createSuccessResponse(result.rows[0], 'Problem type created successfully');
  } catch (error: any) {
    if (error.code === '23505') {
      return createErrorResponse('Problem type name already exists', 400);
    }
    console.error('Create problem type error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

