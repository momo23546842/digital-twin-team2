# 🤖 Digital Twin Career Agent

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Database](https://img.shields.io/badge/Database-PostgreSQL-green)
![AI](https://img.shields.io/badge/AI-Groq%20LLM-orange)
![Voice](https://img.shields.io/badge/Voice-Vapi%20%2B%20ElevenLabs-purple)

> **⚡ START HERE: Get running in 5 minutes with [QUICKSTART.md](./digital-twin/QUICKSTART.md)**

## 🎯 Overview

A production-ready AI-powered digital twin that acts as your always-on professional representative. Visitors can chat with the AI via text on the web or call it on the phone — it answers questions about your background, skills, and experience using RAG-powered context from your resume and uploaded documents.

### Core Capabilities

- 🗣️ **Real-time AI Chat** — Groq LLM (`llama-3.3-70b-versatile`) with sub-second responses
- 📞 **AI Phone Assistant** — Vapi-powered inbound/outbound calls with ElevenLabs voice cloning & Deepgram STT
- 📄 **RAG Pipeline** — Upload documents (PDF, text), chunk, embed, and retrieve context via PostgreSQL vector search
- 🎙️ **Voice Input** — Web Speech API transcription in the chat UI
- 💾 **Persistent Memory** — Full conversation history in PostgreSQL (Prisma ORM + raw driver)
- 📧 **Notifications** — Email (Resend) and SMS (Twilio) alerts on phone calls
- 👨‍💼 **Admin Dashboard** — View conversations, contacts, call logs, and metrics
- 📞 **Lead Capture** — Contact form with name, email, phone, company
- 🔐 **Authentication** — JWT-based login/signup with session verification
- 🔌 **MCP Server** — Model Context Protocol integration for extensible tool use

## 📋 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16.1 (App Router) | Full-stack React |
| **Language** | TypeScript 5 | Type safety |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **LLM** | Groq API (`llama-3.3-70b-versatile`) | AI chat & summarization |
| **Database** | PostgreSQL (Prisma ORM + `pg`) | Persistence & vector search |
| **Phone AI** | Vapi | AI phone assistant orchestration |
| **Voice TTS** | ElevenLabs | Text-to-speech with voice cloning |
| **Voice STT** | Deepgram (`nova-2`) | Speech-to-text transcription |
| **Email** | Resend | Transactional email notifications |
| **SMS** | Twilio | SMS call alerts |
| **PDF Parsing** | pdfjs-dist | Document text extraction |
| **Validation** | Zod | Runtime schema validation |
| **Icons** | Lucide React | UI iconography |
| **Deployment** | Vercel / Docker | Cloud or containerized |

## ⚡ Quick Start

```bash
cd digital-twin
npm install
npm run dev
```

1. Open http://localhost:3000
2. Create `digital-twin/.env.local` with your API keys (see [Configuration](#-configuration))
3. Start chatting!

> 📖 **Full setup guide** → [QUICKSTART.md](./digital-twin/QUICKSTART.md)

## 🔧 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **PostgreSQL** — [Neon](https://neon.tech) (free tier) or any PostgreSQL instance
- **Groq API Key** — Free at [console.groq.com](https://console.groq.com)

**Optional (for phone/voice features):**
- **Vapi** account — [vapi.ai](https://vapi.ai)
- **ElevenLabs** API key — [elevenlabs.io](https://elevenlabs.io)
- **Twilio** account — For SMS notifications
- **Resend** API key — For email notifications

## 📦 Installation

```bash
cd digital-twin
npm install
```

**Or use the startup script:**

```bash
# Windows (PowerShell)
.\startup.ps1

# macOS/Linux
bash startup.sh
```

## 🔧 Configuration

### Required Environment Variables

Create `digital-twin/.env.local`:

```env
# --- Core (required) ---
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
GROQ_API_KEY=gsk_your_key_here

# --- Phone AI (optional — needed for Vapi phone calls) ---
VAPI_API_KEY=your_vapi_key
VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_PHONE_NUMBER_ID=your_phone_number_id
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_cloned_voice_id

# --- Notifications (optional — email & SMS on calls) ---
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
NOTIFICATION_EMAIL=you@example.com
NOTIFICATION_PHONE=+1234567890

# --- Security ---
WEBHOOK_SECRET=your_hmac_secret

# --- App ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### API Key Sources

| Service | URL | Free Tier |
|---------|-----|-----------|
| Groq | https://console.groq.com | ✅ |
| Neon PostgreSQL | https://neon.tech | ✅ |
| Vapi | https://vapi.ai | ✅ |
| ElevenLabs | https://elevenlabs.io | ✅ |
| Resend | https://resend.com | ✅ |
| Twilio | https://twilio.com | Trial |

## 🚀 Running

```bash
cd digital-twin
npm run dev
```

Visit http://localhost:3000

## ✨ Features

| Feature | Status | Details |
|---------|--------|---------|
| 💬 **AI Chat** | ✅ | Groq-powered conversational UI with streaming-style responses |
| 📄 **RAG Document Upload** | ✅ | PDF/text upload → chunking → embedding → vector retrieval |
| 📞 **AI Phone Calls** | ✅ | Vapi inbound/outbound calls with ElevenLabs voice & Deepgram STT |
| 📞 **Call History** | ✅ | View call logs, transcripts, recordings, and AI summaries |
| 📧 **Call Notifications** | ✅ | Email (Resend) + SMS (Twilio) alerts on every phone call |
| 🎙️ **Voice Input** | ✅ | Web Speech API transcription in chat |
| 💾 **Chat History** | ✅ | Persistent conversation storage in PostgreSQL |
| 📞 **Lead Capture** | ✅ | Contact form (name, email, phone, company) |
| 👨‍💼 **Admin Dashboard** | ✅ | Stats, contacts, conversations, call logs |
| 🔐 **Authentication** | ✅ | JWT login/signup with session verification |
| 📱 **Mobile Responsive** | ✅ | Fully responsive on all devices |
| 🎨 **Modern UI** | ✅ | Dark theme, animated landing page, Lucide icons |
| 🔌 **MCP Integration** | ✅ | Model Context Protocol server for extensible tools |
| ⚡ **Rate Limiting** | ✅ | PostgreSQL-backed sliding window rate limiter |

## 📂 Project Structure

```
digital-twin/
├── prisma/
│   └── schema.prisma              ← Database models (Prisma ORM)
├── src/
│   ├── app/
│   │   ├── page.tsx               ← Landing page
│   │   ├── layout.tsx             ← Root layout with providers
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx     ← Login page
│   │   │   └── signup/page.tsx    ← Signup page
│   │   ├── chat/page.tsx          ← Chat interface
│   │   └── api/
│   │       ├── auth/              ← Login, signup, verify endpoints
│   │       ├── chat/route.ts      ← Core AI chat with RAG + MCP context
│   │       ├── context/route.ts   ← Resume context API (for Vapi)
│   │       ├── ingest/route.ts    ← Document ingestion / RAG pipeline
│   │       └── webhooks/vapi/     ← Vapi call event webhook
│   ├── components/
│   │   ├── landing/               ← Landing page sections (Hero, Features, CTA, Footer)
│   │   ├── ChatPane.tsx           ← Main chat interface
│   │   ├── ChatPageComplete.tsx   ← Full-featured chat with sidebar
│   │   ├── ContactForm.tsx        ← Lead capture form
│   │   ├── DocumentUpload.tsx     ← Drag-and-drop document upload (PDF/text)
│   │   ├── CallHistory.tsx        ← Phone call logs with transcripts
│   │   ├── AdminDashboard.tsx     ← Admin panel with metrics
│   │   └── Navbar.tsx             ← Auth-aware navigation bar
│   ├── lib/
│   │   ├── vapi.ts                ← Vapi AI phone assistant (create, call, manage)
│   │   ├── groq.ts                ← Groq LLM client & response validation
│   │   ├── resume.ts              ← Resume JSON → formatted context string
│   │   ├── embeddings.ts          ← Vector embedding generation
│   │   ├── postgres.ts            ← PostgreSQL pool, vector search, table setup
│   │   ├── prisma.ts              ← Prisma client singleton
│   │   ├── notifications.ts       ← Email (Resend) + SMS (Twilio) notifications
│   │   ├── rateLimit.ts           ← PostgreSQL-backed rate limiter
│   │   ├── mcp-client.ts          ← MCP server stdio client
│   │   ├── auth-context.tsx       ← React auth context provider
│   │   ├── auth-db.ts             ← User store for authentication
│   │   └── env.ts                 ← Environment variable validation
│   └── types/                     ← TypeScript type definitions
├── package.json
├── Dockerfile                     ← Docker container config
├── docker-compose.yml             ← Local Postgres via Docker
└── QUICKSTART.md                  ← 5-minute setup guide
```

## 🔗 API Endpoints

### Chat & AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send messages → RAG retrieval + Groq LLM response |
| `GET` | `/api/chat` | Health check |
| `POST` | `/api/ingest` | Upload documents for RAG (chunk → embed → store) |
| `GET/POST` | `/api/context` | Resume context search (used by Vapi phone assistant) |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Email/password login → JWT token |
| `POST` | `/api/auth/signup` | Create account → JWT token |
| `GET` | `/api/auth/verify` | Verify session token |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhooks/vapi` | Vapi call events (started, ended, report) → record + notify |

### Admin (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Aggregate statistics |
| `GET` | `/api/admin/contacts` | View captured leads |

## 🗄️ Database

### Prisma Models

| Model | Table | Purpose |
|-------|-------|---------|
| `ChatLog` | `chat_logs` | Conversation messages (sessionId, role, content) |
| `Lead` | `leads` | Captured contact/lead info |
| `PhoneCall` | `phone_calls` | Vapi call records (transcript, summary, recording URL) |
| `VoiceConfig` | `voice_configs` | ElevenLabs voice settings |

### PostgreSQL Tables (auto-created)

| Table | Purpose |
|-------|---------|
| `vectors` | Embeddings stored as JSONB for RAG retrieval |
| `ingestion_metadata` | Document ingestion history |
| `database_cache` | Key-value cache with TTL |
| `rate_limits` | Per-user rate limiting |

## 📞 Phone AI Architecture

```
Caller → Vapi Phone Number → Vapi Assistant (Groq LLM + ElevenLabs voice)
                                  │
                                  ├── Real-time STT (Deepgram nova-2)
                                  ├── LLM response (Groq llama-3.3-70b)
                                  ├── TTS playback (ElevenLabs cloned voice)
                                  │
                                  └── Webhook → /api/webhooks/vapi
                                                   ├── Save call to DB (Prisma)
                                                   ├── Generate AI summary (Groq)
                                                   ├── Send email report (Resend)
                                                   └── Send SMS alert (Twilio)
```

The phone assistant uses your resume data as its knowledge base, so callers can ask about your skills, experience, and background.

## 📄 RAG Pipeline

```
Document Upload → Text Extraction (PDF/text) → Sentence Chunking (max 2000 chars)
    → Embedding Generation → PostgreSQL Vector Store
         → User Query → Embed Query → Cosine Similarity Search
              → Top 3 Chunks → Prepend to Groq System Prompt → AI Response
```

Upload documents via the chat UI drag-and-drop area or the `/api/ingest` endpoint.

## 🎨 Customization

### Change Landing Page
Edit components in [`src/components/landing/`](./digital-twin/src/components/landing/)

### Update AI Personality
Edit the system prompt in [`src/app/api/chat/route.ts`](./digital-twin/src/app/api/chat/route.ts)

### Update Resume Data
Edit [`src/app/api/webhooks/vapi/resume.json`](./digital-twin/src/app/api/webhooks/vapi/resume.json) with your information

### Modify Styling
Edit [`src/app/globals.css`](./digital-twin/src/app/globals.css) and [`tailwind.config.ts`](./digital-twin/tailwind.config.ts)

## 🚀 Deployment

### Vercel (Easiest)
```bash
npm i -g vercel
cd digital-twin
vercel
# Set environment variables in Vercel dashboard
```

### Docker
```bash
cd digital-twin
docker build -t digital-twin .
docker run -p 3000:3000 --env-file .env digital-twin
```

### Docker Compose (with local Postgres)
```bash
cd digital-twin
docker-compose up
```

See [DEPLOYMENT_CHECKLIST.md](./digital-twin/DEPLOYMENT_CHECKLIST.md) for detailed steps.

## 📊 Performance

| Operation | Latency |
|-----------|---------|
| Landing page load | < 0.5s |
| Chat UI render | < 1s |
| AI response (Groq) | 1–3s |
| Database query | < 100ms |
| Vector similarity search | < 200ms |

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `npm run dev -- -p 3001` |
| DATABASE_URL missing | Create `digital-twin/.env.local` with your connection string |
| Groq API error | Verify key at https://console.groq.com/keys |
| npm install fails | `npm cache clean --force && npm install` |
| Prisma errors | `npx prisma generate && npx prisma db push` |
| Vapi calls not working | Check `VAPI_API_KEY` and webhook URL configuration |

See [SETUP.md](./digital-twin/SETUP.md) for more troubleshooting.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./digital-twin/QUICKSTART.md) | 5-minute setup (**start here!**) |
| [SETUP.md](./digital-twin/SETUP.md) | Comprehensive setup guide |
| [PRODUCTION_README.md](./digital-twin/PRODUCTION_README.md) | Complete feature documentation |
| [DEPLOYMENT_CHECKLIST.md](./digital-twin/DEPLOYMENT_CHECKLIST.md) | Pre-launch checklist |
| [POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md) | Database migration guide |
| [AUTHENTICATION_GUIDE.md](./digital-twin/AUTHENTICATION_GUIDE.md) | Auth system documentation |
| [docs/prd.md](./docs/prd.md) | Product Requirements Document |
| [docs/design.md](./docs/design.md) | System design document |

## 🧪 Testing

1. **Landing page** — Visit http://localhost:3000
2. **Chat** — Click "Start Chat" or navigate to http://localhost:3000/chat
3. **Document upload** — Drag a PDF or text file into the chat
4. **Voice input** — Click the microphone icon in chat
5. **Contact form** — Fill out the contact form from chat sidebar
6. **Auth** — Sign up at http://localhost:3000/signup, login at http://localhost:3000/login
7. **Phone calls** — Call the configured Vapi phone number
8. **Admin** — Login at http://localhost:3000/admin/login

## 🔐 Security

- ✅ JWT authentication with 24-hour expiration
- ✅ PBKDF2 password hashing (100k iterations)
- ✅ HMAC-SHA256 webhook signature verification
- ✅ Environment variable secrets (never exposed to client)
- ✅ SQL parameterized queries (Prisma + pg)
- ✅ PostgreSQL-backed rate limiting
- ✅ CORS headers configured
- ✅ Connection pooling (max 20 connections)

## ✅ Acceptance Criteria (From PRD)

- ✅ Core digital twin runs successfully
- ✅ Voice interaction enabled (Vapi + ElevenLabs + Deepgram)
- ✅ Database persistence with PostgreSQL (Prisma ORM)
- ✅ RAG pipeline with document ingestion and vector search
- ✅ AI phone assistant with call recording and transcription
- ✅ Notification system (email + SMS)
- ✅ Repository includes PRD, README, and agent documentation

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

MIT License

---

**Team 2** | Digital Twin Project | 2026

