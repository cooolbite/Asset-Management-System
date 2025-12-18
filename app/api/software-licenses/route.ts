import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/software-licenses - ดึงรายการซอฟต์แวร์
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const licenseType = searchParams.get('licenseType');
    const expiringSoon = searchParams.get('expiringSoon') === 'true';

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (licenseType) {
      conditions.push(`sl.license_type = $${paramIndex}`);
      params.push(licenseType);
      paramIndex++;
    }

    if (expiringSoon) {
      conditions.push(`sl.expiry_date <= CURRENT_DATE + INTERVAL '30 days'`);
      conditions.push(`sl.expiry_date >= CURRENT_DATE`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        sl.*,
        u.full_name as created_by_name,
        (sl.total_licenses - sl.used_licenses) as available_licenses
      FROM software_licenses sl
      LEFT JOIN users u ON sl.created_by = u.user_id
      ${whereClause}
      ORDER BY sl.created_at DESC
    `;

    const result = await pool.query(query, params);

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Get software licenses error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/software-licenses - สร้างซอฟต์แวร์ใหม่
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.softwareName || !body.licenseType || !body.totalLicenses) {
      return createErrorResponse('Software name, license type, and total licenses are required', 400);
    }

    const insertQuery = `
      INSERT INTO software_licenses (
        software_name, version, license_type, license_key, total_licenses, used_licenses,
        purchase_date, purchase_price, vendor, expiry_date, alert_days,
        invoice_number, contract_number, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      body.softwareName,
      body.version || null,
      body.licenseType,
      body.licenseKey || null,
      body.totalLicenses,
      body.usedLicenses || 0,
      body.purchaseDate || null,
      body.purchasePrice || null,
      body.vendor || null,
      body.expiryDate || null,
      body.alertDays || 30,
      body.invoiceNumber || null,
      body.contractNumber || null,
      body.notes || null,
      user.userId,
    ]);

    return createSuccessResponse(result.rows[0], 'Software license created successfully');
  } catch (error) {
    console.error('Create software license error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

