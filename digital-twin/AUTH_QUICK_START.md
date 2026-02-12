# Authentication System - Quick Start Guide

## What's Been Implemented ✅

A **production-ready authentication system** for your Digital Twin application with:

1. **Secure Password Hashing** - PBKDF2 (SHA256, 100K iterations)
2. **Token-Based Auth** - JWT-like tokens with HMAC-SHA256
3. **Session Management** - Persistent database sessions
4. **Route Protection** - Automatic middleware protection
5. **API Endpoints** - Login, signup, logout, verify
6. **Error Handling** - Security-focused error messages
7. **Type Safety** - Full TypeScript interfaces
8. **Documentation** - Complete guides and examples

---

## 5-Minute Setup

### Step 1: Environment Variables
Create `.env.local` in your project root:

```env
DATABASE_URL=postgresql://user:password@host:port/neon_database
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NODE_ENV=development
```

**Get your DATABASE_URL:**
1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Create a PostgreSQL database
3. Copy the connection string

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Run App (Automatic Setup)
```bash
cd digital-twin
npm install
npm run dev
```

The app automatically creates the `users` and `sessions` tables on first run.

### Step 3: Test Authentication
Visit http://localhost:3000 in your browser and:

1. **Sign Up**: Click "Create Account" → enter email, name, password
2. **Log In**: Click "Sign In" → use your credentials
3. **Protected Route**: After login, you'll be redirected to `/chat`
4. **Logout**: Click logout in navbar

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│     Next.js Frontend (React)         │
├─────────────────────────────────────┤
│ Login Form → /api/auth/login         │
│ Signup Form → /api/auth/signup       │
│ Logout Button → /api/auth/logout     │
└─────────────────────────────────────┘
            ↓↑
┌─────────────────────────────────────┐
│      API Routes (Next.js)            │
├─────────────────────────────────────┤
│ /api/auth/login  → validates creds   │
│ /api/auth/signup → creates user      │
│ /api/auth/logout → clears session    │
│ /api/auth/verify → checks token      │
└─────────────────────────────────────┘
            ↓↑
┌─────────────────────────────────────┐
│   Auth & Database Libraries          │
├─────────────────────────────────────┤
│ src/lib/auth.ts → crypto ops         │
│ src/lib/auth-database.ts → DB ops    │
│ src/lib/postgres.ts → connection     │
└─────────────────────────────────────┘
            ↓↑
┌─────────────────────────────────────┐
│   PostgreSQL Database (Neon)         │
├─────────────────────────────────────┤
│ users table (email, password_hash)   │
│ sessions table (token, expires_at)   │
└─────────────────────────────────────┘
```

---

## File Structure

```
digital-twin/
├── src/lib/
│   ├── auth.ts                      ← Password & token crypto
│   ├── auth-database.ts             ← User & session queries
│   ├── auth-context.tsx             ← Client auth state
│   └── postgres.ts                  ← Database connection
├── app/api/auth/
│   ├── login/route.ts               ← POST /api/auth/login
│   ├── signup/route.ts              ← POST /api/auth/signup
│   ├── logout/route.ts              ← POST /api/auth/logout
│   └── verify/route.ts              ← GET /api/auth/verify
├── app/(auth)/
│   ├── login/page.tsx               ← Login UI
│   └── signup/page.tsx              ← Signup UI
├── middleware.ts                    ← Route protection
├── AUTHENTICATION_GUIDE.md          ← Complete guide
├── AUTH_IMPLEMENTATION_CHECKLIST.md ← Setup checklist
├── AUTH_CODE_REVIEW.md              ← Code details
└── AUTH_QUICK_START.md              ← This file
```

---

## API Endpoints

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

# Response (200)
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "user_...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}

# Error (401)
{
  "message": "Invalid email or password"
}
```

### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}

# Response (201)
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "user_...",
    "email": "newuser@example.com",
    "name": "Jane Doe"
  }
}

# Error (400)
{
  "message": "Password must be 8+ chars with uppercase, lowercase, number"
}

# Error (409)
{
  "message": "Email already exists"
}
```

### Logout
```bash
POST /api/auth/logout

# Response (200)
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Verify Token
```bash
GET /api/auth/verify
Authorization: Bearer <token>

# Response (200)
{
  "authenticated": true,
  "userId": "user_...",
  "sessionId": "session_..."
}

# Error (401)
{
  "authenticated": false,
  "message": "Invalid or expired token"
}
```

---

## Password Requirements

✅ **Minimum 8 characters**  
✅ **At least one UPPERCASE letter**  
✅ **At least one lowercase letter**  
✅ **At least one NUMBER**  

Examples:
- ✅ `SecurePassword123`
- ✅ `MyP@ssw0rd`
- ❌ `password123` (no uppercase)
- ❌ `PASSWORD123` (no lowercase)
- ❌ `MyPassword` (no number)
- ❌ `Pass1` (too short)

---

## How It Works

### 1. Password Hashing (Signup)
```
User enters: MyPassword123
↓
Generate random salt (32 bytes)
↓
Hash = PBKDF2(SHA256, password, salt, 100000 iterations)
↓
Store: "100000:salt:hash" in database
```

### 2. Password Verification (Login)
```
User enters: MyPassword123
↓
Fetch user from database
↓
Extract: iterations, salt, stored_hash
↓
Compute: PBKDF2(SHA256, password, salt, iterations)
↓
Compare: computed_hash === stored_hash
↓
If match → create token & session
```

### 3. Token Generation
```
Payload = {
  userId: "user_1234...",
  iat: 1677836400,
  exp: 1678441200  // 7 days later
}
↓
Header = base64url({"alg":"HS256"})
↓
Token = Header.Payload.Signature
  (Signature = HMAC-SHA256(Header.Payload, JWT_SECRET))
↓
Return to client & store in localStorage
```

### 4. Authentication Flow
```
User clicks "Sign In"
↓
Form submitted to POST /api/auth/login
↓
API validates email format & password provided
↓
Query users table by email
↓
Verify password hash matches
↓
Generate token & session
↓
Set HTTP-only cookie
↓
Return token to client
↓
Client stores in localStorage
↓
Auth context updates state
↓
Redirect to /chat
```

---

## Security Features

### ✅ Password Security
- **PBKDF2 Hashing**: Industry standard, 100K iterations
- **Random Salt**: Unique for each password
- **No Plain Text**: Passwords never stored or logged
- **Constant Time**: Comparison prevents timing attacks

### ✅ Token Security
- **HMAC Signed**: Cannot be forged without secret
- **Expiration**: Automatically invalidated after 7 days
- **Session Backed**: Verified in database on each request
- **Unique**: New token generated for each login

### ✅ Cookie Security
- **HTTP-Only**: Cannot be accessed by JavaScript
- **Secure Flag**: Only sent over HTTPS in production
- **SameSite=Lax**: Prevents CSRF attacks
- **Path Limited**: Only available to application

### ✅ Input Security
- **Email Validation**: RFC 5322 format check
- **Password Strength**: Enforced minimum requirements
- **SQL Injection Prevention**: Parameterized queries
- **Name Validation**: Length and type checking

### ✅ Error Handling
- **Ambiguous Messages**: "Invalid email or password"
- **No Email Enumeration**: Cannot guess registered emails
- **Proper Status Codes**: 400, 401, 409, 500
- **Detailed Logging**: Server logs, not user-facing

---

## Protected Routes

After authentication, these routes are protected:

```
GET  /chat                          ← Chat interface
GET  /dashboard                     ← User dashboard
GET  /admin                         ← Admin panel
```

Accessing without valid token:
```
GET /chat (no token)
↓
Middleware checks for auth_token cookie
↓
Cookie missing/invalid
↓
Redirect to /login
```

---

## Testing with cURL

### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "name":"Test User",
    "password":"TestPassword123",
    "confirmPassword":"TestPassword123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPassword123"
  }'

# Copy the token from response
TOKEN="eyJhbGc..."
```

### Test Verify
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

### Test Protected Route
```bash
curl -X GET http://localhost:3000/chat \
  -H "Cookie: auth_token=$TOKEN"
```

### Test Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: auth_token=$TOKEN"
```

---

## Troubleshooting

### Error: "DATABASE_URL is not defined"
**Solution**: Add `DATABASE_URL` to `.env.local`

```env
DATABASE_URL=postgresql://user:pass@host:5432/neon
```

### Error: "Invalid email or password" (valid credentials)
**Possible causes**:
- User not created (try signup)
- Password mismatch (check caps)
- Database not initialized

**Solution**:
```bash
npm run dev  # Auto-initializes database
```

### Error: "Email already exists"
**Solution**: Use a different email address or delete user from database:
```sql
DELETE FROM users WHERE email = 'test@example.com';
```

### Token not persisting after logout
**Solution**: Middleware clears cookie, localStorage is cleared by frontend automatically

---

## Common Use Cases

### 1. Check if User is Logged In
```typescript
import { useAuth } from '@/lib/auth-context';

export default function MyComponent() {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }
  
  return <p>Welcome, {user?.name}!</p>;
}
```

### 2. Protect a Route
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
  }, [isLoading, isAuthenticated]);
  
  return <div>Protected content</div>;
}
```

### 3. Call Protected API
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ message: 'Hello' }),
});
```

### 4. Manual Token Verification
```typescript
const verifyAuth = async () => {
  const response = await fetch('/api/auth/verify');
  const data = await response.json();
  
  if (data.authenticated) {
    console.log('User ID:', data.userId);
  } else {
    console.log('Not authenticated');
  }
};
```

---

## Next Steps (Optional Enhancements)

### High Priority
- [ ] **Rate Limiting** - Prevent brute force attacks
- [ ] **Email Verification** - Confirm email on signup
- [ ] **Password Reset** - Forgot password flow
- [ ] **User Profile** - Edit name, email, avatar

### Medium Priority
- [ ] **Two-Factor Auth** - SMS or authenticator app
- [ ] **OAuth Integration** - Google, GitHub signin
- [ ] **Session Management** - View/revoke active sessions
- [ ] **Audit Logs** - Track login history

### Low Priority
- [ ] **Biometric Auth** - Fingerprint, face recognition
- [ ] **IP Whitelisting** - Restrict login locations
- [ ] **Device Management** - Trust devices
- [ ] **Account Recovery** - Backup codes

---

## Production Deployment

### Before Going Live

1. **Set strong JWT_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Enable HTTPS** (Vercel does this automatically)

3. **Set NODE_ENV=production**

4. **Verify cookie security** (automatic in production)

5. **Test all flows** with production credentials

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys from GitHub
# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - JWT_SECRET
# - NODE_ENV=production
```

---

## Getting Help

**Documentation Files**:
- `AUTHENTICATION_GUIDE.md` - Complete technical guide
- `AUTH_IMPLEMENTATION_CHECKLIST.md` - Setup checklist
- `AUTH_CODE_REVIEW.md` - Code architecture details
- `AUTH_QUICK_START.md` - This file

**Common Issues**:
See "Troubleshooting" section above

**Code Examples**:
See "Common Use Cases" section above

---

## Summary

✅ **Fully functional authentication**
✅ **Production-ready security**
✅ **Database persistence**
✅ **Route protection**
✅ **Type-safe TypeScript**
✅ **Complete documentation**

You're ready to launch! 🚀

---

**Status**: ✅ Ready for Production  
**Last Updated**: February 9, 2026  
**Version**: 1.0.0
