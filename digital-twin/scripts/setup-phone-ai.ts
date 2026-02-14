#!/usr/bin/env npx tsx
/**
 * Phone AI Setup Script
 *
 * One-time script to provision a Vapi assistant and phone number.
 *
 * Usage:
 *   npx tsx scripts/setup-phone-ai.ts
 *
 * Requires in .env.local:
 *   VAPI_API_KEY          — Vapi dashboard API key
 *   GROQ_API_KEY          — Groq API key (used by the assistant)
 *   ELEVENLABS_VOICE_ID   — ElevenLabs voice (run clone-voice.ts first)
 *
 * Optional (skips purchase if already set):
 *   VAPI_ASSISTANT_ID
 *   VAPI_PHONE_NUMBER_ID
 *
 * For phone number purchase via Twilio also set:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER
 */

import { config } from 'dotenv';
import path from 'path';

// Load .env.local before anything that reads process.env
config({ path: path.resolve(process.cwd(), '.env.local') });

import {
  getOrCreateAssistant,
  getOrPurchasePhoneNumber,
} from '../src/lib/vapi.js';

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🤖 Phone AI Setup\n');

  // ---- Preflight checks ---------------------------------------------------
  if (!process.env.VAPI_API_KEY) {
    console.error('Error: VAPI_API_KEY is not set in .env.local');
    process.exit(1);
  }
  console.log('✓ VAPI_API_KEY found');

  if (!process.env.ELEVENLABS_VOICE_ID) {
    console.warn(
      '⚠ ELEVENLABS_VOICE_ID not set — assistant will use the default voice.\n' +
        '  Run  npx tsx scripts/clone-voice.ts  first to clone your voice.\n',
    );
  }

  // ---- Step 1: Assistant ---------------------------------------------------
  let assistantId = process.env.VAPI_ASSISTANT_ID?.trim();

  if (assistantId) {
    console.log(`\n✓ Using existing assistant: ${assistantId}`);
  } else {
    console.log('\n⏳ Creating Vapi assistant...');
    const assistant = await getOrCreateAssistant();
    assistantId = assistant.id;
    console.log(`✅ Assistant ready: ${assistantId}`);
  }

  // ---- Step 2: Phone Number ------------------------------------------------
  let phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID?.trim();
  let phoneDigits: string | undefined;

  if (phoneNumberId) {
    console.log(`\n✓ Using existing phone number: ${phoneNumberId}`);
  } else {
    console.log('\n⏳ Provisioning phone number...');
    const phoneNumber = await getOrPurchasePhoneNumber(assistantId);
    phoneNumberId = phoneNumber.id;
    phoneDigits = (phoneNumber as any).number ?? undefined;
    console.log(`✅ Phone number ready: ${phoneNumberId}`);
    if (phoneDigits) {
      console.log(`   Number: ${phoneDigits}`);
    }
  }

  // ---- Summary -------------------------------------------------------------
  console.log('\n' + '─'.repeat(50));
  console.log('Setup complete! Add the following to .env.local:\n');
  console.log(`VAPI_ASSISTANT_ID=${assistantId}`);
  console.log(`VAPI_PHONE_NUMBER_ID=${phoneNumberId}`);
  if (phoneDigits) {
    console.log(`\nYour phone number: ${phoneDigits}`);
  }
  console.log('\n' + '─'.repeat(50));
}

main().catch((err) => {
  console.error('\n❌ Setup failed:\n');
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
