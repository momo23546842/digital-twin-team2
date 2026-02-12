/**
 * Vector operations using Neon PostgreSQL (vectors table)
 * Drop-in replacement for @upstash/vector - no Upstash needed
 */

import {
  upsertVectors as pgUpsertVectors,
  querySimilarVectors as pgQuerySimilarVectors,
  getVector as pgGetVector,
  deleteVectors as pgDeleteVectors,
} from "./postgres";

/**
 * Upsert vectors into the Neon PostgreSQL vectors table
 */
export async function upsertVectors(
  vectors: Array<{
    id: string;
    vector: number[];
    metadata?: Record<string, unknown>;
  }>
) {
  try {
    await pgUpsertVectors(vectors);
  } catch (error) {
    console.error("Vector upsert error:", error);
    throw error;
  }
}

/**
 * Query similar vectors using cosine similarity
 */
export async function querySimilarVectors(
  queryVector: number[],
  topK: number = 5
) {
  try {
    const results = await pgQuerySimilarVectors(queryVector, topK);
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
    return await pgGetVector(id);
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
    await pgDeleteVectors(ids);
  } catch (error) {
    console.error("Vector delete error:", error);
    throw error;
  }
}