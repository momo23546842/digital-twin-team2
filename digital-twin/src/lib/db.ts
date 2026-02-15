import prisma from './prisma';
import type { Visitor, Conversation, Interaction } from '@prisma/client';

// ==========================================
// Visitor Operations
// ==========================================

/**
 * Create or update a visitor
 * If email exists, update the visitor; otherwise create new
 */
export async function upsertVisitor(data: {
  email?: string;
  name?: string;
  phone?: string;
  company?: string;
  role?: string;
}): Promise<Visitor> {
  try {
    if (data.email) {
      return await prisma.visitor.upsert({
        where: { email: data.email },
        update: {
          name: data.name ?? undefined,
          phone: data.phone ?? undefined,
          company: data.company ?? undefined,
          role: data.role ?? undefined,
        },
        create: data as any,
      });
    }

    return await prisma.visitor.create({
      data: data as any,
    });
  } catch (error: any) {
    console.error('upsertVisitor error:', error?.message ?? error);
    throw new Error('Failed to upsert visitor');
  }
}

/**
 * Get visitor by ID
 */
export async function getVisitorById(id: string): Promise<Visitor | null> {
  try {
    return await prisma.visitor.findUnique({ where: { id } });
  } catch (error: any) {
    console.error('getVisitorById error:', error?.message ?? error);
    throw new Error('Failed to get visitor by id');
  }
}

/**
 * Get visitor by email
 */
export async function getVisitorByEmail(email: string): Promise<Visitor | null> {
  try {
    return await prisma.visitor.findUnique({ where: { email } });
  } catch (error: any) {
    console.error('getVisitorByEmail error:', error?.message ?? error);
    throw new Error('Failed to get visitor by email');
  }
}

// ==========================================
// Conversation Operations
// ==========================================

/**
 * Save a conversation message
 */
export async function saveConversation(
  visitorId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata?: any
): Promise<Conversation> {
  try {
    return await prisma.conversation.create({
      data: {
        visitorId,
        role,
        content,
        metadata,
      },
    });
  } catch (error: any) {
    console.error('saveConversation error:', error?.message ?? error);
    throw new Error('Failed to save conversation');
  }
}

/**
 * Get conversation history for a visitor
 */
export async function getConversationHistory(
  visitorId: string,
  limit: number = 50
): Promise<Conversation[]> {
  try {
    return await prisma.conversation.findMany({
      where: { visitorId },
      orderBy: { timestamp: 'asc' },
      take: limit,
    });
  } catch (error: any) {
    console.error('getConversationHistory error:', error?.message ?? error);
    throw new Error('Failed to get conversation history');
  }
}

/**
 * Get recent conversations across all visitors
 */
export async function getRecentConversations(limit: number = 20): Promise<Conversation[]> {
  try {
    return await prisma.conversation.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { visitor: true },
    });
  } catch (error: any) {
    console.error('getRecentConversations error:', error?.message ?? error);
    throw new Error('Failed to get recent conversations');
  }
}

// ==========================================
// Interaction Operations
// ==========================================

/**
 * Save interaction metadata
 */
export async function saveInteraction(data: {
  visitorId: string;
  sessionId: string;
  interestSignals?: any;
  sessionDuration?: number;
  bookingRequest?: boolean;
}): Promise<Interaction> {
  try {
    return await prisma.interaction.create({ data } as any);
  } catch (error: any) {
    console.error('saveInteraction error:', error?.message ?? error);
    throw new Error('Failed to save interaction');
  }
}

/**
 * Update interaction metadata
 */
export async function updateInteraction(
  id: string,
  data: {
    interestSignals?: any;
    sessionDuration?: number;
    bookingRequest?: boolean;
  }
): Promise<Interaction> {
  try {
    return await prisma.interaction.update({ where: { id }, data } as any);
  } catch (error: any) {
    console.error('updateInteraction error:', error?.message ?? error);
    throw new Error('Failed to update interaction');
  }
}

/**
 * Get interactions for a visitor
 */
export async function getVisitorInteractions(visitorId: string): Promise<Interaction[]> {
  try {
    return await prisma.interaction.findMany({
      where: { visitorId },
      orderBy: { timestamp: 'desc' },
    });
  } catch (error: any) {
    console.error('getVisitorInteractions error:', error?.message ?? error);
    throw new Error('Failed to get visitor interactions');
  }
}

export default prisma;
import { getPool, ensureInitialized } from "./postgres";

/**
 * Store a value in the database with optional TTL (in seconds)
 */
export async function setDatabaseValue(
  key: string,
  value: string | object,
  ttl?: number
) {
  await ensureInitialized();

  const client = await getPool().connect();
  try {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : null;

    await client.query(
      `
      INSERT INTO database_cache (key, value, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        expires_at = EXCLUDED.expires_at,
        updated_at = CURRENT_TIMESTAMP;
      `,
      [key, serialized, expiresAt]
    );
  } catch (error) {
    console.error("Database set error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Retrieve a value from the database
 */
export async function getDatabaseValue(key: string) {
  await ensureInitialized();

  const client = await getPool().connect();
  try {
    const result = await client.query(
      `
      SELECT value FROM database_cache
      WHERE key = $1 AND (expires_at IS NULL OR expires_at > NOW());
      `,
      [key]
    );

    if (result.rows.length === 0) return null;

    const value = result.rows[0].value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error("Database get error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete a value from the database
 */
export async function deleteDatabaseValue(key: string) {
  await ensureInitialized();

  const client = await getPool().connect();
  try {
    await client.query("DELETE FROM database_cache WHERE key = $1", [key]);
  } catch (error) {
    console.error("Database delete error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cleanup expired entries
 */
export async function cleanupExpiredEntries() {
  await ensureInitialized();

  const client = await getPool().connect();
  try {
    await client.query(`
      DELETE FROM database_cache 
      WHERE expires_at IS NOT NULL AND expires_at < NOW();
    `);
    await client.query(`
      DELETE FROM ingestion_metadata 
      WHERE expires_at IS NOT NULL AND expires_at < NOW();
    `);
    await client.query(`
      DELETE FROM rate_limits 
      WHERE expires_at < NOW();
    `);
  } catch (error) {
    console.error("Cleanup error:", error);
    throw error;
  } finally {
    client.release();
  }
}
