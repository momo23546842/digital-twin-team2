import { NextRequest, NextResponse } from 'next/server';
import { getUserWithPassword, createSession } from '@/lib/auth-database';
import { verifyPassword, generateToken, isValidEmail } from '@/lib/auth';
import { initializeDatabase } from '@/lib/postgres';

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    try {
      await initializeDatabase();
    } catch (initError) {
      console.error('Database initialization error:', initError);
      return NextResponse.json(
        { 
          message: 'Database connection error. Please check DATABASE_URL environment variable.',
          debug: process.env.NODE_ENV === 'development' ? initError instanceof Error ? initError.message : String(initError) : undefined
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json(
        { message: 'Invalid password format' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserWithPassword(email);
    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const { token, expiresAt } = generateToken(user.id);

    // Create session in database
    await createSession(user.id, token, expiresAt);

    // Create response with token
    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie for token
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        message: 'An error occurred during login',
        debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}
