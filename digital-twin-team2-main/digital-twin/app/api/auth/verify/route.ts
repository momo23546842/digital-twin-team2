import { NextRequest, NextResponse } from 'next/server';
import { getSessionByToken } from '@/lib/auth-database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or header
    const tokenFromCookie = request.cookies.get('auth_token')?.value;
    const tokenFromHeader = request.headers
      .get('authorization')
      ?.replace('Bearer ', '');

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token signature and expiration
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { authenticated: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify session exists in database
    const session = await getSessionByToken(token);
    if (!session) {
      return NextResponse.json(
        { authenticated: false, message: 'Session not found or expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      userId: payload.userId,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
