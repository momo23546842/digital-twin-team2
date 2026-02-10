import { NextRequest, NextResponse } from "next/server";
import { callGroqChat } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rateLimit";
import { generateEmbeddings } from "@/lib/embeddings";
import { querySimilarVectors } from "@/lib/postgres";
import type { ChatRequestPayload, ChatResponsePayload } from "@/types";

export const runtime = "nodejs";

/**
 * Retrieve relevant context from vector database using RAG
 */
async function getRAGContext(userMessage: string): Promise<string> {
  try {
    // Generate embedding for user message
    const messageEmbedding = await generateEmbeddings(userMessage);

    // Query similar vectors
    const results = await querySimilarVectors(messageEmbedding, 3);

    if (!results || results.length === 0) {
      return "";
    }

    // Extract and format context from results
    const contextParts = results
      .map((result: any) => {
        const metadata = result.metadata || {};
        return metadata.content || result.metadata?.title || "";
      })
      .filter((text: string) => text.length > 0);

    if (contextParts.length === 0) {
      return "";
    }

    return `\n\nRelevant context from knowledge base:\n${contextParts.join("\n---\n")}`;
  } catch (error) {
    console.error("RAG context retrieval error:", error);
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    // Extract user ID for rate limiting
    const userId = req.headers.get("x-user-id") || "anonymous";

    // Rate limit check
    const isAllowed = await checkRateLimit(userId, 10, 60);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Parse request
    const payload: ChatRequestPayload = await req.json();

    if (!payload.messages || payload.messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Get the latest user message for RAG context
    const lastMessage = payload.messages[payload.messages.length - 1];
    const ragContext =
      lastMessage.role === "user"
        ? await getRAGContext(lastMessage.content)
        : "";

    // Format messages for Groq API
    const groqMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = payload.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Add system message with RAG context if available
    if (ragContext) {
      groqMessages.unshift({
        role: "system",
        content: `You are a helpful Digital Twin assistant. Use the following context to answer user questions accurately.${ragContext}`,
      });
    }

    // Call Groq API
    const response = await callGroqChat(groqMessages);

    // Build response
    const responsePayload: ChatResponsePayload = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
        metadata: {
          ragEnabled: !!ragContext,
          contextCount: ragContext ? 3 : 0,
        },
      },
      sessionId: payload.sessionId || `session-${Date.now()}`,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Chat API is running" });
}
