# 🗄️ PostgreSQL Migration & Setup Guide

Complete guide for migrating from Upstash to PostgreSQL with pgvector for vector embeddings.

> **Quick Start?** Go to [../getting-started/QUICKSTART.md](../getting-started/QUICKSTART.md) for 5-minute setup

---

## 📋 Prerequisites

- **PostgreSQL** 12+ or Docker installed
- **pgvector** extension (comes with Docker image)
- Node.js 18+ installed
- Groq API key (from [console.groq.com](https://console.groq.com))

---

## 🚀 Installation (Choose One)

### Option A: Docker (Easiest - Recommended)

**1. Start PostgreSQL container:**
```bash
docker run --name postgres-digital-twin \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=digital_twin \
  -e POSTGRES_INITDB_ARGS="-c max_parallel_workers_per_gather=4" \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16
```

**2. Verify it's running:**
```bash
docker ps  # Should show postgres-digital-twin running
```

**3. Test connection:**
```bash
docker exec -it postgres-digital-twin psql -U postgres -d digital_twin
# Type: \dt  (to see tables)
# Type: \q   (to quit)
```

### Option B: Windows (Local PostgreSQL)

**1. Download & Install:**
- Visit https://www.postgresql.org/download/windows/
- Install PostgreSQL 12 or higher
- Remember the admin password

**2. Open PostgreSQL Command Line:**
```bash
psql -U postgres
```

**3. Create database and pgvector:**
```sql
CREATE DATABASE digital_twin;
CREATE USER digital_twin_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE digital_twin TO digital_twin_user;

-- Connect to the new database
\c digital_twin

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```

### Option C: macOS (Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@16 pgvector

# Start service
brew services start postgresql@16

# Create database
createdb digital_twin

# Connect and setup
psql digital_twin
```

---

## ⚙️ Configuration

### Step 1: Set Environment Variables

Create or update `.env.local` in the `digital-twin` folder:

```env
# Database Connection
DATABASE_URL=postgresql://digital_twin_user:yourpassword@localhost:5432/digital_twin

# Groq AI API
GROQ_API_KEY=gsk_your_api_key_here

# Application URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# (Optional) JWT Secret for authentication
JWT_SECRET=your_random_secret_key_here

# (Optional) Rate limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
```

### Step 2: Verify Connection

```bash
# Test connection string
psql postgresql://digital_twin_user:yourpassword@localhost:5432/digital_twin

# You should see: digital_twin=>
# Type: \q to exit
```

---

## 🔧 Initialize Database

### Run Initialization Script

```bash
cd digital-twin
npm install
npx ts-node src/lib/init-db.ts
```

### What Gets Created

The initialization script creates these tables:

**1. `vectors` table** - Stores document embeddings
```sql
CREATE TABLE vectors (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**2. `database_cache` table** - Caching layer
```sql
CREATE TABLE database_cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**3. `rate_limits` table** - API rate limiting
```sql
CREATE TABLE rate_limits (
  user_id TEXT,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP,
  PRIMARY KEY (user_id, window_start)
);
```

**4. `ingestion_metadata` table** - Tracks document ingestion
```sql
CREATE TABLE ingestion_metadata (
  id TEXT PRIMARY KEY,
  source TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Verify Tables Were Created

```bash
# Connect to database
psql postgresql://digital_twin_user:yourpassword@localhost:5432/digital_twin

# List tables
\dt

# Should show:
# vectors
# database_cache  
# rate_limits
# ingestion_metadata
```

---

## 📊 Installation Steps
# UPSTASH_REDIS_REST_URL=...
# UPSTASH_REDIS_REST_TOKEN=...
# UPSTASH_VECTOR_REST_URL=...
# UPSTASH_VECTOR_REST_TOKEN=...

# Add PostgreSQL connection string
DATABASE_URL=postgresql://digital_twin_user:your_secure_password@localhost:5432/digital_twin

# For production, use full connection string:
# DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### 4. Install Dependencies

```bash
cd digital-twin
npm install
```

This installs:
- `pg`: PostgreSQL client for Node.js
- `pgvector`: Vector support for PostgreSQL

### 5. Initialize Database Schema

```bash
# Initialize tables and indexes
npx ts-node src/lib/init-db.ts
```

Or using npm script (if added):
```bash
npm run init:db
```

### 6. Update package.json Scripts (Optional)

Add to `scripts` section:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "init:db": "ts-node src/lib/init-db.ts",
  "cleanup:db": "ts-node src/lib/cleanup-db.ts"
}
```

## Migration Path

### Phase 1: Code Changes (COMPLETED)
- ✅ Updated `package.json` with PostgreSQL dependencies
- ✅ Created `src/lib/postgres.ts` (vector operations)
- ✅ Created `src/lib/db.ts` (cache/session operations)
- ✅ Created `src/lib/rateLimit.ts` (rate limiting)
- ✅ Updated API routes to use PostgreSQL
- ✅ Removed Upstash imports

### Phase 2: Data Migration (OPTIONAL)
If you have existing data in Upstash:

```typescript
// Export data from Upstash (if needed)
// Import into PostgreSQL using bulk insert
```

### Phase 3: Testing
```bash
# Start development server
npm run dev

# Test endpoints:
# POST http://localhost:3000/api/ingest
# POST http://localhost:3000/api/chat
```

## Database Schema

### Tables Created

#### 1. `vectors`
- Stores embeddings with metadata
- Uses pgvector for cosine similarity search
- Indexes: `vectors_embedding_idx` (IVFFlat for performance)

```sql
CREATE TABLE vectors (
  id TEXT PRIMARY KEY,
  embedding vector(1536) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `database_cache`
- Replaces Redis for general caching
- Supports TTL with `expires_at`

```sql
CREATE TABLE database_cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `ingestion_metadata`
- Tracks document uploads
- Stores document metadata

```sql
CREATE TABLE ingestion_metadata (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  document_count INTEGER NOT NULL,
  documents JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `rate_limits`
- Manages API rate limiting per user
- Auto-cleanup of expired entries

```sql
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Connection Issues
```bash
# Test PostgreSQL connection
psql postgresql://user:password@localhost:5432/digital_twin

# Check if pgvector is installed
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Performance Tuning

If experiencing slow vector searches:
```sql
-- Rebuild index
REINDEX INDEX vectors_embedding_idx;

-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM vectors 
ORDER BY embedding <-> '[...]'::vector 
LIMIT 5;
```

### Cleanup Expired Data

The database accumulates expired entries. Run periodically:
```bash
npx ts-node src/lib/cleanup-db.ts
```

Or setup a cron job in your application.

## Comparison: Upstash vs PostgreSQL

| Feature | Upstash | PostgreSQL |
|---------|---------|------------|
| Cost | Serverless pricing | Fixed monthly cost |
| Latency | Network latency | Local/fast |
| Vector Support | Upstash Vector only | pgvector extension |
| Rate Limiting | Redis native | Custom implementation |
| Caching | Built-in | Custom implementation |
| Data Persistence | No | Yes |
| Self-hosted | No | Yes |

## Next Steps

1. Set up PostgreSQL database
2. Configure `DATABASE_URL` environment variable
3. Run `npm run init:db`
4. Test API endpoints
5. Deploy to production
6. Monitor performance and optimize indexes as needed

## References

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pg Node.js Client](https://node-postgres.com/)
- [Docker PostgreSQL Images](https://hub.docker.com/_/postgres)
