import { NextRequest, NextResponse } from "next/server";
import { generateEmbeddings } from "@/lib/embeddings";
import { upsertVectors } from "@/lib/vector";
import { setRedisValue } from "@/lib/redis";

export const runtime = "nodejs";

/**
 * POST /api/ingest - Ingest documents and store as vector embeddings
 */
export async function POST(req: NextRequest) {
  try {
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

    // Generate embeddings for each document
    const vectors = await Promise.all(
      documents.map(async (doc: any) => {
        const vector = await generateEmbeddings(doc.content);
        return {
          id: doc.id,
          vector,
          metadata: {
            content: doc.content,
            title: doc.title || doc.id,
            source: doc.source || "uploaded",
            userId,
            ingestedAt: new Date().toISOString(),
            ...doc.metadata,
          },
        };
      })
    );

    // Upsert vectors to Upstash Vector DB
    await upsertVectors(vectors);

    // Store ingestion metadata in Redis
    const ingestKey = `ingest:${userId}:${Date.now()}`;
    await setRedisValue(
      ingestKey,
      {
        documentCount: documents.length,
        timestamp: new Date().toISOString(),
        documents: documents.map((d: any) => ({ id: d.id, title: d.title })),
      },
      86400 * 7 // 7 days TTL
    );

    return NextResponse.json(
      {
        success: true,
        message: `Ingested ${documents.length} documents`,
        ingestId: ingestKey,
        vectorCount: vectors.length,
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
