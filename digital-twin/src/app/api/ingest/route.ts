import { NextRequest, NextResponse } from "next/server";
import { generateEmbeddings } from "@/lib/embeddings";
import { upsertVectors, storeIngestionMetadata } from "@/lib/postgres";

export const runtime = "nodejs";

/**
 * POST /api/ingest - Ingest documents and store in Postgres
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

    // Save each document to Postgres
    const savedDocs = [];
    for (const doc of documents) {
      const savedDoc = await saveDocument({
        userId,
        title: doc.title || doc.id,
        content: doc.content,
        source: doc.source || "uploaded",
      });
      savedDocs.push(savedDoc);
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
        message: `Ingested ${documents.length} documents`,
        documentCount: savedDocs.length,
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
 * GET /api/ingest - List ingested documents
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || "anonymous";
    
    const documents = await getDocuments(userId);

    return NextResponse.json(
      {
        documents: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          source: doc.source,
          createdAt: doc.createdAt,
        })),
        count: documents.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ingest GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
