import { NextRequest } from "next/server";
import { groq } from "@/lib/groq";
import { 
  checkRateLimit, 
  getRecentHistory, 
  saveChatMessage, 
  getDocuments 
} from "@/lib/prisma";
import { buildPersonaPrompt, buildMinimalPrompt, DEFAULT_PERSONA, type PersonaSettings } from "@/lib/persona";
import type { ChatRequestPayload } from "@/types";

export const runtime = "nodejs";

interface ExtendedChatPayload extends ChatRequestPayload {
  personaSettings?: PersonaSettings;
}

/**
 * Get context from stored documents in Postgres
 */
async function getDocumentContext(userId: string): Promise<string> {
  try {
    const documents = await getDocuments(userId);

    if (!documents || documents.length === 0) {
      console.log("Context: No documents found");
      return "";
    }

    console.log("Context: Found", documents.length, "documents");

    // Build context from all documents
    const contextParts = documents
      .map((doc: { title: string | null; content: string }) => {
        const title = doc.title || "Document";
        const content = doc.content || "";
        return `=== ${title} ===\n${content}`;
      })
      .filter((text: string) => text.length > 0);

    if (contextParts.length === 0) {
      console.log("Context: No valid documents after filtering");
      return "";
    }

    console.log("Context: Using", contextParts.length, "documents");
    return contextParts.join("\n\n---\n\n");
  } catch (error) {
    console.error("Document context retrieval error:", error);
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    // Extract user ID for rate limiting and context
    const userId = req.headers.get("x-user-id") || "anonymous";

    // Rate limit check
    const isAllowed = checkRateLimit(userId, 10, 60);
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const payload: ExtendedChatPayload = await req.json();

    if (!payload.messages || payload.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sessionId = payload.sessionId || `session-${Date.now()}`;
    const personaSettings = payload.personaSettings;

    // Get recent history from Postgres for context
    await getRecentHistory(sessionId, 10);

    // Get document context from Postgres
    const documentContext = await getDocumentContext(userId);

    // Format messages for Groq API
    const groqMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = payload.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Build persona from document context with optional settings
    const systemPrompt = documentContext
      ? buildPersonaPrompt(DEFAULT_PERSONA, documentContext, personaSettings)
      : buildMinimalPrompt();

    groqMessages.unshift({
      role: "system",
      content: systemPrompt,
    });

    // Save user message to Postgres asynchronously
    const lastMessage = payload.messages[payload.messages.length - 1];
    if (lastMessage.role === "user") {
      saveChatMessage(sessionId, "user", lastMessage.content).catch(console.error);
    }

    // Check if Groq is configured
    if (!groq) {
      return new Response(
        `data: ${JSON.stringify({ text: "[Groq API key not configured]" })}\n\ndata: [DONE]\n\n`,
        {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        }
      );
    }

    // Create streaming response using Groq
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
    });

    // Create a TransformStream to convert Groq stream to SSE
    const encoder = new TextEncoder();
    let fullContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullContent += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          // Save assistant message after streaming completes
          if (fullContent) {
            saveChatMessage(sessionId, "assistant", fullContent).catch(console.error);
          }
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Health check
export async function GET() {
  return new Response(
    JSON.stringify({ status: "ok", message: "Chat API is running" }),
    { headers: { "Content-Type": "application/json" } }
  );
}
