# Authentication Implementation Guide

## Overview

This guide explains the production-ready authentication system implemented for the Digital Twin application. The system uses:

- **Password Hashing**: PBKDF2 with 100,000 iterations (no external dependencies)
- **Token Management**: JWT-like tokens with HMAC-SHA256 signing
- **Session Persistence**: PostgreSQL database storage
- **Secure Cookies**: HTTP-only cookies for token storage
- **Route Protection**: Middleware-based route protection

## Architecture

### 1. Core Authentication Files

#### `src/lib/auth.ts` - Core Auth Utilities
Handles all security-critical operations:

```typescript
// Password hashing with PBKDF2
hashPassword(password: string): string
verifyPassword(password: string, hash: string): boolean

// Token generation and verification
generateToken(userId: string, expiresIn?: number): { token: string; expiresAt: Date }
verifyToken(token: string): { userId: string } | null

// Input validation
isValidEmail(email: string): boolean
isValidPassword(password: string): boolean  // Min 8 chars, uppercase, lowercase, number
```

#### `src/lib/auth-database.ts` - Database Operations
Manages user and session data in the database:

```typescript
// User operations
createUser(email: string, name: string, password: string): Promise<User>
getUserByEmail(email: string): Promise<User | null>
getUserById(id: string): Promise<User | null>
getUserWithPassword(email: string): Promise<User & { passwordHash: string } | null>

// Session operations
createSession(userId: string, token: string, expiresAt: Date): Promise<{ id: string }>
getSessionByToken(token: string): Promise<{ id: string; userId: string; expiresAt: Date } | null>
invalidateSession(sessionId: string): Promise<void>
cleanupExpiredSessions(): Promise<void>
```

### 2. API Routes

#### `POST /api/auth/login` - User Login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "user_1234567890_abc",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- `400` - Email or password required, invalid email format
- `401` - Invalid email or password
- `500` - Server error

**Features:**
- ✅ Email validation
- ✅ Password verification
- ✅ Session creation
- ✅ HTTP-only cookie set
- ✅ Token in response body for localStorage
- ✅ Security: Hides whether email exists

---

#### `POST /api/auth/signup` - User Registration
**Request:**
```json
{
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "user_1234567890_xyz",
    "email": "newuser@example.com",
    "name": "Jane Doe"
  }
}
```

**Errors:**
- `400` - Missing fields, invalid email, weak password, passwords don't match
- `409` - Email already exists
- `500` - Server error

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

#### `POST /api/auth/logout` - User Logout
**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Features:**
- ✅ Invalidates session in database
- ✅ Clears HTTP-only cookie
- ✅ Works with or without token

---

#### `GET /api/auth/verify` - Verify Session
**Headers:**
```
Cookie: auth_token=<token>
OR
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "authenticated": true,
  "userId": "user_1234567890_abc",
  "sessionId": "session_1234567890_def"
}
```

**Errors:**
- `401` - No token, invalid token, or expired session
- `500` - Server error

---

### 3. Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX users_email_idx ON users(email);
```

#### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX sessions_user_idx ON sessions(user_id);
CREATE INDEX sessions_token_idx ON sessions(token);
CREATE INDEX sessions_expires_idx ON sessions(expires_at);
```

---

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Node Environment
NODE_ENV=development
```

**Generate a strong JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Database Setup

The database tables are automatically created when the app starts. However, you can manually run initialization:

```typescript
import { initializeDatabase } from '@/lib/postgres';

// Call once during app startup or in a migrations script
await initializeDatabase();
```

### 3. Update Login Page Component

The login page is already configured at `app/(auth)/login/page.tsx` and uses the API route.

Update the form submission if needed:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Login failed');
      return;
    }

    // Store token in localStorage
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    // Redirect to chat
    router.push('/chat');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setIsLoading(false);
  }
};
```

### 4. Update Auth Context

The auth context is located at `src/lib/auth-context.tsx` and reads the token from localStorage:

```typescript
// Already implemented - reads auth_token from localStorage on mount
useEffect(() => {
  const timer = setTimeout(() => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
    setIsLoading(false);
  }, 0);

  return () => clearTimeout(timer);
}, []);
```

---

## Route Protection

### Middleware Configuration

The middleware at `middleware.ts` protects routes automatically:

- **Protected Routes**: `/chat`, `/dashboard`, `/admin`
- **Auth Routes**: `/login`, `/signup`
- **Public Routes**: `/`, `/api/auth/*`

**Behavior:**
- ✅ Unauthenticated users on `/chat` → redirect to `/login`
- ✅ Authenticated users on `/login` → redirect to `/chat`
- ✅ Public routes accessible to everyone

### Manual Route Protection (Optional)

For more granular control in components:

```typescript
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Protected content</div>;
}
```

---

## Security Features

### 1. Password Security
- **PBKDF2 Hashing**: 100,000 iterations with SHA256
- **Random Salt**: Unique for each password
- **No Plain Text**: Passwords never stored unhashed

### 2. Token Security
- **HMAC-SHA256 Signing**: Prevents tampering
- **Expiration**: 7-day default (configurable)
- **Database Verification**: Session validated on every request

### 3. Cookie Security
- **HTTP-Only**: Cannot be accessed by JavaScript
- **Secure Flag**: Only sent over HTTPS in production
- **SameSite**: Prevents CSRF attacks
- **Path Restrictions**: Limited to `/`

### 4. Input Validation
- **Email**: RFC 5322 compliant format check
- **Password**: Strength requirements enforced
- **Name**: Length and type validation
- **Sanitization**: SQL injection prevention via parameterized queries

### 5. Error Messages
- **Ambiguous Messages**: "Invalid email or password" (doesn't reveal if email exists)
- **Detailed Validation**: Password requirements shown to user
- **Server Errors**: Generic message, detailed logs only

---

## Testing

### Test Credentials (Demo Only)

Default demo user (if seeded):
```
Email: test@example.com
Password: TestPassword123
```

### Test Login Flow

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123"}'
```

### Test Signup Flow

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "name":"Test User",
    "password":"SecurePassword123",
    "confirmPassword":"SecurePassword123"
  }'
```

### Test Token Verification

```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Issue: "DATABASE_URL environment variable is not defined"
**Solution**: Add `DATABASE_URL` to `.env.local`

### Issue: "Invalid email or password" for valid credentials
**Cause**: User not created or password hash mismatch
**Solution**: 
- Verify user exists in database
- Check password hashing algorithm
- Try creating a new user via signup

### Issue: Token expires too quickly
**Solution**: Adjust token expiration in `src/lib/auth.ts`:
```typescript
generateToken(userId, 30 * 24 * 60 * 60 * 1000) // 30 days
```

### Issue: CORS errors when calling API
**Solution**: Ensure requests are to same origin (no cross-domain calls)

---

## Best Practices Implemented

✅ **Never expose user passwords** - PBKDF2 hashing  
✅ **Secure token storage** - HTTP-only cookies + localStorage  
✅ **Expiring sessions** - Automatic cleanup  
✅ **Rate limiting ready** - Use middleware for rate limits  
✅ **Audit logs ready** - Add to session creation  
✅ **Password strength** - Enforced minimum requirements  
✅ **Input validation** - All user inputs validated  
✅ **CSRF protection** - SameSite cookies  
✅ **Type safety** - Full TypeScript interfaces  
✅ **Error handling** - Comprehensive error messages  

---

## Next Steps

1. **Add Rate Limiting**: Prevent brute force attacks
   ```typescript
   // Add to /api/auth/login
   const rateLimitKey = `login_${email}`;
   const attempts = await checkRateLimit(rateLimitKey);
   if (attempts > 5) return 429; // Too many requests
   ```

2. **Add Email Verification**: Send verification email on signup
3. **Add Password Reset**: Implement password reset flow
4. **Add 2FA**: Two-factor authentication support
5. **Add OAuth**: Google, GitHub signin integration
6. **Add Audit Logs**: Log all authentication events
7. **Add Admin Dashboard**: View users and sessions

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication-and-authorization)
- [PBKDF2 Specification](https://tools.ietf.org/html/rfc2898)
- [JWT Introduction](https://jwt.io/introduction)
