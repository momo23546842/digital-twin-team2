# PostgreSQL Migration Guide

This document outlines the migration from Upstash (Redis + Vector DB) to PostgreSQL with pgvector.

## Prerequisites

1. **PostgreSQL** installed (v12 or higher)
2. **pgvector extension** installed
3. A running PostgreSQL server with network access

## Installation Steps

### 1. Install PostgreSQL and pgvector

**On Windows (using PostgreSQL installer):**
```bash
# Download PostgreSQL from https://www.postgresql.org/download/windows/
# During installation, make sure to install pgAdmin for easy database management
```

**Using Docker (Recommended for development):**
```bash
docker run --name postgres-digital-twin \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=digital_twin \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16
```

### 2. Create Database and User

```sql
-- Connect to PostgreSQL as superuser, then run:
CREATE DATABASE digital_twin;

CREATE USER digital_twin_user WITH PASSWORD 'your_secure_password';

GRANT ALL PRIVILEGES ON DATABASE digital_twin TO digital_twin_user;

-- Connect to the digital_twin database and enable pgvector
\c digital_twin
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Environment Variables

Update your `.env.local` file:

```env
# Remove old Upstash variables:
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
