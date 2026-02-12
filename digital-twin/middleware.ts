import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;

  // List of protected routes
  const protectedRoutes = ['/chat', '/dashboard', '/admin'];
  const authRoutes = ['/login', '/signup'];
  const pathname = request.nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (authToken && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!authToken && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
