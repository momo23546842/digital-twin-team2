import { Index } from "@upstash/vector";

if (
  !process.env.UPSTASH_VECTOR_REST_URL ||
  !process.env.UPSTASH_VECTOR_REST_TOKEN
) {
  throw new Error(
    "Upstash Vector credentials are not defined in environment variables"
  );
}

export const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

/**
 * Upsert vectors into the Upstash Vector index
 */
export async function upsertVectors(
  vectors: Array<{ id: string; vector: number[]; metadata?: Record<string, unknown> }>
) {
  try {
    await vectorIndex.upsert(vectors);
  } catch (error) {
    console.error("Vector upsert error:", error);
    throw error;
  }
}

/**
 * Query similar vectors
 */
export async function querySimilarVectors(
  queryVector: number[],
  topK: number = 5
) {
  try {
    const results = await vectorIndex.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    });
    
    console.log("Vector query raw results:", JSON.stringify(results, null, 2).slice(0, 1000));
    
    return results;
  } catch (error) {
    console.error("Vector query error:", error);
    throw error;
  }
}

/**
 * Fetch a vector by ID
 */
export async function getVector(id: string) {
  try {
    const result = await vectorIndex.fetch([id]);
    return result[0] || null;
  } catch (error) {
    console.error("Vector fetch error:", error);
    throw error;
  }
}

/**
 * Delete vectors by ID
 */
export async function deleteVectors(ids: string[]) {
  try {
    await vectorIndex.delete(ids);
  } catch (error) {
    console.error("Vector delete error:", error);
    throw error;
  }
}
