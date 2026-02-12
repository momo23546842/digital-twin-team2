import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/auth-database';
import { generateToken, isValidEmail, isValidPassword } from '@/lib/auth';
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
    const { email, password, confirmPassword, name } = body;

    // Validate input
    if (!email || !password || !name || !confirmPassword) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          message:
            'Password must be at least 8 characters with uppercase, lowercase, and numbers',
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 255) {
      return NextResponse.json(
        { message: 'Invalid name format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser(email, name.trim(), password);

    // Generate token
    const { token, expiresAt } = generateToken(user.id);

    // Create response
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
      { status: 201 }
    );

    // Set secure HTTP-only cookie
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
    console.error('Signup error:', error);

    if (error instanceof Error && error.message === 'Email already exists') {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        message: 'An error occurred during signup',
        debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}
