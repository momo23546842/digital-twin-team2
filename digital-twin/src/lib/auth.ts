import crypto from 'crypto';

/**
 * Hash a password using PBKDF2
 * Production-ready password hashing without external dependencies
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32).toString('hex');
  const iterations = 100000;
  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, 64, 'sha256')
    .toString('hex');
  return `${iterations}:${salt}:${hash}`;
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [iterations, salt, storedHash] = hash.split(':');
    const computedHash = crypto
      .pbkdf2Sync(password, salt, parseInt(iterations), 64, 'sha256')
      .toString('hex');
    return computedHash === storedHash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Get JWT secret, fail fast if not set in production
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    console.warn('WARNING: Using default JWT secret in development. Set JWT_SECRET env var.');
    return 'dev-secret-key-CHANGE-IN-PRODUCTION';
  }
  
  return secret;
}

/**
 * Generate a secure authentication token (JWT-like)
 */
export function generateToken(
  userId: string,
  expiresIn: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): { token: string; expiresAt: Date } {
  const payload = {
    userId,
    iat: Date.now(),
    exp: Date.now() + expiresIn,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
    'base64url'
  );
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${header}.${body}`)
    .digest('base64url');

  const token = `${header}.${body}.${signature}`;
  const expiresAt = new Date(payload.exp);

  return { token, expiresAt };
}

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    const [header, body, signature] = token.split('.');

    // Reconstruct and verify signature
    const expectedSignature = crypto
      .createHmac('sha256', getJwtSecret())
      .update(`${header}.${body}`)
      .digest('base64url');

    // Use timing-safe comparison
    const signatureBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
    
    if (signatureBuffer.length !== expectedBuffer.length || 
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }

    // Decode and verify payload
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());

    if (payload.exp < Date.now()) {
      return null; // Token expired
    }

    return { userId: payload.userId };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  // Minimum 8 characters, at least one number, one uppercase, one lowercase
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9@.\-_]/g, '');
}
