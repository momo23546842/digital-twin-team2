# Database Upload Scripts

Scripts to upload Rohan Sharma's resume data to PostgreSQL database using the connection details from `.env.local`.

## Available Scripts

### 1. TypeScript Version (Recommended for Node.js projects)

**File:** `upload-resume-data.ts`

**Prerequisites:**
```bash
# Install required packages
pnpm add -D pg @types/pg tsx dotenv
# or
npm install --save-dev pg @types/pg tsx dotenv
```

**Usage:**
```bash
# Using tsx (recommended)
npx tsx scripts/upload-resume-data.ts

# Or using ts-node
npx ts-node scripts/upload-resume-data.ts

# Or add to package.json scripts
pnpm run upload-resume-data
```

### 2. Python Version

**File:** `upload-resume-data.py`

**Prerequisites:**
```bash
# Install required packages
pip install psycopg2-binary python-dotenv
# or
pip3 install psycopg2-binary python-dotenv
```

**Usage:**
```bash
python scripts/upload-resume-data.py
# or
python3 scripts/upload-resume-data.py
```

## What These Scripts Do

1. ✅ Load database connection details from `.env.local`
2. ✅ Connect to PostgreSQL (Neon) database
3. ✅ Read and parse `database/schema.sql`
4. ✅ Execute all SQL statements in a transaction
5. ✅ Create tables, indexes, and views
6. ✅ Insert Rohan Sharma's complete resume data
7. ✅ Verify the uploaded data
8. ✅ Handle errors gracefully (rollback on failure)

## Database Schema

The script uploads the following data:

- **Profile:** Personal information, career objective, professional summary
- **Skills:** 23+ technical skills across 5 categories
- **Competencies:** 6 professional competencies
- **Work Experience:** 3 positions with detailed highlights
- **Education:** 2 degrees (Master's in ERP, Bachelor's in Electrical Engineering)
- **Certifications:** 5 professional certifications
- **Projects:** 4 major projects with tags
- **Additional Info:** Visa status, relocation preferences

## Troubleshooting

### Connection Issues
```bash
# Verify your .env.local has DATABASE_URL or POSTGRES_URL
cat .env.local | grep DATABASE_URL
```

### Already Exists Errors
The scripts skip errors for objects that already exist. If you want to reset:
```sql
-- Drop all tables (WARNING: This deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

### SSL Certificate Errors
The scripts are configured to work with Neon's SSL requirements. If you encounter SSL issues, check your connection string includes `?sslmode=require`.

## Adding to package.json

Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "db:upload": "tsx scripts/upload-resume-data.ts",
    "db:upload:py": "python3 scripts/upload-resume-data.py"
  }
}
```

Then run:
```bash
pnpm run db:upload
```

## Environment Variables Required

From `.env.local`:
- `DATABASE_URL` or `POSTGRES_URL` - PostgreSQL connection string
- `PGHOST` - Database host (optional, for display)
- `PGDATABASE` - Database name (optional, for display)

## Output Example

```
🚀 Starting Resume Data Upload
============================================================
✅ Loaded environment from: .env.local
📄 Reading schema from: database/schema.sql
📊 Schema file size: 25.43 KB

📝 Found 156 SQL statements to execute

🔌 Connecting to PostgreSQL database...
✅ Connected successfully
📍 Database: neondb
🖥️  Host: ep-flat-credit-ai8bv5dy-pooler.c-4.us-east-1.aws.neon.tech

🔄 Executing SQL statements...

  ✓ Creating table: candidate_profile
  ✓ Creating table: contact_info
  ✓ Creating table: skill_categories
  ...
  
✅ Transaction committed successfully!
📊 Summary:
   - Statements executed: 156
   - Statements skipped: 0
   - Total: 156

🔍 Verifying uploaded data...
   ✓ Candidate: Rohan Sharma
   ✓ Email: rohan.sha1989@gmail.com
   ✓ Position: Derivative Analyst / Algo Trading Developer
   ✓ Skills: 23
   ✓ Work Experience: 3
   ✓ Projects: 4
   ✓ Education: 2

🎉 Resume data uploaded successfully!
```
