import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse, requireRole } from '@/lib/middleware';
import { z } from 'zod';

const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  contactPerson: z.string().max(200).optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

// GET /api/vendors - ดึงรายการผู้ขาย/ซัพพลายเออร์
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    let query = 'SELECT * FROM vendors';
    const params: any[] = [];
    
    if (search) {
      query += ' WHERE name ILIKE $1 OR contact_person ILIKE $1 OR email ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY name';

    const result = await pool.query(query, params);

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Get vendors error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/vendors - สร้างผู้ขาย/ซัพพลายเออร์ใหม่
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
    const validationResult = vendorSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors[0].message,
        400
      );
    }

    const data = validationResult.data;

    // Check for duplicate name
    const existing = await pool.query(
      'SELECT vendor_id FROM vendors WHERE name = $1',
      [data.name]
    );

    if (existing.rows.length > 0) {
      return createErrorResponse('Vendor with this name already exists', 400);
    }

    const result = await pool.query(
      `INSERT INTO vendors (name, contact_person, email, phone, address, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.name,
        data.contactPerson || null,
        data.email || null,
        data.phone || null,
        data.address || null,
        data.description || null,
      ]
    );

    return createSuccessResponse(result.rows[0], 'Vendor created successfully');
  } catch (error) {
    console.error('Create vendor error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

