import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/chat', '/insights', '/settings'];
  
  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // Redirect to login if no token and trying to access protected route
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access to login/signup without token
  if ((pathname === '/login' || pathname === '/signup') && token) {
    // Redirect to dashboard if already logged in and trying to access auth pages
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/insights/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
};
