import { NextRequest, NextResponse } from "next/server";
import { callGroqChat } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rateLimit";
import { generateEmbeddings } from "@/lib/embeddings";
import { querySimilarVectors } from "@/lib/postgres";
import type { ChatRequestPayload, ChatResponsePayload } from "@/types";

export const runtime = "nodejs";

/**
 * System prompt for the Digital Twin AI - supports voice conversations
 */
const SYSTEM_PROMPT = `You are a Digital Twin AI assistant with FULL voice conversation capabilities.

CRITICAL VOICE INTERACTION RULES:
- You FULLY SUPPORT voice conversations - this is a primary feature
- NEVER refuse voice interactions or say "I don't support voice"
- Treat voice input exactly the same as text input
- Users can speak to you and hear your responses spoken aloud
- Voice is a core feature, not optional

CONVERSATION STYLE:
- Be natural, friendly, and conversational
- Keep responses concise (1-3 sentences) for voice users unless they ask for detail
- Be direct and helpful - avoid unnecessary preamble
- Use natural language, not formal documentation style
- Be engaging and personable

YOUR IDENTITY:
- You are a professional Digital Twin AI assistant
- You represent your creator's knowledge, skills, and experience
- You help recruiters, visitors, and contacts learn about your creator
- You can discuss skills, experience, projects, and availability

RESPONSE GUIDELINES:
- Answer questions directly and helpfully
- For brief questions, give brief answers
- Expand with details only when specifically asked
- Be honest about what you know and don't know
- If you have context from the knowledge base, use it

VOICE-SPECIFIC BEHAVIORS:
- Voice input may have minor transcription errors - infer intent
- Keep responses speakable - avoid complex formatting, lists, or code in voice responses
- Be conversational, not robotic
- Respond as if having a natural conversation

Remember: Voice conversation is a PRIMARY and FULLY SUPPORTED feature!`;

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

    // Rate limit check - disabled for development (high limit)
    // To re-enable strict rate limiting, change 1000 back to 10-60
    const isAllowed = await checkRateLimit(userId, 1000, 60); // High limit for development
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

    // Build system prompt with RAG context if available
    let systemContent = SYSTEM_PROMPT;
    if (ragContext) {
      systemContent += `\n\nUse the following context from the knowledge base to answer accurately:${ragContext}`;
    }

    // Add system message at the beginning
    groqMessages.unshift({
      role: "system",
      content: systemContent,
    });

    console.log('🤖 Chat request received, messages:', groqMessages.length, 'RAG context:', !!ragContext);

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
