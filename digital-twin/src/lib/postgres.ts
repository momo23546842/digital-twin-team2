import { Pool, PoolClient } from "pg";

// Create a connection pool (will be initialized when DATABASE_URL is available)
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not defined");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of connections
    });
  }
  return pool;
}

/**
 * Initialize the database - create tables if they don't exist
 */
export async function initializeDatabase() {
  const client = await getPool().connect();
  try {
    // Try to enable pgvector extension (optional for now)
    try {
      await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
      console.log("pgvector extension enabled");
    } catch (error) {
      console.warn("pgvector extension not available, using JSONB for embeddings");
    }

    // Create vectors table (works with or without pgvector)
    await client.query(`
      CREATE TABLE IF NOT EXISTS vectors (
        id TEXT PRIMARY KEY,
        embedding JSONB NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create GIN index for JSONB queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS vectors_embedding_idx 
      ON vectors USING gin (embedding jsonb_path_ops);
    `);

    // Create ingestion metadata table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ingestion_metadata (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        document_count INTEGER NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        documents JSONB,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for ingestion metadata queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS ingestion_metadata_user_idx 
      ON ingestion_metadata(user_id);
    `);

    // Create database cache table
    await client.query(`
      CREATE TABLE IF NOT EXISTS database_cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create rate limiting table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER DEFAULT 1,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for rate limit cleanup
    await client.query(`
      CREATE INDEX IF NOT EXISTS rate_limits_expires_idx 
      ON rate_limits(expires_at);
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Upsert vectors into the database
 */
export async function upsertVectors(
  vectors: Array<{
    id: string;
    vector: number[];
    metadata?: Record<string, unknown>;
  }>
) {
  if (vectors.length === 0) return;

  await ensureInitialized();

  const client = await getPool().connect();
  try {
    // Build the VALUES clause for bulk insert
    const values: any[] = [];
    const placeholders: string[] = [];

    vectors.forEach((vec, idx) => {
      const paramIndex = idx * 4;
      placeholders.push(
        `($${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`
      );
      values.push(vec.id);
      values.push(JSON.stringify(vec.vector)); // Store as JSONB
      values.push(vec.metadata?.content || ""); // Store content separately
      values.push(JSON.stringify(vec.metadata || {}));
    });

    const query = `
      INSERT INTO vectors (id, embedding, content, metadata)
      VALUES ${placeholders.join(",")}
      ON CONFLICT (id) DO UPDATE SET
        embedding = EXCLUDED.embedding,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP;
    `;

    await client.query(query, values);
  } catch (error) {
    console.error("Vector upsert error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Query similar vectors using cosine similarity
 * Works with JSONB arrays (fallback when pgvector is not available)
 */
export async function querySimilarVectors(
  queryVector: number[],
  topK: number = 5
) {
  const client = await getPool().connect();
  try {
    const queryEmbed = JSON.stringify(queryVector);

    // Calculate cosine similarity in SQL for JSONB arrays
    const result = await client.query(
      `
      WITH vector_similarity AS (
        SELECT 
          id,
          content,
          metadata,
          embedding,
          (
            SELECT SUM((v1.value::numeric) * (v2.value::numeric))
            FROM jsonb_array_elements_text(embedding) WITH ORDINALITY v1(value, ord)
            JOIN jsonb_array_elements_text($1::jsonb) WITH ORDINALITY v2(value, ord) ON v1.ord = v2.ord
          ) / (
            SQRT((SELECT SUM(POWER(value::numeric, 2)) FROM jsonb_array_elements_text(embedding) value)) *
            SQRT((SELECT SUM(POWER(value::numeric, 2)) FROM jsonb_array_elements_text($1::jsonb) value))
          ) AS similarity
        FROM vectors
      )
      SELECT id, content, metadata, similarity
      FROM vector_similarity
      WHERE similarity IS NOT NULL
      ORDER BY similarity DESC
      LIMIT $2;
      `,
      [queryEmbed, topK]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      score: row.similarity || 0,
      text_chunk: row.content,
      metadata: row.metadata || {},
    }));
  } catch (error) {
    console.error("Vector query error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Fetch a vector by ID
 */
export async function getVector(id: string) {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      "SELECT id, embedding, content, metadata FROM vectors WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      vector: row.embedding,
      content: row.content,
      metadata: row.metadata,
    };
  } catch (error) {
    console.error("Vector fetch error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete vectors by ID
 */
export async function deleteVectors(ids: string[]) {
  if (ids.length === 0) return;

  const client = await getPool().connect();
  try {
    const placeholders = ids.map((_, idx) => `$${idx + 1}`).join(",");
    await client.query(
      `DELETE FROM vectors WHERE id IN (${placeholders})`,
      ids
    );
  } catch (error) {
    console.error("Vector delete error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Store ingestion metadata
 */
export async function storeIngestionMetadata(
  id: string,
  userId: string,
  documentCount: number,
  documents: Array<{ id: string; title?: string }>,
  ttlSeconds?: number
) {
  const client = await getPool().connect();
  try {
    const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : null;

    await client.query(
      `
      INSERT INTO ingestion_metadata (id, user_id, document_count, documents, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        document_count = EXCLUDED.document_count,
        documents = EXCLUDED.documents,
        expires_at = EXCLUDED.expires_at,
        timestamp = CURRENT_TIMESTAMP;
      `,
      [id, userId, documentCount, JSON.stringify(documents), expiresAt]
    );
  } catch (error) {
    console.error("Ingestion metadata storage error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * getPool is already exported above
 */

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
