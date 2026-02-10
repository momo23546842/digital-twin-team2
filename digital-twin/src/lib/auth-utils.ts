/**
 * Authentication Utilities
 * Handles password hashing and verification
 */

import crypto from 'crypto';

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(':');
  const hashBuffer = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  return hashBuffer.toString('hex') === key;
}

/**
 * Generate a random token
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Generate JWT-like token (simple implementation)
 */
export function generateJWT(payload: Record<string, any>, expiresIn = 3600): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + expiresIn,
    })
  ).toString('base64');
  
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'your-secret-key')
    .update(`${header}.${body}`)
    .digest('base64');

  return `${header}.${body}.${signature}`;
}

/**
 * Verify JWT token
 */
export function verifyJWT(token: string): Record<string, any> | null {
  try {
    const [header, body, signature] = token.split('.');
    const now = Math.floor(Date.now() / 1000);
    
    // Verify the signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'your-secret-key')
      .update(`${header}.${body}`)
      .digest('base64');

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode and check expiration
    const payload = JSON.parse(Buffer.from(body, 'base64').toString());
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
