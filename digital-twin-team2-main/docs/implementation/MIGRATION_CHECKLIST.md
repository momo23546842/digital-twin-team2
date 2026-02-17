# PostgreSQL Migration Checklist

## Pre-Migration
- [ ] Read [POSTGRES_MIGRATION.md](POSTGRES_MIGRATION.md)
- [ ] Review [MIGRATION_IMPLEMENTATION.md](MIGRATION_IMPLEMENTATION.md)
- [ ] Backup current Upstash data (optional)
- [ ] Have PostgreSQL credentials ready

## Installation & Setup

### 1. PostgreSQL Server
- [ ] Install PostgreSQL (v12+)
- [ ] Install pgvector extension
  - [ ] If using Docker: `docker pull pgvector/pgvector`
  - [ ] If using local: `CREATE EXTENSION vector;`
- [ ] Create database: `CREATE DATABASE digital_twin;`
- [ ] Create user: `CREATE USER digital_twin_user WITH PASSWORD 'password';`
- [ ] Grant privileges

### 2. Application Setup
- [ ] Update `.env.local` with `DATABASE_URL`
  ```env
  DATABASE_URL=postgresql://digital_twin_user:password@localhost:5432/digital_twin
  ```
- [ ] Remove old Upstash env vars from `.env.local`
- [ ] Run `npm install` to install new dependencies
- [ ] Verify package.json has `pg` and `pgvector`

### 3. Database Initialization
- [ ] Run initialization script: `npx ts-node src/lib/init-db.ts`
- [ ] Verify all tables created:
  ```sql
  \dt
  ```
  Should show: `vectors`, `database_cache`, `ingestion_metadata`, `rate_limits`
- [ ] Verify indexes created:
  ```sql
  \di
  ```

## Testing

### 1. Basic Connectivity
- [ ] Test database connection:
  ```bash
  psql $DATABASE_URL
  ```
- [ ] Verify pgvector extension:
  ```sql
  SELECT * FROM pg_extension WHERE extname = 'vector';
  ```

### 2. Application Testing
- [ ] Start dev server: `npm run dev`
- [ ] Test document ingestion:
  ```bash
  curl -X POST http://localhost:3000/api/ingest \
    -H "Content-Type: application/json" \
    -d '{
      "documents": [{
        "id": "test-doc",
        "content": "This is a test document",
        "title": "Test"
      }]
    }'
  ```
- [ ] Verify vectors stored in database:
  ```sql
  SELECT id, content FROM vectors LIMIT 5;
  ```

### 3. RAG Testing
- [ ] Test chat with RAG:
  ```bash
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -H "x-user-id: test-user" \
    -d '{
      "messages": [{
        "role": "user",
        "content": "What is in your documents?"
      }]
    }'
  ```
- [ ] Verify vector similarity search works
- [ ] Verify RAG context included in response

### 4. Rate Limiting Testing
- [ ] Test rate limit enforcement
- [ ] Verify rate limit records in database:
  ```sql
  SELECT * FROM rate_limits;
  ```

### 5. Caching Testing
- [ ] Verify cache operations work
- [ ] Check cache table:
  ```sql
  SELECT key, expires_at FROM database_cache;
  ```

## Data Migration (If needed)

### Migrating from Upstash
- [ ] Export embeddings from Upstash Vector API
- [ ] Convert format to PostgreSQL insert statements
- [ ] Import using bulk insert:
  ```bash
  npx ts-node src/scripts/import-vectors.ts
  ```
- [ ] Verify all vectors imported

## Cleanup & Optimization

- [ ] Run cleanup script to test:
  ```bash
  npx ts-node src/lib/cleanup-db.ts
  ```
- [ ] Set up periodic cleanup (cron job or scheduler)
- [ ] Verify indexes are being used:
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM vectors 
  ORDER BY embedding <-> '[...]'::vector 
  LIMIT 5;
  ```

## Production Deployment

### Pre-Deployment
- [ ] Test application with realistic data volume
- [ ] Performance test vector similarity search
- [ ] Set up monitoring/logging
- [ ] Create database backup strategy

### Deployment
- [ ] Set `DATABASE_URL` in production environment
- [ ] Run initialization script on production: `npx ts-node src/lib/init-db.ts`
- [ ] Set up SSL connection: `sslmode=require`
- [ ] Configure connection pooling settings
- [ ] Deploy application
- [ ] Monitor error logs

### Post-Deployment
- [ ] Monitor database performance
- [ ] Set up automated backups
- [ ] Schedule cleanup script (daily/weekly)
- [ ] Monitor storage usage
- [ ] Set up query performance monitoring

## Troubleshooting

### Connection Issues
- [ ] Verify DATABASE_URL format
- [ ] Check PostgreSQL is running: `pg_isready -h localhost`
- [ ] Verify user credentials and permissions
- [ ] Check firewall/network access

### Performance Issues
- [ ] Rebuild indexes: `REINDEX INDEX vectors_embedding_idx;`
- [ ] Analyze query plans: `EXPLAIN ANALYZE`
- [ ] Check table statistics: `ANALYZE vectors;`
- [ ] Monitor slow queries (enable slow query log)

### Data Issues
- [ ] Verify vector dimensions (should be 1536)
- [ ] Check for NULL embeddings: `SELECT COUNT(*) FROM vectors WHERE embedding IS NULL;`
- [ ] Verify metadata is valid JSON

## Rollback Plan

If critical issues arise:
1. Stop application
2. Keep PostgreSQL backup
3. Switch back to Upstash credentials in `.env.local`
4. Restore old dependencies in package.json
5. Run `npm install`
6. Restart application

## Maintenance

### Regular Tasks
- [ ] Daily: Monitor error logs
- [ ] Daily: Run cleanup script
- [ ] Weekly: Check database size and growth
- [ ] Weekly: Analyze query performance
- [ ] Monthly: Vacuum and analyze tables
- [ ] Monthly: Backup verification

### Monitoring Queries

Check database size:
```sql
SELECT pg_size_pretty(pg_database_size('digital_twin'));
```

Check table sizes:
```sql
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

Check active connections:
```sql
SELECT count(*) FROM pg_stat_activity;
```

## Sign-Off

- [ ] All tests passed
- [ ] Performance acceptable
- [ ] Team trained on new system
- [ ] Documentation updated
- [ ] Ready for production

---

**Migration Date:** _____________
**Completed By:** _____________
**Approved By:** _____________
