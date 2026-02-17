# PostgreSQL Migration - Implementation Summary

## Overview
Successfully migrated the Digital Twin application from Upstash (Redis + Vector DB) to PostgreSQL with pgvector extension.

## Files Created

### New Library Modules
1. **[src/lib/postgres.ts](src/lib/postgres.ts)** - PostgreSQL connection and vector operations
   - `initializeDatabase()` - Create tables and indexes
   - `upsertVectors()` - Insert/update embeddings
   - `querySimilarVectors()` - Cosine similarity search
   - `getVector()` - Fetch vector by ID
   - `deleteVectors()` - Delete vectors by IDs
   - `closeDatabase()` - Clean connection pool

2. **[src/lib/db.ts](src/lib/db.ts)** - General database utilities (replaces redis.ts)
   - `setDatabaseValue()` - Store values with optional TTL
   - `getDatabaseValue()` - Retrieve cached values
   - `deleteDatabaseValue()` - Remove cached values
   - `cleanupExpiredEntries()` - Remove expired records

3. **[src/lib/rateLimit.ts](src/lib/rateLimit.ts)** - Rate limiting (replaces redis rate limiting)
   - `checkRateLimit()` - Check if request is within limits
   - `getRateLimitCount()` - Get current count
   - `resetRateLimit()` - Reset user limits

4. **[src/lib/init-db.ts](src/lib/init-db.ts)** - Database initialization script
5. **[src/lib/cleanup-db.ts](src/lib/cleanup-db.ts)** - Expired data cleanup script

### Configuration Files
1. **[POSTGRES_MIGRATION.md](POSTGRES_MIGRATION.md)** - Complete migration guide
2. **[.env.local.example](.env.local.example)** - Environment variable template

## Files Modified

### API Routes
1. **[src/app/api/ingest/route.ts](src/app/api/ingest/route.ts)**
   - Changed imports from `@upstash/vector` → `postgres`
   - Changed imports from `redis.ts` → `db.ts`
   - Updated `upsertVectors()` call to use PostgreSQL
   - Updated `setRedisValue()` → `setDatabaseValue()`

2. **[src/app/api/chat/route.ts](src/app/api/chat/route.ts)**
   - Changed imports from `@upstash/redis` → `rateLimit.ts`
   - Changed imports from `@upstash/vector` → `postgres`
   - Updated `checkRateLimit()` to use PostgreSQL

### Dependencies
- **[package.json](package.json)**
  - Removed: `@upstash/redis`, `@upstash/vector`
  - Added: `pg`, `pgvector`

## Database Schema

### Tables Created

```sql
-- Vector embeddings storage
CREATE TABLE vectors (
  id TEXT PRIMARY KEY,
  embedding vector(1536),
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- General caching (replaces Redis)
CREATE TABLE database_cache (
  key TEXT PRIMARY KEY,
  value TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Ingestion metadata tracking
CREATE TABLE ingestion_metadata (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  document_count INTEGER,
  documents JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Rate limiting
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Indexes
- `vectors_embedding_idx` - IVFFlat index for fast cosine similarity search
- `ingestion_metadata_user_idx` - User ID lookup
- `rate_limits_expires_idx` - Cleanup queries

## Environment Variables

**Old (Upstash):**
```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
UPSTASH_VECTOR_REST_URL=...
UPSTASH_VECTOR_REST_TOKEN=...
```

**New (PostgreSQL):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/digital_twin
```

## Setup Instructions

### 1. Install PostgreSQL
```bash
# Docker (recommended for dev)
docker run --name postgres-digital-twin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=digital_twin \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16

# Or use local PostgreSQL installation
```

### 2. Create Database
```sql
CREATE DATABASE digital_twin;
CREATE USER digital_twin_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE digital_twin TO digital_twin_user;
```

### 3. Install Dependencies
```bash
cd digital-twin
npm install
```

### 4. Initialize Database Schema
```bash
npx ts-node src/lib/init-db.ts
```

### 5. Configure Environment
```bash
# Update .env.local with DATABASE_URL
DATABASE_URL=postgresql://digital_twin_user:password@localhost:5432/digital_twin
```

### 6. Run Application
```bash
npm run dev
```

## Key Changes in Functionality

### Vector Search
- **Before:** REST API calls to Upstash
- **After:** Direct SQL queries with `<->` operator for cosine similarity

### Caching & Sessions
- **Before:** Redis key-value store
- **After:** PostgreSQL table with TTL support

### Rate Limiting
- **Before:** Redis INCR operations
- **After:** PostgreSQL counter with expiration

## Performance Considerations

### Advantages
- ✅ Single database (no need for multiple services)
- ✅ Automatic data persistence
- ✅ Better for self-hosted deployments
- ✅ Full control over infrastructure

### Trade-offs
- ⚠️ Slightly higher latency than in-memory Redis (negligible for most use cases)
- ⚠️ Requires database administration
- ⚠️ Manual optimization of indexes needed for scale

### Optimization Tips
- Use IVFFlat indexes for vector similarity (default)
- Run cleanup script regularly to remove expired data
- Monitor query performance with EXPLAIN ANALYZE
- Adjust pool size in postgres.ts based on load

## Rollback Instructions

If you need to revert to Upstash:

1. Restore original `redis.ts` and `vector.ts`
2. Restore original imports in API routes
3. Restore Upstash dependencies in package.json
4. `npm install`
5. Update environment variables back to Upstash credentials

## Testing Checklist

- [ ] Database connection successful
- [ ] All tables created
- [ ] Document ingestion works
- [ ] Vector search returns results
- [ ] Chat API works with RAG
- [ ] Rate limiting works
- [ ] Expired data cleanup works

## Support & Resources

- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [pg Node.js Driver](https://node-postgres.com/)
- [IVFFlat Index Documentation](https://github.com/pgvector/pgvector#indexing)

## Future Enhancements

1. **Connection Pooling**: Consider using pgBouncer for production
2. **Replication**: Set up PostgreSQL streaming replication for high availability
3. **Backups**: Implement automated backup strategy
4. **Monitoring**: Add query performance monitoring
5. **Migrations**: Use a migration framework like Drizzle ORM for schema management
