import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { checkoutSchema } from '@/lib/validation';

// POST /api/assets/[id]/checkout - Check-out ทรัพย์สิน
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { user, error: authError } = authenticateRequest(request);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const assetId = parseInt(params.id);
    if (isNaN(assetId)) {
      return createErrorResponse('Invalid asset ID', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = checkoutSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors[0].message,
        400
      );
    }

    const data = validationResult.data;

    // Check if asset exists and is available
    const assetResult = await pool.query(
      'SELECT asset_id, status, serial_number, asset_name FROM assets WHERE asset_id = $1 AND deleted_at IS NULL',
      [assetId]
    );

    if (assetResult.rows.length === 0) {
      return createErrorResponse('Asset not found', 404);
    }

    const asset = assetResult.rows[0];

    if (asset.status !== 'Available') {
      return createErrorResponse(
        `Asset is not available for checkout. Current status: ${asset.status}`,
        400
      );
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create transaction record
      const checkoutDate = data.checkoutDate || new Date().toISOString().split('T')[0];
      
      const transactionQuery = `
        INSERT INTO transactions (
          asset_id, transaction_type, assigned_to, assigned_location,
          transaction_date, expected_return_date, notes, performed_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const transactionResult = await pool.query(transactionQuery, [
        assetId,
        'Check-out',
        data.assignedTo,
        data.assignedLocation,
        checkoutDate,
        data.expectedReturnDate || null,
        data.purposeReason || null,
        user.userId,
      ]);

      // Update asset status to "In Use"
      const updateAssetQuery = `
        UPDATE assets
        SET status = 'In Use',
            current_user_id = $1,
            updated_by = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE asset_id = $3
        RETURNING *
      `;

      // Try to find user by username/email if assigned_to is a username
      let assignedUserId = null;
      if (data.assignedTo) {
        const userResult = await pool.query(
          'SELECT user_id FROM users WHERE (username = $1 OR email = $1) AND status = $2',
          [data.assignedTo, 'Active']
        );
        if (userResult.rows.length > 0) {
          assignedUserId = userResult.rows[0].user_id;
        }
      }

      const assetUpdateResult = await pool.query(updateAssetQuery, [
        assignedUserId,
        user.userId,
        assetId,
      ]);

      // Commit transaction
      await pool.query('COMMIT');

      return createSuccessResponse(
        {
          transaction: transactionResult.rows[0],
          asset: assetUpdateResult.rows[0],
        },
        'Asset checked out successfully'
      );
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Checkout asset error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

