import { NextRequest, NextResponse } from "next/server";
import { generateEmbeddings } from "@/lib/embeddings";
import { upsertVectors, storeIngestionMetadata, initializeDatabase } from "@/lib/postgres";

export const runtime = "nodejs";

// Track if database has been initialized
let dbInitialized = false;

// Max chunk size for content (characters) - keep metadata under 48KB limit
const MAX_CHUNK_SIZE = 2000;
const MAX_METADATA_CONTENT = 1000; // Truncated content for metadata

/**
 * Split text into chunks for embedding
 */
function chunkText(text: string, chunkSize: number = MAX_CHUNK_SIZE): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // If no chunks created (no sentence boundaries), chunk by size
  if (chunks.length === 0 && text.length > 0) {
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * POST /api/ingest - Ingest documents and store as vector embeddings
 */
export async function POST(req: NextRequest) {
  try {
    // Initialize database tables on first request
    if (!dbInitialized) {
      await initializeDatabase();
      dbInitialized = true;
    }

    const payload = await req.json();

    const { documents, userId = "anonymous" } = payload;

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: "Documents array is required" },
        { status: 400 }
      );
    }

    // Validate documents structure
    const validatedDocs = documents.every(
      (doc: any) => doc.id && doc.content && typeof doc.content === "string"
    );
    if (!validatedDocs) {
      return NextResponse.json(
        {
          error:
            "Each document must have 'id' and 'content' (string) fields",
        },
        { status: 400 }
      );
    }

    // Generate embeddings for each document (with chunking for large docs)
    const allVectors: Array<{ id: string; vector: number[]; metadata: Record<string, unknown> }> = [];

    for (const doc of documents) {
      const chunks = chunkText(doc.content);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const vector = await generateEmbeddings(chunk);
        const chunkId = chunks.length > 1 ? `${doc.id}-chunk-${i}` : doc.id;

        allVectors.push({
          id: chunkId,
          vector,
          metadata: {
            // Truncate content for metadata to stay under limit
            content: chunk.slice(0, MAX_METADATA_CONTENT) + (chunk.length > MAX_METADATA_CONTENT ? "..." : ""),
            title: doc.title || doc.id,
            source: doc.source || "uploaded",
            userId,
            documentId: doc.id,
            chunkIndex: i,
            totalChunks: chunks.length,
            ingestedAt: new Date().toISOString(),
          },
        });
      }
    }

    // Upsert vectors to PostgreSQL
    await upsertVectors(allVectors);

    // Store ingestion metadata in PostgreSQL ingestion_metadata table
    const ingestKey = `ingest:${userId}:${Date.now()}`;
    await storeIngestionMetadata(
      ingestKey,
      userId,
      documents.length,
      documents.map((d: any) => ({ id: d.id, title: d.title })),
      86400 * 7 // 7 days TTL
    );

    return NextResponse.json(
      {
        success: true,
        message: `Ingested ${documents.length} documents (${allVectors.length} chunks)`,
        ingestId: ingestKey,
        vectorCount: allVectors.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ingest API error:", error);
    return NextResponse.json(
      { error: "Failed to ingest documents" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ingest - List ingestion history
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || "anonymous";

    return NextResponse.json(
      {
        message: "Use POST to ingest documents",
        example: {
          documents: [
            {
              id: "doc-1",
              content: "Your document content here",
              title: "Document Title",
              source: "your-source",
            },
          ],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ingest GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingestion info" },
      { status: 500 }
    );
  }
}
