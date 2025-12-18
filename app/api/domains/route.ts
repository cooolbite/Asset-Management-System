import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/domains - ดึงรายการโดเมน
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const expiringSoon = searchParams.get('expiringSoon') === 'true';

    const conditions: string[] = [];
    const params: any[] = [];

    if (expiringSoon) {
      conditions.push(`expiry_date <= CURRENT_DATE + INTERVAL '30 days'`);
      conditions.push(`expiry_date >= CURRENT_DATE`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        d.*,
        u.full_name as created_by_name
      FROM domains d
      LEFT JOIN users u ON d.created_by = u.user_id
      ${whereClause}
      ORDER BY d.expiry_date ASC
    `;

    const result = await pool.query(query, params);

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Get domains error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/domains - สร้างโดเมนใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.domainName || !body.expiryDate) {
      return createErrorResponse('Domain name and expiry date are required', 400);
    }

    const insertQuery = `
      INSERT INTO domains (
        domain_name, registrar, registration_date, expiry_date, alert_days,
        hosting_provider, hosting_package, hosting_cost, hosting_expiry_date,
        ssl_type, ssl_issuer, ssl_expiry_date, ssl_alert_days, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      body.domainName,
      body.registrar || null,
      body.registrationDate || null,
      body.expiryDate,
      body.alertDays || 30,
      body.hostingProvider || null,
      body.hostingPackage || null,
      body.hostingCost || null,
      body.hostingExpiryDate || null,
      body.sslType || null,
      body.sslIssuer || null,
      body.sslExpiryDate || null,
      body.sslAlertDays || 30,
      body.notes || null,
      user.userId,
    ]);

    return createSuccessResponse(result.rows[0], 'Domain created successfully');
  } catch (error: any) {
    if (error.code === '23505') {
      return createErrorResponse('Domain name already exists', 400);
    }
    console.error('Create domain error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

