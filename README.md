# digital-twin-team2
# digital-twin-team2

## Overview
digital-twin-team2 is a prototype Digital Twin chatbot platform that models and simulates an agent/persona using a combination of agent-based workflows, persistent state, and retrieval-augmented generation (RAG). The repository implements a Next.js (App Router) TypeScript application designed to be modular, observable, and extensible.

This README documents purpose, architecture, development setup, coding standards, environment configuration, testing, deployment, observability, and contribution workflow. Always consult docs/prd.md for feature-level requirements and acceptance criteria before implementing changes.

## Key Goals
- Ingest real or simulated data and maintain an internal state representing the digital twin.
- Execute multiple agents (independent or collaborative) to evaluate and act upon system state.
- Provide structured observability (action logs, state changes).
- Support RAG via a vector database and provide safe, server-side AI inference.
- Be modular and easy to extend with new agents and workflows.

## Tech Stack
- Framework: Next.js 16 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS
- Cache / Rate-limiting: Upstash Redis
- Vector store (RAG): Upstash Vector DB (or equivalent)
- AI inference: Groq API (via SDK)
- Deployment: Vercel
- Testing: Jest or Vitest (project choice), TypeScript type-checking
- CI: GitHub Actions or Vercel build pipeline (recommended)

## Repository Layout (high level)
- docs/
  - prd.md — Product Requirements Document (primary source of truth)
- agents.md — Project context, coding rules, and AI instructions
- .qodo/agents/ — Agent definitions (runtime agent config and code)
- .qodo/workflows/ — Workflow automation blueprints and orchestrations
- app/ — Next.js App Router source (pages / server components)
- components/ — Shared UI and server utilities
- lib/ — SDK wrappers, Groq client, Upstash utilities
- tests/ — Unit and integration tests
- README.md — This file

Note: File locations above may be adapted to project conventions—consult workspace for exact layout.

## Development Setup (Windows)
1. Clone repository:
   - git clone <repo-url>
   - cd "e:\digital twin\digital-twin-team2"
2. Install dependencies:
   - npm install
3. Create a local environment file:
   - copy .env.example .env.local
   - populate environment variables (see Environment variables section)
4. Start development server:
   - npm run dev
5. Build for production:
   - npm run build
   - npm run start

If using pnpm or yarn replace npm commands accordingly.

## Environment Variables
Never hardcode secrets. Use process.env and store secrets in `.env.local` for local dev and in Vercel/GitHub Secrets for CI/prod.

Suggested variables:
- GROQ_API_KEY — Groq inference API key (server only)
- GROQ_PROJECT_ID — Groq project id (if applicable)
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN
- VECTOR_DB_URL — Upstash Vector DB endpoint
- VECTOR_DB_KEY — Vector DB API key
- NEXT_PUBLIC_BASE_URL — Client-safe public URL (only non-sensitive values)
- NODE_ENV — development | production

Security note: prefix client-exposed variables with NEXT_PUBLIC_. Do not expose API keys or tokens to the client.

## Coding Standards & Conventions
Follow rules in agents.md. Key highlights:
- TypeScript strict mode:
  - Use `interface` for object shapes.
  - Use `type` for unions and intersections.
  - Avoid `any`. Prefer generic types and explicit interfaces.
- Next.js App Router:
  - Default to Server Components (`export default async function Page(...)`) unless client state/hooks are required.
  - Use `"use client"` at the very top of files only when necessary.
  - Provide `loading.tsx` and error boundary (`error.tsx`) for routes.
- Components and utilities:
  - All components must have typed props.
  - Prefer small, focused modules and pure functions.
  - Name helpers and functions descriptively (e.g., `fetchAgentState`, `persistActionLog`).
- Security:
  - Always call Groq and vector DB from server-side code.
  - Filter and sanitize data before storing or indexing.
- Logging:
  - Emit structured logs for agent decisions and state transitions.
  - Use a consistent log schema (timestamp, agent, action, input, result, traceId).

## How the System Works (concise)
1. Input ingestion: data arrives from external sources or simulated inputs.
2. State management: state is persisted (Redis / DB) and versioned for audit.
3. Agents: modular agent definitions (.qodo/agents) read state, propose actions, and optionally write back state or emit events.
4. RAG: Agents may query the vector DB for context (server-side only).
5. AI inference: Groq SDK handles LLM calls, always invoked from server code.
6. Orchestration: Workflows coordinate multi-agent interactions and conflict resolution.
7. Observability: Action logs and metrics captured for tracing.

## Running Tests & Linting
- Type checking:
  - npm run type-check (or tsc --noEmit)
- Unit tests:
  - npm test (configured for Jest/Vitest)
- Lint & format:
  - npm run lint
  - npm run format

Add tests for all new agent behaviors and core state transitions. CI should fail on type, lint, or test errors.

## Deployment (Vercel)
- Use Vercel for deployment (recommended).
- Set environment variables in Vercel project settings (do not commit secrets).
- Build command: npm run build
- Production start: npm run start (or rely on Vercel managed builds)
- Ensure server-only calls (Groq, Vector DB) are inside server components or API routes.

## Observability & Monitoring
- Persist agent action logs to a durable store (Redis or append-only DB) for traceability.
- Add metrics:
  - requests per minute
  - agent execution times
  - failed inference attempts
- Include correlation IDs for requests and agent workflows to allow end-to-end tracing.

## Security Best Practices
- Do not expose API credentials to the browser.
- Validate and sanitize inputs from external sources before processing.
- Rotate API keys regularly and use scoped credentials.
- Prefer server-side rendering and server components for secrets usage.

## Contribution Workflow
1. Read docs/prd.md and agents.md before implementation.
2. Create a feature branch named: feat/<ticket>-short-description
3. Add tests for new behavior; run type-check and lint locally.
4. Open a PR referencing the PRD acceptance criteria and any relevant tickets.
5. Address reviewer feedback, update docs/prd.md if behavior changes.
6. Merge after approvals and passing CI.

## Troubleshooting (common issues)
- Missing env variables: ensure `.env.local` exists and variables are exported to the environment.
- Type errors: run `npm run type-check` and inspect errors; follow strict typing guidance.
- Groq/auth errors: verify GROQ_API_KEY and project settings; ensure calls are server-side.

## Files to Inspect First
- docs/prd.md — product requirements and acceptance criteria (primary)
- agents.md — agent rules and coding standards
- .qodo/agents/ — agent definitions and behavior
- lib/groq.ts (or equivalent) — Groq client wrapper
- lib/upstash.ts (or equivalent) — Upstash helpers and connection code

## Maintenance & Roadmap Suggestions
- Introduce integration tests for agent orchestration and state persistence.
- Implement a replay capability for state transitions to assist debugging.
- Add role-based access control for agent actions in multi-tenant scenarios.
- Improve policy enforcement around RAG: automatic redaction of sensitive documents before indexing.

## Contact & Ownership
- Primary: digital-twin-team2 (refer to internal team roster and PRD for owner details)
- For architecture questions: consult docs/prd.md and maintainers listed in repository metadata.

## Final Notes
- Always consult docs/prd.md before proposing or implementing feature changes. If a requested change conflicts with the PRD, raise the discrepancy and propose alternatives.
- Keep secrets out of the repo. Use process.env and platform secrets for production.
