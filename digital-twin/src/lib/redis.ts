/**
 * Redis replacement using Neon PostgreSQL (database_cache table)
 * Drop-in replacement for @upstash/redis - no Redis needed
 */

import { getPool, ensureInitialized } from "./postgres";

/**
 * Store a value in the database cache with optional TTL (in seconds)
 */
export async function setRedisValue(
  key: string,
  value: string | object,
  ttl?: number
) {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    const expiresAt = ttl
      ? new Date(Date.now() + ttl * 1000)
      : null;

    await client.query(
      `INSERT INTO database_cache (key, value, expires_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         expires_at = EXCLUDED.expires_at,
         updated_at = CURRENT_TIMESTAMP`,
      [key, serialized, expiresAt]
    );
  } catch (error) {
    console.error("Cache set error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Retrieve a value from the database cache
 */
export async function getRedisValue(key: string) {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const result = await client.query(
      `SELECT value FROM database_cache 
       WHERE key = $1 AND (expires_at IS NULL OR expires_at > NOW())`,
      [key]
    );

    if (result.rows.length === 0) return null;

    const raw = result.rows[0].value;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch (error) {
    console.error("Cache get error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete a value from the cache
 */
export async function deleteRedisValue(key: string) {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    await client.query("DELETE FROM database_cache WHERE key = $1", [key]);
  } catch (error) {
    console.error("Cache delete error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Rate limit check using database_cache table
 */
export async function checkRateLimit(
  userId: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<boolean> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const key = `rate-limit:${userId}`;
    const expiresAt = new Date(Date.now() + windowSeconds * 1000);

    const result = await client.query(
      `INSERT INTO rate_limits (key, count, expires_at)
       VALUES ($1, 1, $2)
       ON CONFLICT (key) DO UPDATE SET
         count = CASE 
           WHEN rate_limits.expires_at <= NOW() THEN 1
           ELSE rate_limits.count + 1
         END,
         expires_at = CASE
           WHEN rate_limits.expires_at <= NOW() THEN $2
           ELSE rate_limits.expires_at
         END
       RETURNING count`,
      [key, expiresAt]
    );

    const count = result.rows[0]?.count ?? 1;
    return count <= limit;
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail open on error
    return true;
  } finally {
    client.release();
  }
}