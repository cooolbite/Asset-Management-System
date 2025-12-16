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

// GET /api/vendors/[id] - ดึงข้อมูลผู้ขาย/ซัพพลายเออร์รายการเดียว
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const vendorId = parseInt(params.id);
    if (isNaN(vendorId)) {
      return createErrorResponse('Invalid vendor ID', 400);
    }

    const result = await pool.query(
      'SELECT * FROM vendors WHERE vendor_id = $1',
      [vendorId]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Vendor not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get vendor error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/vendors/[id] - อัปเดตผู้ขาย/ซัพพลายเออร์
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

    const vendorId = parseInt(params.id);
    if (isNaN(vendorId)) {
      return createErrorResponse('Invalid vendor ID', 400);
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

    // Check if vendor exists
    const existing = await pool.query(
      'SELECT vendor_id FROM vendors WHERE vendor_id = $1',
      [vendorId]
    );

    if (existing.rows.length === 0) {
      return createErrorResponse('Vendor not found', 404);
    }

    // Check for duplicate name
    const duplicate = await pool.query(
      'SELECT vendor_id FROM vendors WHERE name = $1 AND vendor_id != $2',
      [data.name, vendorId]
    );

    if (duplicate.rows.length > 0) {
      return createErrorResponse('Vendor with this name already exists', 400);
    }

    const result = await pool.query(
      `UPDATE vendors 
       SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5, description = $6, updated_at = CURRENT_TIMESTAMP
       WHERE vendor_id = $7
       RETURNING *`,
      [
        data.name,
        data.contactPerson || null,
        data.email || null,
        data.phone || null,
        data.address || null,
        data.description || null,
        vendorId,
      ]
    );

    return createSuccessResponse(result.rows[0], 'Vendor updated successfully');
  } catch (error) {
    console.error('Update vendor error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/vendors/[id] - ลบผู้ขาย/ซัพพลายเออร์
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

    const vendorId = parseInt(params.id);
    if (isNaN(vendorId)) {
      return createErrorResponse('Invalid vendor ID', 400);
    }

    // Check if vendor is used by any assets
    const assetsUsing = await pool.query(
      "SELECT COUNT(*) as count FROM assets WHERE vendor_supplier = (SELECT name FROM vendors WHERE vendor_id = $1) AND deleted_at IS NULL",
      [vendorId]
    );

    if (parseInt(assetsUsing.rows[0].count) > 0) {
      return createErrorResponse('Cannot delete vendor that is being used by assets', 400);
    }

    await pool.query('DELETE FROM vendors WHERE vendor_id = $1', [vendorId]);

    return createSuccessResponse(null, 'Vendor deleted successfully');
  } catch (error) {
    console.error('Delete vendor error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

