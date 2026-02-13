/**
 * Database cleanup script
 * Removes expired cache entries, rate limit records, and ingestion metadata
 * 
 * Run periodically (e.g., via cron job or scheduled task)
 * 
 * Usage:
 *   npx ts-node --skip-project src/lib/cleanup-db.ts
 */

import { cleanupExpiredEntries, closeDatabase } from "./postgres";

async function main() {
  try {
    console.log("Starting database cleanup...");
    await cleanupExpiredEntries();
    console.log("✓ Database cleanup completed successfully!");
  } catch (error) {
    console.error("✗ Database cleanup failed:", error);
    process.exit(1);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

main();
