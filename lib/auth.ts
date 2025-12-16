import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || '86400'); // 24 hours
const JWT_REFRESH_EXPIRES_IN = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800'); // 7 days

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT Access Token
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Generate JWT Refresh Token
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

// Verify JWT Access Token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Verify JWT Refresh Token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Store refresh token in database
export async function storeRefreshToken(userId: number, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + JWT_REFRESH_EXPIRES_IN);
  
  const tokenHash = await hashPassword(token);
  
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );
}

// Verify refresh token from database
export async function verifyRefreshTokenInDB(userId: number, token: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT token_hash FROM refresh_tokens 
     WHERE user_id = $1 AND expires_at > NOW() 
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return false;
  }

  // Check all recent tokens (in case of token rotation)
  for (const row of result.rows) {
    const isValid = await verifyPassword(token, row.token_hash);
    if (isValid) {
      return true;
    }
  }

  return false;
}

// Authenticate user
export async function authenticateUser(usernameOrEmail: string, password: string) {
  const result = await pool.query(
    `SELECT user_id, username, email, password_hash, full_name, role, status 
     FROM users 
     WHERE (username = $1 OR email = $1) AND status = 'Active'`,
    [usernameOrEmail]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    return null;
  }

  return {
    userId: user.user_id,
    username: user.username,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
  };
}

