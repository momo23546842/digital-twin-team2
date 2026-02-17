#!/usr/bin/env npx tsx
/**
 * Voice Cloning Script — ElevenLabs
 *
 * One-time script to upload audio samples and create a cloned voice.
 *
 * Usage:
 *   npx tsx scripts/clone-voice.ts --files sample1.mp3 sample2.mp3 --name "My Voice"
 *
 * Options:
 *   --files   One or more audio file paths (mp3, wav, m4a)
 *   --name    Display name for the cloned voice
 *
 * Requires:
 *   ELEVENLABS_API_KEY in .env.local (or environment)
 *
 * On success, prints the voice ID to save in .env.local as ELEVENLABS_VOICE_ID.
 */

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): { files: string[]; name: string } {
  const args = process.argv.slice(2);
  const files: string[] = [];
  let name = '';
  let mode: 'none' | 'files' | 'name' = 'none';

  for (const arg of args) {
    if (arg === '--files') {
      mode = 'files';
      continue;
    }
    if (arg === '--name') {
      mode = 'name';
      continue;
    }
    if (arg.startsWith('--')) {
      mode = 'none';
      continue;
    }

    switch (mode) {
      case 'files':
        files.push(arg);
        break;
      case 'name':
        name = name ? `${name} ${arg}` : arg;
        break;
    }
  }

  if (files.length === 0) {
    console.error('Error: No audio files specified. Use --files path1.mp3 path2.mp3');
    process.exit(1);
  }

  if (!name) {
    console.error('Error: No voice name specified. Use --name "My Voice"');
    process.exit(1);
  }

  return { files, name };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateFiles(filePaths: string[]): void {
  const supported = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.webm'];

  for (const filePath of filePaths) {
    const resolved = path.resolve(filePath);

    if (!fs.existsSync(resolved)) {
      console.error(`Error: File not found — ${resolved}`);
      process.exit(1);
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!supported.includes(ext)) {
      console.error(
        `Error: Unsupported format "${ext}" for ${filePath}. Supported: ${supported.join(', ')}`,
      );
      process.exit(1);
    }

    const stats = fs.statSync(resolved);
    const sizeMB = stats.size / (1024 * 1024);
    console.log(`  ✓ ${path.basename(filePath)} (${sizeMB.toFixed(1)} MB)`);
  }
}

// ---------------------------------------------------------------------------
// ElevenLabs API
// ---------------------------------------------------------------------------

async function cloneVoice(
  apiKey: string,
  name: string,
  filePaths: string[],
): Promise<string> {
  const form = new FormData();
  form.append('name', name);
  form.append('description', `Cloned voice "${name}" created via clone-voice script`);

  for (const filePath of filePaths) {
    const resolved = path.resolve(filePath);
    const buffer = fs.readFileSync(resolved);
    const blob = new Blob([buffer]);
    form.append('files', blob, path.basename(filePath));
  }

  console.log('\n⏳ Uploading to ElevenLabs...');

  const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: form,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `ElevenLabs API error (${res.status}): ${errorBody}`,
    );
  }

  const data = (await res.json()) as { voice_id: string };
  return data.voice_id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🎙️  ElevenLabs Voice Cloning Script\n');

  // Check API key
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      'Error: ELEVENLABS_API_KEY is not set.\n' +
        'Add it to .env.local or export it in your shell.',
    );
    process.exit(1);
  }
  console.log('✓ API key found');

  // Parse & validate
  const { files, name } = parseArgs();
  console.log(`\nVoice name : ${name}`);
  console.log(`Audio files: ${files.length}\n`);
  validateFiles(files);

  // Upload
  const voiceId = await cloneVoice(apiKey, name, files);

  // Done
  console.log('\n✅ Voice cloned successfully!\n');
  console.log(`   Voice ID : ${voiceId}`);
  console.log(`   Name     : ${name}`);
  console.log('\n👉 Add the following to your .env.local:\n');
  console.log(`   ELEVENLABS_VOICE_ID=${voiceId}\n`);
}

main().catch((err) => {
  console.error('\n❌ Voice cloning failed:\n');
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
