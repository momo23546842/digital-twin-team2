import { NextRequest, NextResponse } from 'next/server';
import { getUserWithPassword, createSession } from '@/lib/auth-database';
import { verifyPassword, generateToken, isValidEmail } from '@/lib/auth';
import { initializeDatabase } from '@/lib/postgres';

/**
 * POST /api/login
 * Validates user credentials and returns authentication token
 * This is an alternative to /api/auth/login with the same functionality
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    try {
      await initializeDatabase();
    } catch (initError) {
      console.error('Database initialization error:', initError);
      return NextResponse.json(
        {
          success: false,
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
        {
          success: false,
          message: 'Email and password are required'
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid password format'
        },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserWithPassword(email);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Password is valid - validate user
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        message: 'User validation successful'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login validation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login validation',
        debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/login
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'Login API endpoint',
      methods: {
        POST: {
          description: 'Validate user credentials',
          body: {
            email: 'string (required)',
            password: 'string (required)'
          },
          responses: {
            200: 'User validation successful',
            400: 'Invalid input',
            401: 'Invalid credentials',
            500: 'Server error'
          }
        }
      }
    },
    { status: 200 }
  );
}
