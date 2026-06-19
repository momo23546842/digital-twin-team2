# Digital Twin II — AI Voice & Web Career Agent

> A production-grade AI-powered Digital Twin that lets recruiters and hiring managers have a real conversation with an intelligent agent representing my professional profile — via web chat or voice.

Built as part of the **AusBiz Consulting Digital Twin II** program (23-lesson, 6-week full-stack AI engineering course).

---

## What It Does

This application acts as an always-on AI version of me. When a recruiter or hiring manager visits, they can:

- Chat in real time with an AI agent that knows my skills, experience, and background
- Ask questions like *"What ERP tools have you worked with?"* or *"Can you walk me through your automation testing experience?"*
- Receive contextually accurate answers drawn from my professional knowledge base via **Retrieval-Augmented Generation (RAG)**
- Optionally interact via **voice** for a more natural experience
- Submit their contact details, triggering a lead capture and CTA flow

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, React, Tailwind CSS |
| Backend | Next.js API Routes, Node.js |
| AI / LLM | Claude (Anthropic) via Agentic API |
| Vector Search | PostgreSQL + pgvector (cosine similarity) |
| Database | PostgreSQL (Prisma ORM) |
| Caching & Rate Limiting | PostgreSQL-backed (migrated from Redis/Upstash) |
| Voice | Web Speech API / voice agent integration |
| DevOps | GitHub Actions, Vercel deployment, Docker (local DB) |
| Project Management | ClickUp, weekly sprint cadence |

---

## Architecture Overview

```
User (web / voice)
       │
       ▼
  Next.js Frontend
       │
       ▼
  /api/chat  ──────────────────────────────┐
       │                                   │
       ▼                                   ▼
  Rate Limiting (PostgreSQL)     Vector Search (pgvector)
       │                                   │
       ▼                                   ▼
  Claude LLM  ◄──── RAG Context ◄──── Relevant chunks
       │
       ▼
  Streamed AI Response → User
```

---

## Key Features

- **RAG pipeline** — professional knowledge base ingested via `/api/ingest`, chunked and stored as 1536-dimension vector embeddings with pgvector
- **Cosine similarity search** — surfaces the most relevant context chunks per query before LLM response generation
- **Rate limiting** — per-user request tracking with automatic window expiration
- **Lead capture** — conversation tracking and CTA handling for recruiter follow-up
- **Voice interface** — voice-driven interaction for hands-free engagement
- **Self-hosted PostgreSQL** — single database replacing dual Upstash/Redis services, reducing cost and complexity

---

## My Role

This was a team project (Team 2) completed across a 6-week sprint cycle following the AusBiz Consulting program structure. My contributions included:

- Full-stack development across frontend and API layers
- PostgreSQL migration — replaced Upstash/Redis with a unified pgvector-backed database, improving data persistence and reducing per-operation costs
- GitHub workflow management — branch strategy, PR reviews, and sprint submissions
- Integration of the RAG pipeline with the Claude LLM API
- Documentation across setup, migration, and deployment guides

---

## Local Setup

### Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL with pgvector)
- Anthropic API key

### 1. Clone the repo

```bash
git clone https://github.com/momo23546842/digital-twin-team2.git
cd digital-twin-team2
```

### 2. Start PostgreSQL with pgvector

```bash
docker run --name postgres-dt \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=digital_twin \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16
```

### 3. Configure environment

```bash
cp .env.local.example .env.local
# Add your DATABASE_URL and ANTHROPIC_API_KEY to .env.local
```

### 4. Install dependencies and initialise DB

```bash
pnpm install
npx ts-node src/lib/init-db.ts
```

### 5. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
├── app/                  # Next.js App Router pages
├── components/           # React UI components
├── src/
│   ├── lib/
│   │   ├── postgres.ts   # Vector operations (pgvector)
│   │   ├── db.ts         # Caching layer
│   │   └── rateLimit.ts  # Per-user rate limiting
│   └── app/api/
│       ├── chat/         # LLM + RAG response endpoint
│       └── ingest/       # Knowledge base ingestion endpoint
├── prisma/               # DB schema
├── database/             # Init and cleanup scripts
└── docs/                 # Architecture and migration docs
```

---

## Course Context

Built through the **AusBiz Consulting Digital Twin II: Voice Career Agent** program — a hands-on 23-lesson, 6-week full-stack AI engineering course focused on production-style application development, agentic AI integration, and professional deployment.

Course link: [ausbizconsulting.com.au/courses/digitaltwin-ii](https://www.ausbizconsulting.com.au/courses/digitaltwin-ii)

---

## Certificate

View credential: [credential.net](https://pdf.credential.net/wdezp1oo_1781836882470.pdf)

---

## Author

**Rohan Sharma**
ERP Graduate | SAP S/4HANA | Business Analyst
[LinkedIn](https://www.linkedin.com/in/rohans2509) · Sydney, Australia
