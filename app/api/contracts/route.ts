import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/contracts - ดึงรายการสัญญา
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const contractType = searchParams.get('contractType');
    const status = searchParams.get('status');
    const expiringSoon = searchParams.get('expiringSoon') === 'true';

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (contractType) {
      conditions.push(`c.contract_type = $${paramIndex}`);
      params.push(contractType);
      paramIndex++;
    }

    if (status) {
      conditions.push(`c.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (expiringSoon) {
      conditions.push(`c.end_date <= CURRENT_DATE + INTERVAL '30 days'`);
      conditions.push(`c.end_date >= CURRENT_DATE`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        c.*,
        u.full_name as created_by_name
      FROM contracts c
      LEFT JOIN users u ON c.created_by = u.user_id
      ${whereClause}
      ORDER BY c.end_date ASC
    `;

    const result = await pool.query(query, params);

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Get contracts error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/contracts - สร้างสัญญาใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.contractNumber || !body.contractType || !body.title || !body.vendorCompany || !body.startDate || !body.endDate) {
      return createErrorResponse('Contract number, type, title, vendor company, start date, and end date are required', 400);
    }

    const insertQuery = `
      INSERT INTO contracts (
        contract_number, contract_type, title, vendor_company, vendor_contact,
        vendor_phone, vendor_email, vendor_address, start_date, end_date,
        contract_value, payment_terms, alert_days, status, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      body.contractNumber,
      body.contractType,
      body.title,
      body.vendorCompany,
      body.vendorContact || null,
      body.vendorPhone || null,
      body.vendorEmail || null,
      body.vendorAddress || null,
      body.startDate,
      body.endDate,
      body.contractValue || null,
      body.paymentTerms || null,
      body.alertDays || 30,
      body.status || 'Active',
      body.notes || null,
      user.userId,
    ]);

    return createSuccessResponse(result.rows[0], 'Contract created successfully');
  } catch (error: any) {
    if (error.code === '23505') {
      return createErrorResponse('Contract number already exists', 400);
    }
    console.error('Create contract error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

