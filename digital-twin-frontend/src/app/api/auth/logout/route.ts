import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    // In a real application, you might want to:
    // 1. Invalidate the token on the backend
    // 2. Clear session data
    // For now, we just return a success response
    // The client will handle removing the token from localStorage

    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
