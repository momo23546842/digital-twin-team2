/**
 * Database cleanup script
 * Removes expired cache entries, rate limit records, and ingestion metadata
 * 
 * Run periodically (e.g., via cron job or scheduled task)
 * 
 * Usage:
 *   npx tsx src/lib/cleanup-db.ts
 */

import { cleanupExpiredEntries } from "./db";
import { closeDatabase } from "./postgres";

async function main() {
  try {
    console.log("Starting database cleanup...");
    await cleanupExpiredEntries();
    console.log("✓ Database cleanup completed successfully!");
  } catch (error) {
    console.error("✗ Database cleanup failed:", error);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

main();
