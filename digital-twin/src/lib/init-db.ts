/**
 * Database initialization script
 * Run this once to set up PostgreSQL tables
 * 
 * Usage: 
 *   npx tsx src/lib/init-db.ts
 */

import { config } from "dotenv";
import { initializeDatabase, closeDatabase } from "./postgres";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
  try {
    console.log("Initializing PostgreSQL database...");
    await initializeDatabase();
    console.log("✓ Database initialized successfully!");
  } catch (error) {
    console.error("✗ Database initialization failed:", error);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

main();
