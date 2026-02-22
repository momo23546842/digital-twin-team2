/**
 * Script to upload Rohan Sharma's resume data to PostgreSQL database
 * Reads connection details from .env.local and executes the schema.sql file
 * 
 * Usage: 
 *   tsx scripts/upload-resume-data.ts
 * or
 *   npx tsx scripts/upload-resume-data.ts
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const { Pool } = pg;

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

// Database configuration
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL or POSTGRES_URL not found in .env.local');
  process.exit(1);
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

async function uploadResumeData() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected to PostgreSQL database');
    console.log(`📍 Database: ${process.env.PGDATABASE || 'neondb'}`);
    console.log(`🖥️  Host: ${process.env.PGHOST || 'unknown'}\n`);

    // Read the SQL schema file
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    console.log(`📄 Reading schema from: ${schemaPath}`);
    
    const sqlContent = readFileSync(schemaPath, 'utf-8');
    console.log(`📊 Schema file size: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

    // Begin transaction
    console.log('🔄 Starting transaction...');
    await client.query('BEGIN');

    try {
      // Split SQL into individual statements (basic approach)
      // Remove comments and split by semicolons
      const statements = sqlContent
        .split('\n')
        .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
        .join('\n')
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
      
      let successCount = 0;
      let skipCount = 0;

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        // Skip empty statements
        if (!statement || statement.length < 5) {
          continue;
        }

        try {
          // Show progress for major operations
          if (statement.toUpperCase().includes('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i)?.[1];
            console.log(`  ✓ Creating table: ${tableName}`);
          } else if (statement.toUpperCase().includes('INSERT INTO')) {
            const tableName = statement.match(/INSERT INTO (\w+)/i)?.[1];
            if (tableName && !statement.toLowerCase().includes('select')) {
              process.stdout.write('.');
            }
          } else if (statement.toUpperCase().includes('CREATE INDEX')) {
            const indexName = statement.match(/CREATE INDEX (\w+)/i)?.[1];
            console.log(`  ✓ Creating index: ${indexName}`);
          } else if (statement.toUpperCase().includes('CREATE OR REPLACE VIEW')) {
            const viewName = statement.match(/CREATE OR REPLACE VIEW (\w+)/i)?.[1];
            console.log(`  ✓ Creating view: ${viewName}`);
          }

          await client.query(statement);
          successCount++;
        } catch (error: any) {
          // Skip errors for already existing objects
          if (error.code === '42P07' || // relation already exists
              error.code === '42710' || // object already exists
              error.code === '23505') {  // unique violation (data already inserted)
            skipCount++;
          } else {
            console.error(`\n❌ Error executing statement ${i + 1}:`, error.message);
            console.error(`Statement: ${statement.substring(0, 100)}...`);
            throw error;
          }
        }
      }

      // Commit transaction
      await client.query('COMMIT');
      console.log('\n\n✅ Transaction committed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   - Statements executed: ${successCount}`);
      console.log(`   - Statements skipped: ${skipCount}`);
      console.log(`   - Total: ${statements.length}`);

      // Verify data
      console.log('\n🔍 Verifying uploaded data...');
      
      const candidateResult = await client.query(
        'SELECT id, first_name, last_name, email, current_position FROM candidate_profile LIMIT 1'
      );
      
      if (candidateResult.rows.length > 0) {
        const candidate = candidateResult.rows[0];
        console.log(`   ✓ Candidate: ${candidate.first_name} ${candidate.last_name}`);
        console.log(`   ✓ Email: ${candidate.email}`);
        console.log(`   ✓ Position: ${candidate.current_position}`);
      }

      const skillsResult = await client.query(
        'SELECT COUNT(*) as count FROM skills WHERE candidate_id = 1'
      );
      console.log(`   ✓ Skills: ${skillsResult.rows[0].count}`);

      const experienceResult = await client.query(
        'SELECT COUNT(*) as count FROM work_experience WHERE candidate_id = 1'
      );
      console.log(`   ✓ Work Experience: ${experienceResult.rows[0].count}`);

      const projectsResult = await client.query(
        'SELECT COUNT(*) as count FROM projects WHERE candidate_id = 1'
      );
      console.log(`   ✓ Projects: ${projectsResult.rows[0].count}`);

      const educationResult = await client.query(
        'SELECT COUNT(*) as count FROM education WHERE candidate_id = 1'
      );
      console.log(`   ✓ Education: ${educationResult.rows[0].count}`);

      console.log('\n🎉 Resume data uploaded successfully!\n');

    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the upload
uploadResumeData().catch(console.error);
