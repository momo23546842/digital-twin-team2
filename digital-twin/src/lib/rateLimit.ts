import { getPool } from "./postgres";

/**
 * Check rate limit for a user
 * Returns true if the request is allowed, false if rate limit is exceeded
 */
export async function checkRateLimit(
  userId: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<boolean> {
  const client = await getPool().connect();
  try {
    const key = `rate-limit:${userId}`;
    const expiresAt = new Date(Date.now() + windowSeconds * 1000);

    // Try to update the count if the key exists and hasn't expired
    const updateResult = await client.query(
      `
      UPDATE rate_limits
      SET count = count + 1
      WHERE key = $1 AND expires_at > NOW()
      RETURNING count;
      `,
      [key]
    );

    if (updateResult.rows.length > 0) {
      // Key exists and hasn't expired
      const currentCount = updateResult.rows[0].count;
      return currentCount <= limit;
    }

    // Key doesn't exist or has expired, create a new one
    await client.query(
      `
      INSERT INTO rate_limits (key, count, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO UPDATE SET
        count = EXCLUDED.count,
        expires_at = EXCLUDED.expires_at;
      `,
      [key, 1, expiresAt]
    );

    return true; // First request in the window is always allowed
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail open on error - allow the request
    return true;
  } finally {
    client.release();
  }
}

/**
 * Get current rate limit count for a user
 */
export async function getRateLimitCount(userId: string): Promise<number> {
  const client = await getPool().connect();
  try {
    const key = `rate-limit:${userId}`;

    const result = await client.query(
      `
      SELECT count FROM rate_limits
      WHERE key = $1 AND expires_at > NOW();
      `,
      [key]
    );

    return result.rows.length > 0 ? result.rows[0].count : 0;
  } catch (error) {
    console.error("Rate limit count error:", error);
    return 0;
  } finally {
    client.release();
  }
}

/**
 * Reset rate limit for a user
 */
export async function resetRateLimit(userId: string): Promise<void> {
  const client = await getPool().connect();
  try {
    const key = `rate-limit:${userId}`;
    await client.query("DELETE FROM rate_limits WHERE key = $1", [key]);
  } catch (error) {
    console.error("Rate limit reset error:", error);
    throw error;
  } finally {
    client.release();
  }
}
