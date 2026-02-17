import { getPool } from './postgres';
import { hashPassword } from './auth';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      `SELECT id, email, name, created_at, updated_at FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    console.error('Get user by email error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      `SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get user with password hash for login verification
 */
export async function getUserWithPassword(email: string): Promise<(User & { passwordHash: string }) | null> {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      `SELECT id, email, name, password_hash, created_at, updated_at FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    console.error('Get user with password error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  name: string,
  password: string
): Promise<User> {
  const client = await getPool().connect();
  try {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const passwordHash = hashPassword(password);
    const normalizedEmail = email.toLowerCase();

    const result = await client.query(
      `INSERT INTO users (id, email, name, password_hash) 
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, created_at, updated_at`,
      [id, normalizedEmail, name, passwordHash]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error: any) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Email already exists');
    }
    console.error('Create user error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create a session
 */
export async function createSession(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<{ id: string }> {
  const client = await getPool().connect();
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await client.query(
      `INSERT INTO sessions (id, user_id, token, expires_at) 
       VALUES ($1, $2, $3, $4)`,
      [sessionId, userId, token, expiresAt]
    );

    return { id: sessionId };
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get session by token
 */
export async function getSessionByToken(
  token: string
): Promise<{ id: string; userId: string; expiresAt: Date } | null> {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      `SELECT id, user_id, expires_at FROM sessions 
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      expiresAt: row.expires_at,
    };
  } catch (error) {
    console.error('Get session error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Invalidate a session
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
  } catch (error) {
    console.error('Invalidate session error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cleanup expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query(`DELETE FROM sessions WHERE expires_at < NOW()`);
  } catch (error) {
    console.error('Cleanup expired sessions error:', error);
    throw error;
  } finally {
    client.release();
  }
}
