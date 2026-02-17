/**
 * Voice Cloning Script
 *
 * Clones your voice using ElevenLabs Instant Voice Cloning (IVC).
 *
 * Usage:
 *   npx tsx scripts/clone-voice.ts --files recording1.mp3 recording2.mp3 --name "My Voice"
 *
 * After running, copy the output voice ID into your .env.local:
 *   ELEVENLABS_VOICE_ID=<voice_id>
 */

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import dotenv from "dotenv";

// Load env vars from .env.local (same as Next.js)
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ---------------------------------------------------------------------------
// Parse CLI arguments
// ---------------------------------------------------------------------------
function parseArgs(): { files: string[]; name: string } {
  const args = process.argv.slice(2);
  const files: string[] = [];
  let name = "My Cloned Voice";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--files") {
      i++;
      while (i < args.length && !args[i].startsWith("--")) {
        files.push(args[i]);
        i++;
      }
      i--; // compensate for the for-loop increment
    } else if (args[i] === "--name") {
      i++;
      name = args[i] ?? name;
    }
  }

  if (files.length === 0) {
    console.error("❌ No audio files provided.");
    console.error("");
    console.error("Usage:");
    console.error('  npx tsx scripts/clone-voice.ts --files path1.mp3 path2.mp3 --name "My Voice"');
    process.exit(1);
  }

  return { files, name };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const { files, name } = parseArgs();

  console.log("🎙️  ElevenLabs Voice Cloning");
  console.log("─".repeat(40));
  console.log(`  Name:  ${name}`);
  console.log(`  Files: ${files.length}`);
  console.log("");

  // Validate API key
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("❌ ELEVENLABS_API_KEY not found in .env.local");
    process.exit(1);
  }
  console.log("✅ API key loaded");

  // Validate files exist
  for (const filePath of files) {
    const resolved = path.resolve(filePath);
    if (!existsSync(resolved)) {
      console.error(`❌ File not found: ${resolved}`);
      process.exit(1);
    }
    const size = statSync(resolved).size;
    const sizeMb = (size / 1024 / 1024).toFixed(2);
    console.log(`✅ ${path.basename(resolved)} (${sizeMb} MB)`);
  }
  console.log("");

  // Create client
  const client = new ElevenLabsClient({ apiKey });

  // Upload and clone
  console.log("⏳ Uploading audio samples and cloning voice...");

  try {
    const streams = files.map((f) => createReadStream(path.resolve(f)));

    const response = await client.voices.ivc.create({
      name,
      files: streams,
      description: `Voice clone created on ${new Date().toISOString().split("T")[0]}`,
      removeBackgroundNoise: true,
    });

    console.log("");
    console.log("─".repeat(40));
    console.log("🎉 Voice cloned successfully!");
    console.log("");
    console.log(`  Voice ID: ${response.voiceId}`);
    console.log(`  Requires verification: ${response.requiresVerification}`);
    console.log("");
    console.log("📋 Add this to your .env.local:");
    console.log("");
    console.log(`  ELEVENLABS_VOICE_ID=${response.voiceId}`);
    console.log("");
  } catch (error: any) {
    console.error("");
    console.error("❌ Voice cloning failed:");
    console.error(error?.message ?? error);

    if (error?.statusCode) {
      console.error(`  Status: ${error.statusCode}`);
    }
    if (error?.body) {
      console.error("  Details:", JSON.stringify(error.body, null, 2));
    }

    process.exit(1);
  }
}

main();
