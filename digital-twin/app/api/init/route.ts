import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, getPool } from '@/lib/postgres';
import { createUser } from '@/lib/auth-database';

/**
 * Initialize database and seed demo data
 * This endpoint should only be called once during setup
 */
export async function POST(request: NextRequest) {
  try {
    // Check if this is a development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { message: 'Database initialization is disabled in production' },
        { status: 403 }
      );
    }

    // Check for init token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.INIT_TOKEN || 'dev-init-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize database
    await initializeDatabase();

    // Seed demo user (or update password if exists)
    try {
      const demoUser = await createUser(
        'test@example.com',
        'Test User',
        'password123'
      );
      console.log('Demo user created:', demoUser.id);
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        // User exists - update password to ensure it matches demo credentials
        console.log('Demo user already exists, updating password...');
        const { updateUserPassword } = await import('@/lib/auth-database');
        await updateUserPassword('test@example.com', 'password123');
        console.log('Demo user password updated');
      } else {
        throw error;
      }
    }

    return NextResponse.json(
      { 
        message: 'Database initialized successfully',
        demoCredentials: {
          email: 'test@example.com',
          password: 'password123'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { 
        message: 'Initialization failed',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Get initialization status
 */
export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const client = await pool.connect();
    client.release();

    return NextResponse.json(
      { 
        message: 'Database connection successful',
        status: 'connected'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        message: 'Database connection failed',
        status: 'disconnected',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
