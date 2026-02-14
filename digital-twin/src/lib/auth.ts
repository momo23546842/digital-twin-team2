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
 * Get JWT secret, required at runtime
 * During build time (when NODE_ENV is not 'production' or 'development'),
 * we allow it to be missing since no actual auth operations happen during build
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  // Allow missing JWT_SECRET during build/prerender phase
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-export';
  
  if (!secret) {
    if (isBuildTime) {
      // Return a placeholder during build - actual secret needed at runtime
      console.warn('JWT_SECRET not set during build - this is OK for static generation');
      return 'build-time-placeholder-not-used-for-actual-auth';
    }
    throw new Error(
      'JWT_SECRET environment variable is required. ' +
      'Set it in your .env.local file or environment variables.'
    );
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
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
    try {
      const signatureBuffer = Buffer.from(signature, 'base64url');
      const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
      
      if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
        return null;
      }
    } catch {
      // Buffers have different lengths or other error
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
