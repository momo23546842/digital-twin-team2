# Authentication Security Implementation

## Overview

This implementation addresses the security vulnerability where authentication tokens were previously stored in localStorage, making them vulnerable to XSS (Cross-Site Scripting) attacks.

## Security Improvements

### 1. HttpOnly Cookies
- **Before**: Auth tokens stored in localStorage (accessible to JavaScript)
- **After**: Auth tokens stored in httpOnly cookies (NOT accessible to JavaScript)
- **Benefit**: Protects against XSS attacks where malicious scripts could steal tokens

### 2. Cookie Security Attributes
All authentication cookies are set with secure attributes:
- `httpOnly: true` - Cannot be accessed by JavaScript
- `secure: true` (in production) - Only sent over HTTPS
- `sameSite: 'lax'` - Protects against CSRF attacks
- `path: '/'` - Available across the entire application

### 3. API Proxy Pattern
The frontend uses a proxy API route (`/api/proxy/[...path]`) that:
- Automatically attaches auth tokens from httpOnly cookies
- Forwards requests to the backend API
- Handles token refresh automatically on 401 responses
- Keeps the backend API URL hidden from the client

### 4. Middleware Protection
A Next.js middleware layer provides:
- Route-based authentication checks
- Security headers (XSS, clickjacking protection)
- Content Security Policy (CSP)
- Automatic redirects to login for unauthenticated users

## Architecture

```
Client Request → Middleware (auth check) → Next.js API Route → Backend API
                     ↓                            ↓
              Security Headers              Cookie-based auth
```

## API Routes

### `/api/auth/login`
- Authenticates user with backend
- Sets httpOnly cookies for auth and refresh tokens
- Returns user data (without tokens)

### `/api/auth/logout`
- Clears authentication cookies
- No token data sent to client

### `/api/auth/refresh`
- Refreshes expired auth tokens
- Uses refresh token from httpOnly cookie
- Updates cookies with new tokens

### `/api/proxy/[...path]`
- Forwards all API requests to backend
- Automatically includes auth token from cookies
- Handles token refresh on 401 errors

## Usage

### Login
```typescript
import { login } from '@/lib/auth';

const result = await login({ email, password });
if (result.user) {
  // Success - cookies are automatically set
} else {
  // Handle error: result.error
}
```

### Logout
```typescript
import { logout } from '@/lib/auth';

await logout(); // Clears cookies and redirects to login
```

### Making Authenticated API Calls
```typescript
import { apiClient } from '@/lib/api/client';

// Tokens are automatically included from cookies
const response = await apiClient.get('/users/me');
```

## Migration Notes

**Breaking Changes:**
- Applications must now use the `/api/proxy` routes instead of direct backend URLs
- `API_BASE_URL` is no longer used by the client (only in server-side proxy)
- All auth-related code must use the new auth utilities

**Compatibility:**
- Existing API endpoint constants remain unchanged
- The API client interface remains the same
- Minimal changes required to existing components

## Security Best Practices

1. **Always use HTTPS in production** - Required for `secure` cookie flag
2. **Keep tokens short-lived** - Auth tokens expire after 7 days
3. **Use refresh tokens** - Refresh tokens expire after 30 days
4. **Monitor cookie size** - Large cookies can impact performance
5. **Regular security audits** - Review auth implementation periodically

## Testing

To test the authentication flow:
1. Verify cookies are set after login (check browser DevTools)
2. Confirm tokens are NOT accessible via `document.cookie`
3. Test automatic token refresh on 401 responses
4. Verify logout clears all auth cookies
5. Test middleware redirects for protected routes
