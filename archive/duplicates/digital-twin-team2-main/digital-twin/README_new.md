# Digital Twin

A sophisticated AI chatbot application built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and Groq API for real-time AI inference. This project acts as a digital representation of a specific persona or knowledge base, with agent-based logic and RAG (Retrieval-Augmented Generation) support via Upstash Vector DB.

## 📋 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4
- **AI Inference:** Groq API (via SDK)
- **Database/Storage:** Upstash (Redis for caching/rate-limiting, Vector DB for RAG)
- **UI Components:** Lucide React icons
- **Deployment:** Vercel
- **Package Manager:** npm

## 🔧 Prerequisites

Before you start, ensure you have:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git** for version control

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/digital-twin.git
cd digital-twin/digital-twin
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:

**Core Dependencies:**
- `next@16.1.4` - Next.js framework
- `react@19.2.3` - React library
- `react-dom@19.2.3` - React DOM
- `groq-sdk@^0.37.0` - Groq AI API client
- `@upstash/redis@^1.36.1` - Upstash Redis client
- `@upstash/vector@^1.2.2` - Upstash Vector DB client
- `zod@^4.3.5` - TypeScript-first schema validation
- `class-variance-authority@^0.7.1` - Component styling utilities
- `tailwind-merge@^3.4.0` - Tailwind CSS utilities merger
- `lucide-react@^0.562.0` - Icon library

**Dev Dependencies:**
- `typescript@^5` - TypeScript compiler
- `tailwindcss@^4` - Utility-first CSS framework
- `@tailwindcss/postcss@^4` - PostCSS plugin for Tailwind v4
- `eslint@^9` - Code linter
- `eslint-config-next@16.1.4` - ESLint config for Next.js
- `@types/node@^20` - TypeScript Node types
- `@types/react@^19` - TypeScript React types
- `@types/react-dom@^19` - TypeScript React DOM types

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy template (already created)
# Fill in your credentials:
```

**Required variables:**

```env
# Groq API Key (required for AI inference)
# Get from: https://console.groq.com/keys
GROQ_API_KEY=gsk_xxxxxxxxxxxxxx

# Upstash Redis (for caching & rate limiting)
# Get from: https://console.upstash.com/redis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxxxxx

# Upstash Vector DB (for RAG embeddings)
# Get from: https://console.upstash.com/vector
UPSTASH_VECTOR_REST_URL=https://xxxxx-vector.upstash.io
UPSTASH_VECTOR_REST_TOKEN=xxxxxxxxxxxxxxxx

# GitHub API (optional, for integrations)
# Get from: https://github.com/settings/tokens
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxx
```

⚠️ **Important:** Never commit `.env.local` to version control. It is already in `.gitignore`.

### 4. Get API Credentials

#### Groq API Key
1. Go to https://console.groq.com/keys
2. Sign up or log in
3. Click "Create API Key"
4. Copy the key and paste into `.env.local`

#### Upstash Redis
1. Go to https://console.upstash.com
2. Create a new Redis database
3. Copy REST URL and REST Token
4. Paste into `UPSTASH_REDIS_*` variables

#### Upstash Vector DB
1. In Upstash console, create a Vector Index
2. Copy REST URL and REST Token
3. Paste into `UPSTASH_VECTOR_*` variables

#### GitHub Token (Optional)
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Scopes: `repo`, `read:user`
4. Copy and paste into `GITHUB_TOKEN`

## 🚀 Getting Started

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

The page will auto-reload as you edit files in `src/app/`.

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (shell)
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles & Tailwind
│   └── api/
│       └── chat/
│           └── route.ts    # Chat API endpoint
├── lib/
│   ├── groq.ts            # Groq client initialization
│   ├── redis.ts           # Upstash Redis client
│   ├── vector.ts          # Upstash Vector DB client
│   └── utils.ts           # Utility functions
└── components/
    └── ChatPane.tsx       # Main chat UI component
```

## 📝 Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 🔍 Code Quality

### TypeScript Strict Mode

This project uses **strict TypeScript mode**:
- All variables must be properly typed
- No implicit `any` types
- Null/undefined checks are enforced
- Use `interface` for object shapes, `type` for unions

### Linting

ESLint is configured with Next.js preset. To check code:

```bash
npm run lint
```

## 🛠️ Development Guidelines

### Creating New Server Components

```typescript
// src/app/your-page/page.tsx
export default async function Page() {
  return <div>Server Component</div>
}
```

### Creating Client Components

Only use `"use client"` when you need interactivity:

```typescript
// src/components/YourComponent.tsx
"use client"

import { useState } from "react"

export function YourComponent() {
  const [state, setState] = useState(false)
  return <div>Client Component</div>
}
```

### Calling the Chat API

```typescript
// Server-side only
import { groq } from "@/lib/groq"

const message = await groq.chat.completions.create({
  messages: [{ role: "user", content: "Hello" }],
  model: "mixtral-8x7b-32768",
})
```

### Using Redis Cache

```typescript
import { redis } from "@/lib/redis"

// Set cache
await redis.set("key", "value", { ex: 3600 })

// Get cache
const cached = await redis.get("key")
```

### Using Vector DB for RAG

```typescript
import { vectorIndex } from "@/lib/vector"

// Upsert embeddings
await vectorIndex.upsert([
  { id: "1", values: [0.1, 0.2, ...], metadata: {} },
])

// Query similar vectors
const results = await vectorIndex.query([0.1, 0.2, ...], { topK: 5 })
```

## 🧪 Testing

Currently, no automated tests are configured. To add them:

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

Then create test files alongside components (e.g., `YourComponent.test.tsx`).

## 🚢 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Go to https://vercel.com/new
3. Import the repository
4. Add environment variables (same as `.env.local`)
5. Click Deploy

Environment variables are managed securely in the Vercel dashboard and are never exposed to the client.

### Build for Production

```bash
npm run build
npm start
```

## 📚 Documentation

- **[PRD](../../docs/prd.md)** - Product Requirements & Acceptance Criteria
- **[Agents](../../agents.md)** - AI Instructions & Tech Stack Standards
- **[Next.js Docs](https://nextjs.org/docs)** - Official Next.js documentation
- **[Tailwind CSS v4](https://tailwindcss.com)** - Styling guide
- **[Groq API Docs](https://console.groq.com/docs)** - AI API reference
- **[Upstash Docs](https://upstash.com/docs)** - Redis & Vector DB guide

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Env Variables Not Loading

- Ensure `.env.local` is in the project root (not in `src/`)
- Restart dev server after updating `.env.local`
- Check that variable names match exactly

### Build Fails with TypeScript Errors

```bash
# Run type check manually
npx tsc --noEmit

# Fix errors or add `// @ts-ignore` as last resort
```

### API Key Errors

- Verify credentials are correct in `.env.local`
- Check that Groq/Upstash services are active
- For Groq: ensure you haven't exceeded rate limits
- For Upstash: verify database is not paused

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Features and API
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript reference
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility classes
- [Groq API](https://console.groq.com/docs/speech-text) - LLM inference

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

This project is part of the Digital Twin team research. Refer to the parent repository for licensing.

## ✅ Acceptance Criteria (From PRD)

- ✅ Core digital twin runs successfully
- ✅ At least one agent operates end-to-end
- ✅ Repository includes PRD, README, and agent documentation
- ⏳ Agent implementation (next phase)

---

**Last Updated:** January 20, 2026 | **Version:** 0.1.0
