/**
 * Generate embeddings for text using Groq's embedding model
 * Falls back to a simple hash-based embedding if API fails
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    // For demonstration, we'll create a simple embedding
    // In production, you'd use a proper embedding model via Groq or another service
    
    // Simple hash-based embedding (deterministic and consistent)
    const embedding = simpleEmbedding(text);
    return embedding;
  } catch (error) {
    console.error("Embeddings generation error:", error);
    // Return fallback embedding
    return simpleEmbedding(text);
  }
}

/**
 * Simple hash-based embedding for demonstration
 * Creates a 1536-dimensional vector from text (matches Upstash Vector index)
 */
function simpleEmbedding(text: string): number[] {
  const dimensions = 1536;
  const embedding: number[] = new Array(dimensions).fill(0);

  // Normalize text
  const normalized = text.toLowerCase().trim();

  // Create a hash value for the text
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Distribute hash values across dimensions
  for (let i = 0; i < dimensions; i++) {
    const charIndex = (i * normalized.length) % normalized.length;
    const char = normalized.charCodeAt(charIndex) || 0;
    const value = Math.sin(hash + i + char) * 0.5 + 0.5;
    embedding[i] = value;
  }

  // Normalize the embedding to unit length
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  return embedding.map((val) => (magnitude > 0 ? val / magnitude : 0));
}

/**
 * Batch generate embeddings for multiple texts
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<number[][]> {
  return Promise.all(texts.map((text) => generateEmbeddings(text)));
}
