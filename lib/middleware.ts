import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

// Authentication middleware
export function authenticateRequest(request: NextRequest): {
  user: { userId: number; username: string; role: string } | null;
  error: string | null;
} {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    return { user: null, error: 'Invalid or expired token' };
  }

  return { user: payload, error: null };
}

// Authorization middleware - Check if user has required role
export function requireRole(allowedRoles: string[]) {
  return (user: { role: string } | null): boolean => {
    if (!user) {
      return false;
    }
    return allowedRoles.includes(user.role);
  };
}

// Create error response
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'ERROR',
        message,
      },
    },
    { status }
  );
}

// Create success response
export function createSuccessResponse(data: any, message: string = 'Operation successful') {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

