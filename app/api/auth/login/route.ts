import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateAccessToken, generateRefreshToken, storeRefreshToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { createErrorResponse, createSuccessResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors[0].message,
        400
      );
    }

    const { usernameOrEmail, password } = validationResult.data;

    // Authenticate user
    const user = await authenticateUser(usernameOrEmail, password);
    
    if (!user) {
      return createErrorResponse('Invalid username/email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.userId,
      username: user.username,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userId,
      username: user.username,
      role: user.role,
    });

    // Store refresh token in database
    await storeRefreshToken(user.userId, refreshToken);

    // Return response
    return createSuccessResponse({
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

