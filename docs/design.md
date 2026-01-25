# Digital Twin 

Author: digital-twin-team2  
Version: 1.0 (2026-01-25)  
Project: Digital Twin — Personal AI Agent (Single Persona MVP)

This document is an implementation-ready technical design for a "Personal AI Agent" (Single Persona MVP) built with Next.js (App Router), TypeScript, Vercel AI SDK, and Upstash Vector. It defines the RAG pipeline, Upstash vector schema, MCP (Model Context Protocol) tools, frontend component architecture, and the API contract required for Week 2 deliverables. This design deliberately uses a generic persona ("Subject") appropriate for a team project (no real individual's name or identifying personal data).

---

## 1. System Architecture Overview

Goal
- Provide a chat-based Personal AI that answers queries about the Subject's profile (resume, portfolio, publications, work history, notes) by retrieving relevant context from a vector DB and grounding LLM output with citations and provenance.

Core components
- Next.js App Router (frontend pages + server routes)
- Frontend client (React) using Vercel AI SDK `useChat`
- MCP Server: server-side orchestrator implemented inside Next.js server routes (e.g., `/app/api/mcp/execute`)
- Upstash Vector: vector database for embeddings + metadata
- LLM: accessed via the Vercel AI SDK (server-side for streaming & private keys)
- Ingestion worker: extracts text from uploads, chunks, creates embeddings, upserts to Upstash Vector

RAG pipeline flow (step-by-step)
1. User enters a question in the chat UI (e.g., "Which projects demonstrate mobile UX experience?").
2. Client posts to POST `/api/chat` with the user message and optionally session metadata.
3. `/api/chat` sanitizes input, enforces rate limits, and forwards to the MCP orchestrator.
4. MCP orchestrator calls the `query_personal_history` tool (server-side) which:
   - Generates an embedding for the query (server-side embedding model)
   - Queries Upstash Vector for top-K similar chunks
   - Returns hits with metadata and similarity scores
5. MCP builds a prompt containing:
   - Persona system prompt (team generic persona rules)
   - User message
   - Retrieved chunks serialized as explicit labeled sources (with id, title, url, excerpt)
6. MCP calls the LLM via Vercel AI SDK server-side with streaming enabled.
7. LLM streams back tokens; MCP post-processes to:
   - Append structured citations
   - Redact or mark private items if necessary
   - Optionally upsert ephemeral memory chunks if user consents
8. `/api/chat` streams the final output to the client. Client renders the response incrementally, displays citation cards, and persists conversation state locally and optionally server-side.

How Next.js App Router, Upstash Vector, and MCP Server interact
- Next.js App Router:
  - Exposes server routes under `/app/api/*` which implement MCP endpoints, vector wrappers, upload endpoints, and chat entrypoint.
  - Runs server-side code with access to secrets (Upstash and LLM keys).
- Upstash Vector:
  - Receives upserts from the ingestion pipeline and answers semantic search requests from MCP tools.
  - Only server-side code queries Upstash; client never directly accesses vector store.
- MCP Server:
  - Logical orchestrator implemented as server modules/route handlers.
  - Calls the Vector wrapper, prepares prompts, calls the Vercel AI SDK, and returns streamed responses with citations.

Security & privacy
- All secrets (UPSTASH_REST_URL/TOKEN, VERCEL_AI_KEY) are server-only env vars.
- Ingestion stage tags PII as `private: true` in metadata; MCP query tools default to `exclude_private=true`.
- Rate limit and auth middleware on `/api/*`.
- Audit logs for tool calls and vector upsert operations.

---

## 2. Data Model (Upstash Vector)

Design goals
- Store semantically searchable document chunks with rich metadata for provenance and filtering.
- Provide deterministic chunk IDs to enable precise citations.

Vector record schema (stored in Upstash)
- Each record stored as a vector entry with metadata and text chunk.

Example JSON schema
```json
{
  "id": "string",                   // "<sourceCategory>::<docId>::chunk-<n>"
  "vector": [0.0, 0.1, ...],        // embedding vector
  "text_chunk": "string",
  "metadata": {
    "doc_id": "string",             // original document id, e.g., "resume-v1"
    "source_category": "resume",    // resume | portfolio | blog | interview | note | social
    "title": "string",
    "date": "2025-06-01",           // ISO 8601
    "url": "https://...",
    "chunk_index": 3,
    "chunk_total": 7,
    "language": "en",
    "role_tags": ["ux","mobile","product-design"],
    "confidence": 0.0,
    "private": false
  }
}
```

Required metadata fields (for Personal AI context)
- id: unique chunk id (used in citations)
- text_chunk: chunk text used for prompt injection
- metadata.doc_id: provenance and versioning
- metadata.source_category: enables source filtering (resume/portfolio)
- metadata.date: recency and sorting
- metadata.url: link for citation card / document preview
- metadata.role_tags: semantic tags for quick filter queries
- metadata.private: boolean to gate sensitive content

TypeScript type
```ts
export type UpstashVectorRecord = {
  id: string;
  vector?: number[];
  text_chunk: string;
  metadata: {
    doc_id: string;
    source_category: 'resume' | 'portfolio' | 'blog' | 'interview' | 'note' | 'social';
    title?: string;
    date?: string;
    url?: string;
    chunk_index?: number;
    chunk_total?: number;
    language?: string;
    role_tags?: string[];
    confidence?: number;
    private?: boolean;
  };
}
```

Ingestion guidelines
- Chunk size: aim for 300–800 tokens.
- Chunk id pattern: `<source_category>::<doc_id>::chunk-<padded-index>`.
- Store `text_chunk` to avoid additional fetches.
- Tag PII/Private chunks with `private: true`. Default search excludes them.

Revision & retention
- New document versions: use new `doc_id` and keep history or mark old chunks deprecated via metadata.
- Deletion: remove by `id` when required by policy.

---

## 3. MCP (Model Context Protocol) Design

Purpose
- Provide a set of typed server-side tools used by the MCP orchestrator to fetch and prepare grounded context for the LLM.
- Keep tools small, deterministic, and auditable.

Tool design principles
- Tools return structured JSON.
- Tools accept filter args (source categories, role tags, date ranges).
- Tools sanitize returned text and exclude private content by default.

MCP Tools (with signatures)

1) query_personal_history
- Purpose: semantic search across all stored chunks.
- Args:
```ts
type QueryPersonalHistoryArgs = {
  query: string;
  topK?: number; // default 8
  source_categories?: ('resume'|'portfolio'|'blog'|'interview'|'note'|'social')[];
  role_tags?: string[];
  date_from?: string; // ISO
  date_to?: string;   // ISO
  exclude_private?: boolean; // default true
}
```
- Return:
```ts
type QueryPersonalHistoryResult = {
  hits: Array<{
    id: string;
    score: number;
    text_chunk: string;
    metadata: UpstashVectorRecord['metadata'];
  }>;
}
```

2) get_document_by_id
- Purpose: fetch all chunks of a document (used for "show resume" or "show project details").
- Args:
```ts
type GetDocumentByIdArgs = { doc_id: string; }
```
- Return:
```ts
type GetDocumentByIdResult = { doc_id: string; title?: string; chunks: { id: string; text_chunk: string; chunk_index?: number }[] }
```

3) list_portfolio_projects
- Purpose: return project-level metadata (summary listing).
- Args:
```ts
type ListPortfolioProjectsArgs = { top?: number; role_tags?: string[]; date_from?: string; date_to?: string; }
```
- Return:
```ts
type ListPortfolioProjectsResult = { projects: Array<{ doc_id: string; title?: string; url?: string; date?: string; role_tags?: string[]; short_summary?: string }> }
```

4) fetch_recent_activities
- Purpose: return recent documents/entries ordered by date.
- Args:
```ts
type FetchRecentActivitiesArgs = { limit?: number; since?: string; }
```
- Return:
```ts
type FetchRecentActivitiesResult = { activities: Array<{ doc_id: string; title?: string; date?: string; category?: string; summary?: string; url?: string }> }
```

5) upsert_memory_chunk
- Purpose: upsert ephemeral memory (session-specific) to vector store (only if user consents).
- Args:
```ts
type UpsertMemoryArgs = { session_id: string; text: string; metadata?: Partial<UpstashVectorRecord['metadata']>; }
```
- Return:
```ts
type UpsertMemoryResult = { ok: boolean; id?: string; error?: string; }
```

Tool behavior & MCP orchestration patterns
- Default retrieval-first approach:
  - For open queries, call `query_personal_history(q, topK=6)`, include top 3–4 chunks in the prompt.
- For document-specific requests, call `get_document_by_id`.
- For listing projects, call `list_portfolio_projects` first.
- All tool outputs are included in LLM prompt as labeled sources (e.g., === SOURCE 1 === ...).
- LLM must reference sources in parentheses after factual claims: `(Source: resume-v1::chunk-03)`.

Prompting rules
- System persona instructs the LLM to avoid hallucination.
- If the answer cannot be derived from provided sources, LLM should say: "I don't have that information in the available documents."
- Opinion statements must be labeled "Opinion:" and separated from facts.

---

## 4. Component Architecture (Frontend)

Overview
- Minimal, focused chat UI with streaming responses, quick actions, upload flow, and citation previews.
- Built on React with Next.js App Router and Vercel AI SDK.

Key components
- ChatInterface (page)
  - Initializes `useChat`, session lifecycle, and routes quick actions to `/api/chat`.
- SystemPersonaHeader
  - Shows persona avatar, summary, and quick actions (Show Resume, List Projects).
- ChatWindow
  - Manages message list rendering, scroll behavior, and date grouping.
- MessageBubble
  - Props: { role, content, citations?: Citation[] }
  - Renders streaming content and citation anchors.
- InputArea
  - Text input, send button, quick prompt buttons, optional file attach.
- AttachmentUploader
  - Handles file upload to `/api/upload`, shows ingestion status.
- SourceCard
  - Shows title, excerpt, url, source_category, and score. Clicking opens DocPreview.
- DocPreviewModal
  - Displays full chunks for a doc_id and allows "ask about this" actions.
- SettingsPanel
  - Controls persona tone, memory opt-in, data export.

State management with Vercel AI SDK `useChat`
- Use `useChat` to handle message list, streaming, and append/update helpers.
- Typical flow:
  1. User submits; call `append({ role: 'user', content: text })`.
  2. Send POST `/api/chat` (server streams LLM).
  3. While streaming, `update` assistant message tokens in `useChat`.
  4. When stream ends, show citations via SourceCard components.
- Conversation window size:
  - Keep last N messages client-side (e.g., 12).
  - Server uses last M messages (e.g., 8) when building LLM context to control token usage.

UX considerations
- Show streaming tokens (optimistic) with accessible ARIA live region.
- Provide explicit "Regenerate" and "Cite Sources" actions.
- Allow user to restrict searches to specific source_categories via UI toggles.

---

## 5. API Routes

All routes implemented as Next.js App Router server route handlers (app/api/*/route.ts). Server-only env vars must be used for keys.

Environment variables
- UPSTASH_REST_URL
- UPSTASH_REST_TOKEN
- VERCEL_AI_API_KEY (or provider-specific key)
- NEXT_PUBLIC_PERSONA_LABEL = "Digital Twin — Subject"
- MCP_MAX_RETRIEVALS = 8

MVP API endpoints

1) POST /api/chat
- Purpose: main chat entrypoint. Orchestrates MCP tools and LLM call; supports streaming.
- Request body:
```ts
type ChatRequest = {
  sessionId?: string;
  message: string;
  systemAction?: 'show_resume' | 'list_projects' | 'show_portfolio' | null;
  topK?: number;
}
```
- Response:
  - Streaming content (SSE or fetch stream) and final JSON envelope:
```ts
type ChatResponse = {
  assistant_text: string;
  citations: Array<{ id: string; source_category: string; title?: string; url?: string; score?: number }>;
  status: 'ok' | 'error';
}
```
- Behavior:
  - If `systemAction` provided, map to specific MCP tool.
  - Else: call `query_personal_history` and include retrieved chunks in prompt.
  - Call Vercel AI SDK on server with streaming; stream tokens to client.

2) POST /api/mcp/execute
- Purpose: internal MCP tool executor (server-only). Accepts tool name & args, returns typed result.
- Request body:
```ts
type MCPExecuteRequest = {
  tool: 'query_personal_history' | 'get_document_by_id' | 'list_portfolio_projects' | 'fetch_recent_activities' | 'upsert_memory_chunk';
  args: any;
}
```
- Response: tool-specific JSON.

3) POST /api/vector/search
- Purpose: wrapper to Upstash Vector for semantic search.
- Request body:
```ts
type VectorSearchRequest = {
  query_embedding?: number[];
  query_text?: string;
  topK?: number;
  filter?: { source_categories?: string[]; role_tags?: string[]; date_from?: string; date_to?: string; exclude_private?: boolean };
}
```
- Response:
```ts
type VectorSearchResponse = {
  results: Array<{ id: string; score: number; text_chunk: string; metadata: UpstashVectorRecord['metadata'] }>;
}
```
- Implementation:
  - If `query_text` is present, compute embedding server-side before calling Upstash Vector.

4) POST /api/vector/upsert
- Purpose: ingest or update vector records (used by ingestion worker).
- Request body:
```ts
type VectorUpsertRequest = { records: UpstashVectorRecord[]; overwrite?: boolean; }
```
- Response:
```ts
type VectorUpsertResponse = { upserted: number; errors?: Array<{ id: string; message: string }> }
```
- Auth: only authenticated ingestion job or uploader.

5) POST /api/upload
- Purpose: file upload endpoint initiating ingestion (PDFs, markdown, portfolio links).
- Request (multipart/form-data): { file, source_category: 'resume'|'portfolio'|'blog', doc_id?: string }
- Response: { jobId: string; status: 'queued' }
- Behavior:
  - Store file to storage (Vercel, S3).
  - Trigger ingestion worker that extracts text, splits, computes embeddings, and calls `/api/vector/upsert`.

6) GET /api/metadata/:id
- Purpose: fetch metadata and full chunk content for a citation preview.
- Response:
```ts
type MetadataResponse = { id: string; text_chunk: string; metadata: UpstashVectorRecord['metadata']; status: 'ok' | 'error' }
```

7) POST /api/session/save
- Purpose: persist conversation snippet & user preferences server-side.
- Request:
```ts
type SaveSessionRequest = { sessionId: string; messages: Array<{ role: string; content: string }>; memoryAllowed?: boolean; }
```
- Response: { ok: true; url?: string }

API contract notes
- Consistent envelope: `{ status: 'ok'|'error', data?: any, error?: string }`.
- All server routes perform auth & rate limiting checks.

---

## 6. Prompting & Persona Rules

Persona identity
- Persona: "Digital Twin — Subject" (generic single-persona).
- System prompt must instruct the LLM to ground answers in provided sources and to include inline parenthetical citations for factual claims.

Prompting guidelines
- Include top N retrieved chunks (N=3 by default) as explicitly labeled sources in the prompt:
  - === SOURCE 1 ===
  - id: resume-v1::chunk-03
  - title: "Senior Product Designer — Mobile Checkout"
  - url: https://...
  - text: "..."
  - === END SOURCE 1 ===
- After any factual sentence include citation: `(Source: resume-v1::chunk-03)`.
- If information is missing, respond: "I don't have that in the available documents."
- Opinion/Recommendation must be clearly labeled "Opinion:" and separated from facts.

Example reduced system prompt (server-side)
> "You are the Digital Twin for the Subject. Use only the supplied sources. Cite each factual statement with the source id in parentheses. If unsure, say you don't know and offer follow-up actions. Keep answers concise and helpful."

---

## 7. Operational & Infrastructure Notes

Deployment
- Deploy to Vercel (App Router) for serverless deployments; use Vercel AI SDK for LLM calls.
- Ingestion workers can run as serverless functions or an external worker (depending on file extraction needs).

Secrets & env
- Store secrets in Vercel environment variables:
  - UPSTASH_REST_URL, UPSTASH_REST_TOKEN
  - VERCEL_AI_API_KEY
  - OPTIONAL: EMBEDDING_API_KEY (if separate)

Cost & rate control
- Enforce `MCP_MAX_RETRIEVALS` and `topK` caps.
- Limit streaming token budget and total prompt tokens per request.

Observability
- Log:
  - vector search latency and returned topK
  - LLM call latency and token usage (redact content in logs)
  - ingestion successes/failures
- Expose metrics via simple Prometheus-compatible endpoints or platform logs.

Testing
- Unit tests for MCP tools (input/output contracts).
- E2E test: upload document -> ingest -> query -> expect citation id returned.

---

## 8. Example Types & Server Flow

TypeScript helper types
```ts
export type ChatRequest = { sessionId?: string; message: string; systemAction?: string | null; topK?: number; }
export type Citation = { id: string; title?: string; url?: string; source_category?: string; score?: number; excerpt?: string; }
export type ChatResult = { assistant_text: string; citations: Citation[]; }
```

Pseudo server flow (POST /api/chat)
```ts
// parse request
const { message, systemAction, topK } = await req.json();
if (systemAction === 'show_resume') {
  const doc = await mcp.execute('get_document_by_id', { doc_id: 'resume-v1' });
  const prompt = buildPromptWithDocument(doc);
  await streamLLM(prompt, res);
  return;
}
// normal flow
const retrieval = await mcp.execute('query_personal_history', { query: message, topK: topK ?? 6, exclude_private: true });
const prompt = buildPrompt({ systemPersona, userMessage: message, sources: retrieval.hits.slice(0, 4) });
const stream = await vercelAi.chat.stream({ messages: prompt });
streamToResponse(stream, res, { citations: retrieval.hits.map(h => toCitation(h)) });
```

---

## 9. Acceptance Criteria (Week 2 checklist)

- [ ] POST /api/chat implemented and streams LLM responses to the client.
- [ ] MCP tool `query_personal_history` implemented and verified against Upstash Vector.
- [ ] Vector ingestion endpoint and ingestion worker to upsert chunks to Upstash Vector.
- [ ] Frontend ChatInterface using `useChat` that streams and renders LLM responses.
- [ ] Citation UI (SourceCard) links to `/api/metadata/:id`.
- [ ] Persona system prompt enforced server-side to avoid hallucinations.
- [ ] Unit tests for MCP tool contracts and integration test for vector search.

---

## 10. Appendix

A — Example Upstash record
```json
{
  "id": "portfolio::project-42::chunk-01",
  "text_chunk": "Designed and shipped a mobile-first checkout experience which improved conversion by 11%.",
  "metadata": {
    "doc_id": "project-42",
    "source_category": "portfolio",
    "title": "Mobile Checkout Redesign",
    "date": "2025-09-14",
    "url": "https://team-portfolio.example/projects/project-42",
    "chunk_index": 1,
    "chunk_total": 4,
    "role_tags": ["mobile","ux","product-design"],
    "private": false
  }
}
```

B — Helpful links (implementers)
- Upstash Vector docs — use server REST or SDK.
- Vercel AI SDK — server streaming & client `useChat`.
- Next.js App Router — server route handlers (app/api/*/route.ts).

---
