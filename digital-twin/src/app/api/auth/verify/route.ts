import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    // In a real app, you would validate the JWT here
    // For now, we'll just check if it exists
    return NextResponse.json(
      {
        valid: true,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: 'Token verification failed' },
      { status: 500 }
    );
  }
}
