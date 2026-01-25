# Implementation Plan: Digital Twin Personal AI Agent

**Project:** Digital Twin — Personal AI Agent (Single Persona MVP)  
**Team:** digital-twin-team2  
**Version:** 1.0  
**Date:** 2026-01-26  
**Based on:** docs/design.md v1.0

---

## Executive Summary

This implementation plan provides a phased, task-level breakdown for building the Digital Twin Personal AI Agent MVP. The plan sequences work across **4 phases** over an estimated **6-8 week timeline**, with clear dependencies, resource assignments, and success criteria for each task.

**Key Success Metrics:**
- Functional RAG pipeline retrieving relevant context from Upstash Vector
- Streaming chat interface with citation support
- Document ingestion workflow processing resume/portfolio content
- 95%+ uptime for core API endpoints
- <2s response time for chat queries

---

## Phase 1: Foundation & Infrastructure (Week 1-2)

**Goal:** Establish core infrastructure, development environment, and data storage layer.

### 1.1 Project Initialization & Environment Setup
**Owner:** Full Team  
**Duration:** 2-3 days  
**Dependencies:** None

**Tasks:**
- [ ] Initialize Next.js 14+ project with App Router and TypeScript
- [ ] Configure ESLint, Prettier, and TypeScript strict mode
- [ ] Set up Git repository structure (`/app`, `/docs`, `/lib`, `/types`)
- [ ] Create `.env.local.example` with required environment variables
- [ ] Configure Vercel project and connect to GitHub repository
- [ ] Set up GitHub Actions for basic CI (linting, type checking)

**Environment Variables to Configure:**
```bash
UPSTASH_REST_URL=
UPSTASH_REST_TOKEN=
VERCEL_AI_API_KEY=
NEXT_PUBLIC_PERSONA_LABEL="Digital Twin — Subject"
MCP_MAX_RETRIEVALS=8
```

**Success Criteria:**
- ✅ `npm run dev` runs without errors
- ✅ TypeScript compilation passes
- ✅ All team members can run project locally

---

### 1.2 TypeScript Type Definitions
**Owner:** Backend Developer  
**Duration:** 1 day  
**Dependencies:** 1.1

**Tasks:**
- [ ] Create `/types/vector.ts` with `UpstashVectorRecord` type
- [ ] Create `/types/mcp.ts` with all MCP tool argument/result types
- [ ] Create `/types/api.ts` with API request/response types
- [ ] Create `/types/chat.ts` with chat and citation types
- [ ] Export all types from `/types/index.ts`

**Key Types to Implement:**
```typescript
// From design.md section 2 & 8
- UpstashVectorRecord
- QueryPersonalHistoryArgs/Result
- GetDocumentByIdArgs/Result
- ChatRequest/Response
- Citation
```

**Success Criteria:**
- ✅ All types documented with JSDoc comments
- ✅ No TypeScript errors in type files
- ✅ Types imported successfully in test files

---

### 1.3 Upstash Vector Integration
**Owner:** Backend Developer  
**Duration:** 2-3 days  
**Dependencies:** 1.2

**Tasks:**
- [ ] Install `@upstash/vector` SDK
- [ ] Create `/lib/vector/client.ts` - Upstash Vector client wrapper
- [ ] Implement `searchVectors()` function with metadata filtering
- [ ] Implement `upsertVectors()` function with batch support
- [ ] Implement `getVectorById()` function
- [ ] Implement `deleteVectors()` function
- [ ] Add error handling and retry logic
- [ ] Write unit tests for vector client wrapper

**Implementation Notes:**
- Use server-side SDK only (never expose to client)
- Implement metadata filtering for `source_category`, `role_tags`, `date_from/to`, `exclude_private`
- Log all vector operations for debugging

**Success Criteria:**
- ✅ Can upsert test vectors to Upstash
- ✅ Can query vectors with filters
- ✅ Unit tests pass (>80% coverage)

---

### 1.4 Embedding Service Setup
**Owner:** Backend Developer  
**Duration:** 1-2 days  
**Dependencies:** 1.2

**Tasks:**
- [ ] Research and select embedding model (OpenAI `text-embedding-3-small` or similar)
- [ ] Create `/lib/embeddings/service.ts`
- [ ] Implement `generateEmbedding(text: string): Promise<number[]>`
- [ ] Implement `generateBatchEmbeddings(texts: string[]): Promise<number[][]>`
- [ ] Add caching layer for identical queries (optional)
- [ ] Add rate limiting and error handling
- [ ] Write unit tests with mock API responses

**Success Criteria:**
- ✅ Can generate embeddings for sample text
- ✅ Embeddings are correct dimensionality (1536 for OpenAI)
- ✅ Batch processing works for >10 texts

---

## Phase 2: MCP Tools & RAG Pipeline (Week 3-4)

**Goal:** Implement Model Context Protocol tools and core retrieval logic.

### 2.1 MCP Tool: query_personal_history
**Owner:** Backend Developer  
**Duration:** 3 days  
**Dependencies:** 1.3, 1.4

**Tasks:**
- [ ] Create `/lib/mcp/tools/query-personal-history.ts`
- [ ] Implement argument validation using Zod
- [ ] Generate embedding for query text
- [ ] Call Upstash Vector search with filters
- [ ] Map results to `QueryPersonalHistoryResult` format
- [ ] Add logging for retrieved chunks and scores
- [ ] Write integration tests with actual vector data
- [ ] Document usage examples

**Implementation Details:**
```typescript
// Pseudo-code flow:
1. Validate args (query, topK, filters)
2. embedding = await generateEmbedding(query)
3. results = await searchVectors(embedding, topK, filters)
4. return formatted results with scores
```

**Success Criteria:**
- ✅ Returns relevant chunks for test queries
- ✅ Respects `topK` and filter parameters
- ✅ Integration test passes with sample data

---

### 2.2 MCP Tool: get_document_by_id
**Owner:** Backend Developer  
**Duration:** 1 day  
**Dependencies:** 1.3

**Tasks:**
- [ ] Create `/lib/mcp/tools/get-document-by-id.ts`
- [ ] Query Upstash for all chunks matching `metadata.doc_id`
- [ ] Sort chunks by `chunk_index`
- [ ] Assemble full document text
- [ ] Return with metadata
- [ ] Write unit tests

**Success Criteria:**
- ✅ Returns all chunks for a valid `doc_id`
- ✅ Chunks ordered correctly
- ✅ Handles missing documents gracefully

---

### 2.3 MCP Tool: list_portfolio_projects
**Owner:** Backend Developer  
**Duration:** 2 days  
**Dependencies:** 1.3

**Tasks:**
- [ ] Create `/lib/mcp/tools/list-portfolio-projects.ts`
- [ ] Query Upstash filtering by `source_category: 'portfolio'`
- [ ] Group results by `doc_id`
- [ ] Extract project metadata (title, url, date, tags)
- [ ] Sort by date (most recent first)
- [ ] Return summary list
- [ ] Write unit tests

**Success Criteria:**
- ✅ Returns distinct projects (not individual chunks)
- ✅ Respects filter parameters
- ✅ Sorted correctly by date

---

### 2.4 MCP Tool: fetch_recent_activities
**Owner:** Backend Developer  
**Duration:** 1 day  
**Dependencies:** 1.3

**Tasks:**
- [ ] Create `/lib/mcp/tools/fetch-recent-activities.ts`
- [ ] Query Upstash with date filter
- [ ] Group by `doc_id` across all categories
- [ ] Sort by date descending
- [ ] Return top N activities
- [ ] Write unit tests

**Success Criteria:**
- ✅ Returns recent documents across categories
- ✅ Limit parameter works correctly

---

### 2.5 MCP Orchestrator
**Owner:** Backend Developer  
**Duration:** 2 days  
**Dependencies:** 2.1, 2.2, 2.3, 2.4

**Tasks:**
- [ ] Create `/lib/mcp/orchestrator.ts`
- [ ] Implement `execute(toolName, args)` dispatcher
- [ ] Add tool registry mapping
- [ ] Add audit logging for all tool calls
- [ ] Implement error handling and retries
- [ ] Write integration tests for all tools

**Success Criteria:**
- ✅ Can execute any MCP tool by name
- ✅ Logs all tool executions
- ✅ Returns typed results

---

## Phase 3: API Routes & LLM Integration (Week 4-5)

**Goal:** Build API endpoints and integrate LLM with RAG context.

### 3.1 POST /api/vector/search
**Owner:** Backend Developer  
**Duration:** 1 day  
**Dependencies:** 1.3, 1.4

**Tasks:**
- [ ] Create `/app/api/vector/search/route.ts`
- [ ] Implement request validation
- [ ] Handle both `query_text` and `query_embedding` inputs
- [ ] Call vector client search function
- [ ] Return formatted results
- [ ] Add rate limiting middleware
- [ ] Write API tests

**Success Criteria:**
- ✅ Returns search results for valid queries
- ✅ Rate limiting works (e.g., 100 req/min)
- ✅ API tests pass

---

### 3.2 POST /api/vector/upsert
**Owner:** Backend Developer  
**Duration:** 1 day  
**Dependencies:** 1.3

**Tasks:**
- [ ] Create `/app/api/vector/upsert/route.ts`
- [ ] Implement authentication check (API key or internal secret)
- [ ] Validate `UpstashVectorRecord[]` format
- [ ] Call vector client upsert function
- [ ] Return success/error counts
- [ ] Add audit logging
- [ ] Write API tests

**Success Criteria:**
- ✅ Can upsert vectors via API
- ✅ Auth blocks unauthorized requests
- ✅ Batch upserts work efficiently

---

### 3.3 Vercel AI SDK Integration
**Owner:** Backend Developer  
**Duration:** 2 days  
**Dependencies:** None (parallel to 3.1-3.2)

**Tasks:**
- [ ] Install `ai` SDK from Vercel
- [ ] Create `/lib/ai/client.ts` - LLM client wrapper
- [ ] Implement `streamChat()` function with streaming support
- [ ] Configure system prompt template
- [ ] Add token counting and budget enforcement
- [ ] Test streaming responses
- [ ] Write unit tests with mock responses

**Success Criteria:**
- ✅ Can stream LLM responses
- ✅ System prompt enforces citation format
- ✅ Token limits enforced

---

### 3.4 Prompt Builder Utility
**Owner:** Backend Developer  
**Duration:** 1-2 days  
**Dependencies:** 3.3

**Tasks:**
- [ ] Create `/lib/prompts/builder.ts`
- [ ] Implement `buildPromptWithSources()` function
- [ ] Format retrieved chunks as labeled sources
- [ ] Include citation instructions in system prompt
- [ ] Add conversation history handling (last M messages)
- [ ] Test with various source combinations
- [ ] Document prompt format

**Prompt Structure:**
```
System: [Persona rules + Citation instructions]

=== SOURCE 1 ===
id: resume-v1::chunk-03
title: ...
text: ...
=== END SOURCE 1 ===

[... more sources ...]

User: [question]
```

**Success Criteria:**
- ✅ Sources formatted correctly
- ✅ Prompt stays under token budget
- ✅ Citation format clear to LLM

---

### 3.5 POST /api/chat (Main Endpoint)
**Owner:** Backend + Frontend Developer  
**Duration:** 3-4 days  
**Dependencies:** 2.5, 3.3, 3.4

**Tasks:**
- [ ] Create `/app/api/chat/route.ts`
- [ ] Parse and validate `ChatRequest`
- [ ] Implement `systemAction` routing logic
- [ ] Call MCP orchestrator for context retrieval
- [ ] Build prompt with retrieved sources
- [ ] Call Vercel AI SDK to stream LLM response
- [ ] Parse LLM output for citations
- [ ] Stream response to client with proper headers
- [ ] Add error handling and fallbacks
- [ ] Write E2E tests

**Implementation Flow:**
```typescript
1. Parse request (message, systemAction, topK)
2. If systemAction: route to specific MCP tool
3. Else: call query_personal_history
4. Build prompt with top N sources
5. Stream LLM response
6. Extract citations from response
7. Send streaming response + citations envelope
```

**Success Criteria:**
- ✅ Streams responses to client
- ✅ Citations included in response
- ✅ System actions work (show_resume, etc.)
- ✅ E2E test passes

---

### 3.6 POST /api/mcp/execute (Internal)
**Owner:** Backend Developer  
**Duration:** 1 day  
**Dependencies:** 2.5

**Tasks:**
- [ ] Create `/app/api/mcp/execute/route.ts`
- [ ] Add internal auth check (server-only)
- [ ] Route to MCP orchestrator
- [ ] Return JSON results
- [ ] Add logging
- [ ] Write tests

**Success Criteria:**
- ✅ Only accessible server-side
- ✅ All MCP tools callable via API

---

### 3.7 GET /api/metadata/:id
**Owner:** Backend Developer  
**Duration:** 1 day  
**Dependencies:** 1.3

**Tasks:**
- [ ] Create `/app/api/metadata/[id]/route.ts`
- [ ] Fetch vector record by ID
- [ ] Return metadata + text_chunk
- [ ] Handle not found errors
- [ ] Write tests

**Success Criteria:**
- ✅ Returns citation details for valid IDs
- ✅ 404 for missing IDs

---

## Phase 4: Frontend & Ingestion (Week 5-6)

**Goal:** Build chat UI and document ingestion pipeline.

### 4.1 ChatInterface Component
**Owner:** Frontend Developer  
**Duration:** 3 days  
**Dependencies:** 3.5

**Tasks:**
- [ ] Create `/app/page.tsx` - main chat page
- [ ] Install and configure Vercel AI SDK `useChat` hook
- [ ] Implement message rendering with streaming
- [ ] Add loading states and error handling
- [ ] Add session ID management
- [ ] Style with Tailwind CSS
- [ ] Test streaming behavior

**Success Criteria:**
- ✅ Messages stream in real-time
- ✅ Chat history persists during session
- ✅ Loading/error states display correctly

---

### 4.2 MessageBubble & Citation Components
**Owner:** Frontend Developer  
**Duration:** 2 days  
**Dependencies:** 4.1

**Tasks:**
- [ ] Create `/components/MessageBubble.tsx`
- [ ] Create `/components/SourceCard.tsx`
- [ ] Parse citation markers in message text
- [ ] Render citation links inline
- [ ] Display source cards at message end
- [ ] Add hover/click interactions
- [ ] Style for mobile responsiveness

**Success Criteria:**
- ✅ Citations displayed with source metadata
- ✅ Click opens citation preview modal
- ✅ Works on mobile devices

---

### 4.3 InputArea & Quick Actions
**Owner:** Frontend Developer  
**Duration:** 2 days  
**Dependencies:** 4.1

**Tasks:**
- [ ] Create `/components/InputArea.tsx`
- [ ] Implement text input with auto-resize
- [ ] Add send button with keyboard shortcut (Cmd+Enter)
- [ ] Add quick action buttons (Show Resume, List Projects)
- [ ] Map quick actions to `systemAction` API parameter
- [ ] Add character limit indicator
- [ ] Style for accessibility

**Success Criteria:**
- ✅ Input submits on Enter
- ✅ Quick actions trigger correct API calls
- ✅ Accessible via keyboard navigation

---

### 4.4 Document Preview Modal
**Owner:** Frontend Developer  
**Duration:** 2 days  
**Dependencies:** 4.2, 3.7

**Tasks:**
- [ ] Create `/components/DocPreviewModal.tsx`
- [ ] Fetch full document via `GET /api/metadata/:id`
- [ ] Display document chunks in order
- [ ] Add "Ask about this" button
- [ ] Implement close/escape key handling
- [ ] Style modal with animations

**Success Criteria:**
- ✅ Modal opens when citation clicked
- ✅ Displays full document content
- ✅ "Ask about this" populates input

---

### 4.5 Document Ingestion Pipeline
**Owner:** Backend Developer  
**Duration:** 4-5 days  
**Dependencies:** 1.3, 1.4

**Tasks:**
- [ ] Create `/lib/ingestion/pipeline.ts`
- [ ] Implement text extraction (PDF, Markdown, TXT)
- [ ] Implement chunking algorithm (300-800 tokens, recursive)
- [ ] Generate chunk IDs (`<category>::<doc_id>::chunk-<n>`)
- [ ] Generate embeddings for all chunks
- [ ] Build `UpstashVectorRecord` objects
- [ ] Upsert to Upstash Vector in batches
- [ ] Add error handling and retry logic
- [ ] Write integration tests

**Chunking Strategy:**
- Recursive text splitter with overlap (50-100 tokens)
- Preserve paragraph boundaries
- Max chunk size: 800 tokens
- Min chunk size: 100 tokens

**Success Criteria:**
- ✅ Can process PDF resume
- ✅ Chunks stored in Upstash Vector
- ✅ Chunks retrievable via search

---

### 4.6 POST /api/upload
**Owner:** Backend Developer  
**Duration:** 2 days  
**Dependencies:** 4.5

**Tasks:**
- [ ] Create `/app/api/upload/route.ts`
- [ ] Handle multipart form data
- [ ] Validate file types (PDF, MD, TXT)
- [ ] Save file to temporary storage
- [ ] Trigger ingestion pipeline (async)
- [ ] Return job ID and status
- [ ] Add file size limits
- [ ] Write tests

**Success Criteria:**
- ✅ Accepts file uploads
- ✅ Triggers ingestion successfully
- ✅ Returns job status

---

### 4.7 Upload UI Component
**Owner:** Frontend Developer  
**Duration:** 2 days  
**Dependencies:** 4.6

**Tasks:**
- [ ] Create `/components/AttachmentUploader.tsx`
- [ ] Implement drag-and-drop file upload
- [ ] Show upload progress
- [ ] Display ingestion status (polling or webhook)
- [ ] Add file type validation
- [ ] Style upload area

**Success Criteria:**
- ✅ Can upload resume PDF
- ✅ Shows upload progress
- ✅ Displays success/error states

---

### 4.8 Settings Panel
**Owner:** Frontend Developer  
**Duration:** 1-2 days  
**Dependencies:** 4.1

**Tasks:**
- [ ] Create `/components/SettingsPanel.tsx`
- [ ] Add memory opt-in toggle
- [ ] Add source filter controls (resume/portfolio/blog)
- [ ] Add persona tone selector (optional)
- [ ] Persist settings in localStorage
- [ ] Style as sidebar or modal

**Success Criteria:**
- ✅ Settings persist across sessions
- ✅ Filters apply to searches
- ✅ UI is intuitive

---

## Phase 5: Testing, Polish & Deployment (Week 7-8)

**Goal:** Comprehensive testing, performance optimization, and production deployment.

### 5.1 End-to-End Testing
**Owner:** Full Team  
**Duration:** 3-4 days  
**Dependencies:** All Phase 4 tasks

**Tasks:**
- [ ] Set up Playwright or Cypress
- [ ] Write E2E test: upload document → query → verify citation
- [ ] Write E2E test: quick actions (Show Resume, List Projects)
- [ ] Write E2E test: streaming response behavior
- [ ] Write E2E test: error handling (invalid queries)
- [ ] Run tests in CI pipeline

**Success Criteria:**
- ✅ All E2E tests pass
- ✅ Tests run in CI on every PR

---

### 5.2 Performance Optimization
**Owner:** Backend Developer  
**Duration:** 2-3 days  
**Dependencies:** 5.1

**Tasks:**
- [ ] Add response caching for common queries
- [ ] Optimize vector search filters
- [ ] Reduce prompt token usage (smaller context window)
- [ ] Add CDN for static assets
- [ ] Optimize embedding API calls (batch where possible)
- [ ] Add database connection pooling
- [ ] Profile and fix slow endpoints

**Performance Targets:**
- Chat response: <2s to first token
- Vector search: <500ms
- Upload + ingestion: <30s for typical resume

**Success Criteria:**
- ✅ Meets performance targets
- ✅ No bottlenecks in production load testing

---

### 5.3 Security Audit
**Owner:** Backend Developer  
**Duration:** 2 days  
**Dependencies:** All Phase 3-4 tasks

**Tasks:**
- [ ] Audit API authentication/authorization
- [ ] Implement rate limiting on all endpoints
- [ ] Validate all user inputs (prevent injection)
- [ ] Ensure secrets never exposed to client
- [ ] Add CORS configuration
- [ ] Implement CSP headers
- [ ] Test for common vulnerabilities (OWASP Top 10)

**Success Criteria:**
- ✅ No secrets in client bundle
- ✅ All inputs validated
- ✅ Rate limits enforced

---

### 5.4 Observability & Monitoring
**Owner:** DevOps / Backend Developer  
**Duration:** 2 days  
**Dependencies:** 5.1

**Tasks:**
- [ ] Set up Vercel Analytics
- [ ] Add custom logging (vector ops, LLM calls)
- [ ] Create dashboards for key metrics:
  - API response times
  - Vector search latency
  - LLM token usage
  - Upload success rate
- [ ] Set up error tracking (Sentry or similar)
- [ ] Configure alerts for errors/downtime

**Success Criteria:**
- ✅ Real-time metrics visible
- ✅ Errors tracked and alerting works

---

### 5.5 Documentation
**Owner:** Full Team  
**Duration:** 2 days  
**Dependencies:** All tasks

**Tasks:**
- [ ] Update README.md with setup instructions
- [ ] Document API endpoints (OpenAPI spec or README)
- [ ] Write developer onboarding guide
- [ ] Create user guide for chat interface
- [ ] Document ingestion process
- [ ] Add architecture diagrams

**Success Criteria:**
- ✅ New developer can set up locally in <30 minutes
- ✅ All public APIs documented

---

### 5.6 Production Deployment
**Owner:** DevOps / Full Team  
**Duration:** 1-2 days  
**Dependencies:** 5.2, 5.3, 5.4

**Tasks:**
- [ ] Configure production environment variables in Vercel
- [ ] Set up production Upstash Vector database
- [ ] Deploy to Vercel production
- [ ] Verify all API endpoints work in production
- [ ] Run smoke tests
- [ ] Monitor for errors (24 hours)
- [ ] Set up custom domain (optional)

**Success Criteria:**
- ✅ Application deployed and accessible
- ✅ No critical errors in first 24 hours
- ✅ All smoke tests pass

---

## Resource Allocation

### Team Roles
- **Backend Developer (2 people):** API routes, MCP tools, vector integration, ingestion
- **Frontend Developer (1-2 people):** React components, chat UI, upload UI
- **DevOps (0.5 person):** CI/CD, monitoring, deployment

### Time Estimates by Phase
| Phase | Duration | Effort (person-days) |
|-------|----------|---------------------|
| Phase 1: Foundation | 2 weeks | 15-20 days |
| Phase 2: MCP & RAG | 2 weeks | 12-15 days |
| Phase 3: API & LLM | 1.5 weeks | 12-14 days |
| Phase 4: Frontend & Ingestion | 2 weeks | 16-20 days |
| Phase 5: Testing & Deploy | 1.5 weeks | 10-12 days |
| **Total** | **8 weeks** | **65-81 days** |

---

## Dependencies Graph

```
Phase 1 (Foundation)
  ├─> 1.1 Project Init
  ├─> 1.2 Types (depends on 1.1)
  ├─> 1.3 Upstash Integration (depends on 1.2)
  └─> 1.4 Embedding Service (depends on 1.2)

Phase 2 (MCP Tools)
  ├─> 2.1 query_personal_history (depends on 1.3, 1.4)
  ├─> 2.2 get_document_by_id (depends on 1.3)
  ├─> 2.3 list_portfolio_projects (depends on 1.3)
  ├─> 2.4 fetch_recent_activities (depends on 1.3)
  └─> 2.5 MCP Orchestrator (depends on 2.1-2.4)

Phase 3 (APIs)
  ├─> 3.1-3.2 Vector APIs (depends on 1.3, 1.4)
  ├─> 3.3 Vercel AI SDK (independent)
  ├─> 3.4 Prompt Builder (depends on 3.3)
  ├─> 3.5 /api/chat (depends on 2.5, 3.3, 3.4) **CRITICAL PATH**
  ├─> 3.6 /api/mcp/execute (depends on 2.5)
  └─> 3.7 /api/metadata (depends on 1.3)

Phase 4 (Frontend)
  ├─> 4.1 ChatInterface (depends on 3.5)
  ├─> 4.2 Citations (depends on 4.1)
  ├─> 4.3 InputArea (depends on 4.1)
  ├─> 4.4 DocPreview (depends on 4.2, 3.7)
  ├─> 4.5 Ingestion Pipeline (depends on 1.3, 1.4)
  ├─> 4.6 /api/upload (depends on 4.5)
  ├─> 4.7 Upload UI (depends on 4.6)
  └─> 4.8 Settings (depends on 4.1)

Phase 5 (Deploy)
  └─> All tasks depend on Phases 1-4 completion
```

---

## Risk Mitigation

### High-Risk Items

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Upstash Vector rate limits hit | High | Implement client-side caching, batch operations |
| LLM hallucination despite RAG | High | Strong system prompt, citation enforcement, user feedback loop |
| Ingestion pipeline failure | Medium | Robust error handling, retry logic, manual upload fallback |
| Streaming response failures | Medium | Fallback to non-streaming mode, error boundaries |
| Token budget exceeded | Medium | Enforce strict limits, summarize long contexts |

### Contingency Plans
- **If Upstash Vector fails:** Fallback to local vector DB (Chroma/LanceDB) for development
- **If embedding API fails:** Use smaller/faster model or cache more aggressively
- **If behind schedule:** Defer Phase 4.8 (Settings) and some Phase 5 polish tasks

---

## Success Criteria (Week 2 Acceptance)

Per design.md Section 9, the following must be verified:

- [x] POST /api/chat implemented and streams LLM responses
- [x] MCP tool query_personal_history verified against Upstash Vector
- [x] Vector ingestion endpoint and worker functional
- [x] Frontend ChatInterface streams and renders responses
- [x] Citation UI links to metadata endpoint
- [x] Persona system prompt enforced server-side
- [x] Unit tests for MCP tools + integration test for vector search

---

## Next Steps (Post-MVP)

**Future Enhancements:**
1. Multi-persona support (multiple subjects in one database)
2. Voice input/output for chat
3. Mobile app (React Native)
4. Advanced analytics (conversation insights, popular queries)
5. Export conversation history
6. Real-time collaboration (multiple users chatting with same Digital Twin)

---

## Appendix: Development Commands

### Setup
```bash
npm install
cp .env.local.example .env.local
# Add secrets to .env.local
npm run dev
```

### Testing
```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report
```

### Deployment
```bash
vercel --prod         # Deploy to production
vercel env pull       # Sync environment variables
```

---

**Document Status:** Ready for Team Review  
**Last Updated:** 2026-01-26  
**Generated with:** AI assistance (Claude) + human review