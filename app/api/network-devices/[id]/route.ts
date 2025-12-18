import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/network-devices/[id] - ดึงข้อมูลอุปกรณ์เครือข่าย
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const deviceId = parseInt(params.id);
    if (isNaN(deviceId)) {
      return createErrorResponse('Invalid device ID', 400);
    }

    const query = `
      SELECT 
        nd.*,
        u.full_name as it_responsible_name,
        u2.full_name as created_by_name
      FROM network_devices nd
      LEFT JOIN users u ON nd.it_responsible_id = u.user_id
      LEFT JOIN users u2 ON nd.created_by = u2.user_id
      WHERE nd.network_device_id = $1
    `;

    const result = await pool.query(query, [deviceId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Network device not found', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Get network device error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/network-devices/[id] - อัปเดตอุปกรณ์เครือข่าย
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const deviceId = parseInt(params.id);
    if (isNaN(deviceId)) {
      return createErrorResponse('Invalid device ID', 400);
    }

    const body = await request.json();

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'brand', 'model', 'serial_number', 'device_type', 'ip_address',
      'mac_address', 'port_count', 'bandwidth', 'vlan', 'firmware_version',
      'location', 'branch', 'it_responsible_id', 'purchase_date', 'purchase_price',
      'warranty_expiry_date', 'warranty_alert_days', 'status', 'description'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(body[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return createErrorResponse('No fields to update', 400);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(deviceId);

    const updateQuery = `
      UPDATE network_devices
      SET ${updateFields.join(', ')}
      WHERE network_device_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return createErrorResponse('Network device not found', 404);
    }

    return createSuccessResponse(result.rows[0], 'Network device updated successfully');
  } catch (error) {
    console.error('Update network device error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

