import { NextRequest, NextResponse } from 'next/server';
import { getPool, ensureInitialized } from '@/lib/postgres';
import { hashPassword, verifyPassword, generateJWT } from '@/lib/auth-utils';

/**
 * POST /api/admin-auth/login
 * Admin login endpoint
 */
export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'email and password are required' },
        { status: 400 }
      );
    }

    const client = await getPool().connect();
    try {
      // Get admin user from database
      const result = await client.query(
        'SELECT id, email, password_hash, name FROM admin_users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const adminUser = result.rows[0];

      // Verify password
      const isValidPassword = verifyPassword(password, adminUser.password_hash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = generateJWT(
        {
          sub: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: 'admin',
        },
        3600 * 24 // 24 hours
      );

      return NextResponse.json(
        {
          token,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
          },
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process login',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin-auth/register
 * Admin registration (create admin user)
 * Note: This should be restricted to existing admins or specific setup process
 */
export async function PATCH(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check auth if creating new admin (optional - implement as needed)
    const authHeader = request.headers.get('authorization');
    // For initial setup, you can remove this check or implement custom logic

    const client = await getPool().connect();
    try {
      // Check if admin already exists
      const existingResult = await client.query(
        'SELECT id FROM admin_users WHERE email = $1',
        [email]
      );

      if (existingResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'Admin user already exists' },
          { status: 409 }
        );
      }

      // Create admin user
      const id = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const passwordHash = hashPassword(password);

      const result = await client.query(
        `INSERT INTO admin_users (id, email, password_hash, name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, name`,
        [id, email, passwordHash, name, 'admin']
      );

      return NextResponse.json(
        {
          user: result.rows[0],
          message: 'Admin user created successfully',
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin-auth/verify
 * Verify admin token
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Token verification would happen here
    // For now, just return success if token is provided
    return NextResponse.json(
      { status: 'authenticated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
