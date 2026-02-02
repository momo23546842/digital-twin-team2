
# Digital Twin

![Status](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Database](https://img.shields.io/badge/Database-Neon%20Postgres-green)

## Overview

This project is a sophisticated **Career Intelligence Engine** designed to embody a professional persona in the digital realm. Moving beyond the limitations of a standard chatbot, it acts as an active digital representative within the workspace, engineered to foster meaningful and proactive engagement.

By integrating MCP (Model Context Protocol) for real-time, deep contextual understanding with Neon Postgres for persistent long-term memory, the system provides unparalleled depth. Combined with the lightning-fast response speeds of Groq, real-time voice interaction, and autonomous lead capture, this agent defines a new frontier for **active digital representation** in the modern workspace.

## 📋 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4 / Shadcn UI
- **AI Inference:** Groq API / Vercel AI SDK
- **Database:** Neon Postgres (via Prisma ORM)
- **Voice:** Web Speech API / Vercel AI SDK (Voice)
- **Deployment:** Vercel
- **Package Manager:** npm

## 🔧 Prerequisites

Before you start, ensure you have:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git** for version control
- **Neon Postgres Account** (for database)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd digital-twin-team2

```

### 2. Install Dependencies

```bash
npm install

```

This will install all required packages including:

* `next`, `react`, `react-dom` (Core)
* `groq-sdk`, `ai` (AI)
* `@prisma/client` (Database)
* `lucide-react`, `class-variance-authority`, `tailwind-merge` (UI)

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

**Required variables:**

```env
# Database (Neon Postgres)
# Get from: [https://console.neon.tech/app/projects](https://console.neon.tech/app/projects)
DATABASE_URL="postgresql://user:password@ep-host.neon.tech/neondb?sslmode=require"

# Groq API Key (required for AI inference)
# Get from: [https://console.groq.com/keys](https://console.groq.com/keys)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxx

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"

```

⚠️ **Important:** Never commit `.env.local` to version control.

### 4. Setup Database (Prisma)

Initialize your Neon Postgres database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to the database
npx prisma db push

```

## 🚀 Getting Started

### Run the Development Server

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.
The page will auto-reload as you edit files in `src/app/` or `app/`.

### Project Structure

```
src/ or app/
├── actions/            # Server Actions (DB writes, etc.)
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Landing page
│   └── api/            # API Routes
├── components/
│   ├── ui/             # Shadcn UI components
│   └── chat/           # Chat interface & Voice controls
├── lib/
│   ├── groq.ts         # Groq client
│   ├── prisma.ts       # Database client (Singleton)
│   └── utils.ts        # Utilities
└── prisma/
    └── schema.prisma   # Database schema definition

```

## 📝 Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Prisma Studio (Database GUI)
npx prisma studio

# Linting
npm run lint

```

## 🔍 Code Quality

### TypeScript Strict Mode

This project uses **strict TypeScript mode**:

* All variables must be properly typed.
* No implicit `any` types.
* Null/undefined checks are enforced.

### Linting

ESLint is configured with Next.js preset. To check code:

```bash
npm run lint

```

## 🛠️ Development Guidelines

### Creating Server Components

```typescript
// app/page.tsx
import { prisma } from "@/lib/prisma"

export default async function Page() {
  const logs = await prisma.chatLog.findMany()
  return <div>{logs.length} entries</div>
}

```

### Creating Client Components

Only use `"use client"` when interactivity (hooks, event listeners) is needed.

```typescript
"use client"
import { useChat } from "ai/react"

export function ChatComponent() {
  const { messages, input, handleInputChange } = useChat()
  return <input value={input} onChange={handleInputChange} />
}

```

### Using Database (Prisma)

Instead of Redis, we use Prisma to interact with Postgres:

```typescript
import { prisma } from "@/lib/prisma"

// Create a new record
await prisma.lead.create({
  data: {
    email: "user@example.com",
    name: "John Doe"
  }
})

```

## 🧪 Testing

Currently, manual testing is recommended. Ensure:

1. Chat responds accurately using the System Prompt.
2. Voice input/output works (Microphone permissions).
3. Data appears in Neon Postgres after a conversation.

## 🚢 Deployment

### Deploy to Vercel

1. Push to GitHub.
2. Go to https://vercel.com/new.
3. Import the repository.
4. **Add Environment Variables** (Copy from `.env.local`).
5. Click Deploy.

## 📚 Documentation

* **[PRD](https://www.google.com/search?q=docs/prd.md)** - Product Requirements & Acceptance Criteria
* **[Agents](agents.md)** - AI Instructions & Tech Stack Standards
* **[Next.js Docs](https://nextjs.org/docs)**
* **[Prisma Docs](https://www.prisma.io/docs)**
* **[Groq API Docs](https://console.groq.com/docs)**

## 🐛 Troubleshooting

### Prisma Client Error

If you see errors related to `@prisma/client`:

```bash
npx prisma generate

```

### Database Connection Issues

* Verify `DATABASE_URL` in `.env.local`.
* Ensure your IP is allowed in Neon (or "Allow all IPs" for dev).

### Voice Not Working

* Check browser microphone permissions.
* Ensure you are using `https://` or `localhost`.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## ✅ Acceptance Criteria (From PRD)

* ✅ Core digital twin runs successfully
* ✅ Voice interaction enabled (Milestone 6)
* ✅ Database persistence with Neon Postgres (Milestone 3)
* ✅ Repository includes PRD, README, and agent documentation

---

**Team 2** | Digital Twin Project | 2026


