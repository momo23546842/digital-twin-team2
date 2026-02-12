/**
 * Database cleanup script
 * Removes expired cache entries, rate limit records, and ingestion metadata
 * 
 * Run periodically (e.g., via cron job or scheduled task)
 * 
 * Usage:
 *   npx ts-node --skip-project src/lib/cleanup-db.ts
 */

<<<<<<< HEAD
import { cleanupExpiredEntries } from "./db";
import { closeDatabase } from "./postgres";
=======
import { cleanupExpiredEntries, closeDatabase } from "./postgres";
>>>>>>> origin/main

async function main() {
  try {
    console.log("Starting database cleanup...");
    await cleanupExpiredEntries();
    console.log("✓ Database cleanup completed successfully!");
  } catch (error) {
    console.error("✗ Database cleanup failed:", error);
<<<<<<< HEAD
    process.exitCode = 1;
  } finally {
    await closeDatabase();
=======
    process.exit(1);
  } finally {
    await closeDatabase();
    process.exit(0);
>>>>>>> origin/main
  }
}

main();
