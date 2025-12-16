import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse, requireRole } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

// User creation schema
const userCreateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  fullName: z.string().min(1, 'Full name is required').max(200, 'Full name must be less than 200 characters'),
  role: z.enum(['Admin', 'Staff']),
  department: z.string().max(100).optional(),
});

// GET /api/users - ดึงรายการผู้ใช้
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Check if user is Admin
    if (!requireRole(['Admin'])(user)) {
      return createErrorResponse('Forbidden: Admin access required', 403);
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(
        username ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex} OR 
        full_name ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      conditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get users with pagination
    const query = `
      SELECT 
        user_id,
        username,
        email,
        full_name,
        role,
        department,
        status,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return createSuccessResponse({
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/users - สร้างผู้ใช้ใหม่
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Check if user is Admin
    if (!requireRole(['Admin'])(user)) {
      return createErrorResponse('Forbidden: Admin access required', 403);
    }

    const body = await request.json();

    // Validate input
    const validationResult = userCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors[0].message,
        400
      );
    }

    const data = validationResult.data;

    // Check if username already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [data.username, data.email]
    );

    if (existingUser.rows.length > 0) {
      return createErrorResponse('Username or email already exists', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Insert user
    const insertQuery = `
      INSERT INTO users (
        username, email, password_hash, full_name, role, department, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_id, username, email, full_name, role, department, status, created_at
    `;

    const result = await pool.query(insertQuery, [
      data.username,
      data.email,
      passwordHash,
      data.fullName,
      data.role,
      data.department || null,
      'Active',
      user.userId,
    ]);

    return createSuccessResponse(result.rows[0], 'User created successfully');
  } catch (error) {
    console.error('Create user error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

