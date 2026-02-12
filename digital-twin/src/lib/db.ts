<<<<<<< HEAD
import { getPool, ensureInitialized } from "./postgres";
=======
import { getPool } from "./postgres";
>>>>>>> origin/main

/**
 * Store a value in the database with optional TTL (in seconds)
 */
export async function setDatabaseValue(
  key: string,
  value: string | object,
  ttl?: number
) {
<<<<<<< HEAD
  await ensureInitialized();

=======
>>>>>>> origin/main
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
<<<<<<< HEAD
  await ensureInitialized();

=======
>>>>>>> origin/main
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
<<<<<<< HEAD
  await ensureInitialized();

=======
>>>>>>> origin/main
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
<<<<<<< HEAD
  await ensureInitialized();

=======
>>>>>>> origin/main
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
