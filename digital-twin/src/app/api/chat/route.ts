import { NextRequest, NextResponse } from "next/server";
import { callGroqChat } from "@/lib/groq";
import { checkRateLimit } from "@/lib/redis";
import { generateEmbeddings } from "@/lib/embeddings";
import { querySimilarVectors } from "@/lib/vector";
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
      console.log("RAG: No results found");
      return "";
    }

    console.log("RAG: Found", results.length, "results");

    // Extract and format context from results
    const contextParts = results
      .map((result: any, index: number) => {
        const metadata = result.metadata || {};
        const content = metadata.content || metadata.title || "";
        
        console.log(`RAG result ${index}:`, {
          hasMetadata: !!result.metadata,
          contentType: typeof content,
          contentLength: typeof content === "string" ? content.length : 0,
          contentPreview: typeof content === "string" ? content.slice(0, 100) : "N/A",
          score: result.score,
        });
        
        // Ensure content is a valid string
        if (typeof content !== "string" || content.length === 0) {
          console.warn("Skipping empty or non-string metadata content");
          return "";
        }
        
        return content;
      })
      .filter((text: string) => text.length > 0);

    if (contextParts.length === 0) {
      console.log("RAG: No valid context parts after filtering");
      return "";
    }

    console.log("RAG: Using", contextParts.length, "context parts");
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

    // Add system message - Digital Twin persona
    const systemPrompt = ragContext
      ? `You ARE the person described in the following context. You are their Digital Twin - respond in FIRST PERSON as if you are them.

Rules:
- Speak as "I", "me", "my" - you ARE this person
- Adopt their personality, tone, and communication style based on the context
- Answer questions about yourself using the information provided
- Be conversational and natural, as if chatting casually
- If asked about experiences, skills, or background, draw from the context
- If something isn't in the context, you can say "I don't think I've mentioned that" or make reasonable inferences
- Be friendly, authentic, and personable - this is a conversation, not an interview

Context about you (the person you're embodying):
${ragContext}`
      : `You are a Digital Twin assistant. No personal documents have been uploaded yet. 
         Ask the user to upload documents (like a resume, bio, or personal info) so you can become their Digital Twin and respond as them.`;

    groqMessages.unshift({
      role: "system",
      content: systemPrompt,
    });

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
