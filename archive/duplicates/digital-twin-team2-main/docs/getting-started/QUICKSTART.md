# ⚡ Quick Start Guide - 5 Minutes

Get Digital Twin running locally in 5 minutes or less!

> **👉 New to the project?** Read [README.md](./README.md) first (2 min)

---

## ✅ Prerequisites

Before you start, ensure you have:

- **Node.js 18+** ([Download](https://nodejs.org))
- **PostgreSQL 12+** or Docker installed ([Get Docker](https://www.docker.com))
- **Groq API Key** (Free tier available at [console.groq.com](https://console.groq.com))

---

## 🚀 Setup Steps (5 Min Total)

### Step 1: Start PostgreSQL (1 min)

**Option A: Docker (Easiest)**
```bash
docker run --name postgres-dt \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=digital_twin \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16
```

**Option B: Local PostgreSQL**
```sql
CREATE DATABASE digital_twin;
CREATE USER digital_twin_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE digital_twin TO digital_twin_user;
-- Connect to digital_twin database
\c digital_twin
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 2: Configure Application (1 min)

```bash
# Navigate to digital-twin folder
cd digital-twin

# Copy env template
cp .env.example .env.local

# Edit .env.local - Add your credentials:
```

Edit `.env.local`:
```env
DATABASE_URL=postgresql://digital_twin_user:password@localhost:5432/digital_twin
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Step 3: Install & Initialize (2 min)

```bash
# Install dependencies
npm install

# Initialize database and create tables
npx ts-node src/lib/init-db.ts
```

### Step 4: Start Development Server (1 min)

```bash
npm run dev
```

Open http://localhost:3000 in your browser. Done! 🎉

---

## ✨ What You Get

- ✅ AI chat interface with voice support
- ✅ PostgreSQL vector database for document storage
- ✅ Admin dashboard for monitoring
- ✅ Real-time conversations with persistent memory

---

## 🧪 Quick Test

### Test the Chat API
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Hello! Who are you?"
    }]
  }'
```

### Test Document Ingestion
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [{
      "id": "doc-1",
      "content": "Your document content here",
      "title": "Document Title"
    }]
  }'
```

---

## 📋 What Was Implemented

This project uses:

| Component | Technology | Why |
|-----------|-----------|-----|
| **Framework** | Next.js 16 | Full-stack JavaScript with TypeScript |
| **Backend** | Node.js API Routes | Real-time processing |
| **Database** | PostgreSQL + pgvector | Vector embeddings + relational data |
| **AI Engine** | Groq API | Sub-second response times |
| **Frontend** | React + Tailwind | Responsive UI with voice |
| **Deployment** | Vercel | Serverless deployment |

---

## 🆘 Troubleshooting

### "Cannot connect to database"
```bash
# Check database is running
docker ps  # Should show postgres-dt container

# Verify DATABASE_URL in .env.local
# Should be: postgresql://user:password@localhost:5432/digital_twin
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### "GROQ_API_KEY is not set"
```bash
# Make sure .env.local has:
GROQ_API_KEY=your_actual_api_key_here

# Get key from: https://console.groq.com/keys
```

### "Port 3000 already in use"
```bash
# Use different port
npm run dev -- -p 3001
```

---

## 📚 Next Steps

1. **Explore the UI** - Chat with the AI at http://localhost:3000
2. **Read Full Guide** - [00_READ_ME_FIRST.md](./00_READ_ME_FIRST.md)
3. **Understand Architecture** - [../implementation/MIGRATION_IMPLEMENTATION.md](../implementation/MIGRATION_IMPLEMENTATION.md)
4. **Deploy** - [../database/POSTGRES_MIGRATION.md](../database/POSTGRES_MIGRATION.md#production-deployment)

---

## 📖 Full Documentation

- Complete setup: [00_READ_ME_FIRST.md](./00_READ_ME_FIRST.md)
- Database guide: [../database/POSTGRES_MIGRATION.md](../database/POSTGRES_MIGRATION.md)
- Security info: [../security/SECURITY.md](../security/SECURITY.md)
- Deployment checklist: [../implementation/MIGRATION_CHECKLIST.md](../implementation/MIGRATION_CHECKLIST.md)
- All docs: [../INDEX.md](../INDEX.md)

---

**Started:** February 17, 2026  
**Version:** 1.0  
**Status:** Production Ready ✅

### API Endpoints (No Changes Needed)
- `/api/ingest` - Still works the same way ✓
- `/api/chat` - Still works the same way ✓
- Rate limiting - Automatic ✓

### Database Behind the Scenes
| Feature | Before | After |
|---------|--------|-------|
| Vector Storage | Upstash Vector API | PostgreSQL + pgvector |
| Rate Limiting | Redis | PostgreSQL table |
| Caching | Redis | PostgreSQL table |
| Initialization | None | Run `init-db.ts` once |

### Performance
- ✅ Vector search: Same speed (uses IVFFlat indexing)
- ✅ API endpoints: No noticeable difference
- ✅ Database operations: Actually faster (local)

## Configuration

### Environment Variables

Remove these:
```bash
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
UPSTASH_VECTOR_REST_URL
UPSTASH_VECTOR_REST_TOKEN
```

Add this:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

### Connection String Format
```
postgresql://username:password@hostname:port/database
```

Examples:
- Local: `postgresql://digital_twin_user:password@localhost:5432/digital_twin`
- Docker: `postgresql://postgres:password@localhost:5432/digital_twin`
- Remote: `postgresql://user:password@db.example.com:5432/db?sslmode=require`

## Database Structure

### Tables Created Automatically

**vectors** - Stores embeddings
```
id (text) → vector ID like "doc-1-chunk-0"
embedding (vector) → 1536-dimensional vector
content (text) → Document chunk content
metadata (jsonb) → Author, source, title, etc.
```

**rate_limits** - Tracks API calls
```
key (text) → "rate-limit:user-id"
count (int) → Number of requests
expires_at (timestamp) → When this limit expires
```

**database_cache** - Caching layer
```
key (text) → Cache key
value (text) → Cached value (JSON)
expires_at (timestamp) → Expiration time
```

**ingestion_metadata** - Tracks uploads
```
id (text) → Ingest job ID
user_id (text) → User identifier
document_count (int) → Number of docs ingested
documents (jsonb) → Document list
```

## Troubleshooting

### "Connection refused"
```bash
# Check PostgreSQL is running
psql postgresql://localhost/digital_twin

# If using Docker
docker ps | grep postgres
```

### "Extension vector not found"
```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```

### "Database does not exist"
```bash
# Reinitialize
npx ts-node src/lib/init-db.ts
```

### "Rate limit not working"
- Check `rate_limits` table has data
- Verify user header is being sent: `x-user-id: value`

### Slow vector search
```sql
-- Rebuild index
REINDEX INDEX vectors_embedding_idx;

-- Check if index is being used
EXPLAIN ANALYZE 
SELECT * FROM vectors 
ORDER BY embedding <-> '[...]'::vector LIMIT 5;
```

## Regular Maintenance

### Weekly
```bash
# Clean up expired entries
npx ts-node src/lib/cleanup-db.ts
```

### Monthly
```sql
-- Analyze table statistics (helps query planner)
ANALYZE vectors;
ANALYZE rate_limits;

-- Check database size
SELECT pg_size_pretty(pg_database_size('digital_twin'));
```

## Need Help?

1. **Setup Issues?** → Read [POSTGRES_MIGRATION.md](POSTGRES_MIGRATION.md)
2. **Technical Details?** → See [MIGRATION_IMPLEMENTATION.md](MIGRATION_IMPLEMENTATION.md)
3. **Deployment?** → Check [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md)

## Next Steps

1. ✅ Set up PostgreSQL
2. ✅ Update `.env.local` with DATABASE_URL
3. ✅ Run `npm install`
4. ✅ Initialize database: `npx ts-node src/lib/init-db.ts`
5. ✅ Start app: `npm run dev`
6. ✅ Test endpoints
7. ✅ Deploy to production

## Removing Old Files

Once everything is working, you can safely delete:
```bash
# These are replaced by new modules
rm digital-twin/src/lib/redis.ts
rm digital-twin/src/lib/vector.ts
```

The old files won't be imported anymore after the migration.

## Rollback

If you need to go back to Upstash:
1. Keep your PostgreSQL backup
2. Restore old files from git
3. Reinstall old dependencies: `npm install`
4. Restore old env vars
5. Restart app

## Key Takeaways

| Aspect | Before | After |
|--------|--------|-------|
| **Number of Services** | 2 (Redis + Vector) | 1 (PostgreSQL) |
| **Setup Complexity** | High | Medium |
| **Cost** | Upstash pricing | Fixed PostgreSQL |
| **Data Persistence** | No | Yes ✓ |
| **Self-hosted** | No | Yes ✓ |
| **Latency** | Network | Local (faster) |

**You're all set!** Your application now uses PostgreSQL instead of Upstash. 🎉

---

**Questions?** Check the detailed guides linked above or review the implementation files.
