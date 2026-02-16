
---

# Digital Twin — Technical Design Document

| Key | Value |
| --- | --- |
| **Author** | digital-twin-team2 |
| **Version** | **2.0 (2026-02-03)** |
| **Project** | Digital Twin — Career Intelligence Engine |
| **Tech Stack** | Next.js 16, TypeScript, **Neon Postgres**, MCP, Vercel AI SDK |

---

## 1. System Architecture Overview

### Goal

Create an active "Career Intelligence Engine" (AI Agent) that represents the Subject professionally.
Instead of using static vector search (RAG), the system relies on **System Prompts** for knowledge definition and **MCP (Model Context Protocol)** to interact with the **Neon Postgres** database for persisting conversations and capturing leads.

### Core Components

* **Next.js App Router:** Frontend pages and server routes.
* **Database (Neon Postgres):** The single source of truth for chat history and lead data (Replaces Upstash Vector).
* **MCP Server:** Server-side orchestrator connecting the LLM to the database.
* **LLM Inference:** Groq API via Vercel AI SDK (Ultra-low latency).
* **Voice Module:** Handles STT (Speech-to-Text) and TTS (Text-to-Speech).

### Interaction Flow

1. **User Input:** User speaks or types a message.
2. **Context Loading:** MCP fetches the recent conversation history from Neon Postgres.
3. **Inference:** The LLM generates a response based on the **System Prompt** (defined in `agents.md`) and the retrieved context.
4. **Action:**
* If the user shares contact info, the agent calls the `save_lead` tool.
* The conversation is asynchronously saved to `ChatLog` in Postgres.


5. **Response:** The AI responds via text and voice.

---

## 2. Data Model (Neon Postgres / Prisma)

**Change:** Replaced Vector Embeddings with Relational Tables.

### Design Goals

* **Persistence:** Store every interaction to maintain context.
* **Lead Capture:** Structured storage for recruiter information.

### Prisma Schema

#### 1. `ChatLog` (Conversation History)

Stores messages to provide "memory" to the agent.

```prisma
model ChatLog {
  id        String   @id @default(cuid())
  sessionId String
  role      String   // 'user' | 'assistant'
  content   String
  createdAt DateTime @default(now())
  
  @@index([sessionId])
}

```

#### 2. `Lead` (Recruiter/Contact Info)

Stores captured opportunities.

```prisma
model Lead {
  id        String   @id @default(cuid())
  email     String
  name      String?
  company   String?
  source    String   @default("chat")
  createdAt DateTime @default(now())
}

```

---

## 3. MCP (Model Context Protocol) Tools

**Change:** Removed RAG search tools; added Database action tools.

### Tool Definitions

#### `save_lead`

* **Purpose:** Save user contact details to the database when they express interest.
* **Arguments:**
```typescript
{
  name: string;
  email: string;
  company?: string;
}

```


* **Action:** Executes `prisma.lead.create()`.

#### `get_recent_history`

* **Purpose:** Retrieve the last N messages for the current session to maintain conversation flow.
* **Arguments:** `{ sessionId: string }`
* **Action:** Executes `prisma.chatLog.findMany()`.

---

## 4. Component Architecture (Frontend)

### Key Components

* **`ChatInterface`:** Main container using `useChat` hook.
* **`VoiceControl` (New):**
* Uses Web Speech API for input.
* Uses Vercel AI SDK for output.


* **`LeadCaptureForm`:** UI component that appears when the agent triggers `save_lead` (optional confirmation).
* **`MessageBubble`:** Renders text and handles Markdown parsing.

---

## 5. API Routes

### `POST /api/chat`

* **Purpose:** Main chat entry point.
* **Logic:**
1. Check for `save_lead` tool calls from the previous turn.
2. Fetch recent chat logs from Prisma.
3. Call Groq API with the System Prompt + Database Context.
4. Stream response to client.
5. (Async) Save new user/assistant messages to `ChatLog`.



### `POST /api/leads` (Admin)

* **Purpose:** Allow the site owner to view captured leads.
* **Auth:** Protected by simple API Key or password.

---

## 6. Prompting & Persona Rules

### Persona Identity

* **Source of Truth:** `agents.md`
* **Mechanism:** The entire professional profile is embedded in the **System Prompt**.

### Guidelines

* **No Hallucination:** "If the information is not in your system instructions, say you don't know."
* **Goal Oriented:** "Always try to guide the conversation towards saving a lead (getting their email)."

---

##  7. Example Server Flow 

This section demonstrates how to implement the "Agent" logic using Vercel AI SDK and Prisma.

### TypeScript Helper Types

```typescript
export type ChatRequest = {
  sessionId?: string;
  message: string;
}

export type ChatResponse = {
  id: string;
  role: 'assistant';
  content: string;
}

```

### Pseudo Server Flow (`POST /api/chat`)

Instead of RAG, we inject the `save_lead` tool and persist logs asynchronously.

```typescript
// app/api/chat/route.ts
import { prisma } from "@/lib/prisma";
import { groq } from "@/lib/groq"; // Your Groq client wrapper
import { streamText, tool } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  const { message, sessionId } = await req.json();

  // 1. Fetch recent conversation history from Neon Postgres (Context)
  // We fetch the last 10 messages to maintain conversation flow.
  const history = await prisma.chatLog.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    take: 10
  });

  // 2. Define System Prompt (The Persona)
  // In production, load this from agents.md or an env var.
  const systemPrompt = `
    You are the Digital Twin of [Your Name].
    Your goal is to answer professional questions and capture leads.
    If the user seems interested in hiring, ask for their email and use the save_lead tool.
  `;

  // 3. Call Groq API via Vercel AI SDK with Tools
  const result = await streamText({
    model: groq('llama-3.1-70b-versatile'),
    system: systemPrompt,
    messages: [
      ...history.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
      { role: 'user', content: message }
    ],
    tools: {
      // MCP Tool: Lead Capture
      save_lead: tool({
        description: "Save a recruiter's contact info (Name, Email, Company)",
        parameters: z.object({
          name: z.string().describe("The user's name"),
          email: z.string().email().describe("The user's email address"),
          company: z.string().optional().describe("The user's company")
        }),
        execute: async ({ name, email, company }) => {
          // Action: Write to Neon Postgres
          await prisma.lead.create({
            data: { name, email, company, source: 'chat' }
          });
          return "Contact information saved successfully!";
        }
      })
    },
    // 4. Persistence: Save the chat logs after the response is generated
    onFinish: async ({ text, toolCalls }) => {
      // Save User Message
      await prisma.chatLog.create({
        data: { sessionId, role: 'user', content: message }
      });
      
      // Save Assistant Response
      if (text) {
        await prisma.chatLog.create({
          data: { sessionId, role: 'assistant', content: text }
        });
      }
    }
  });

  // 5. Stream the response (text + tool execution results) to the client
  return result.toDataStreamResponse();
}

```

---

## 8. Appendix

### A — Example Database Record (Prisma)

**ChatLog Table (Maintains Context):**

```json
{
  "id": "cl_123456789",
  "sessionId": "sess_abc123",
  "role": "assistant",
  "content": "I specialize in Next.js and AI Agents. Would you like to schedule a meeting?",
  "createdAt": "2026-02-03T10:00:00Z"
}

```

**Lead Table (Captured Opportunity):**

```json
{
  "id": "lead_987654321",
  "name": "Jane Doe",
  "email": "jane@hiring.com",
  "company": "Tech Corp",
  "source": "chat",
  "createdAt": "2026-02-03T10:05:00Z"
}

```

### B — Helpful Links (Implementers)

* **Neon Postgres:** [Console & Connection Strings](https://console.neon.tech)
* **Prisma:** [Postgres Connector Docs](https://www.prisma.io/docs/orm/overview/databases/postgresql)
* **Vercel AI SDK:** [Tool Calling (MCP) Guide](https://www.google.com/search?q=https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-function-calling)
* **Web Speech API:** [Browser Support for Voice](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---


