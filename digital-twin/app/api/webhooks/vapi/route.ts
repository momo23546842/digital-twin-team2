import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { callGroqChat } from '@/lib/groq';
import { sendNotification } from '@/lib/notifications';

/**
 * Verify Vapi webhook signature using HMAC-SHA256.
 */
function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.warn('WEBHOOK_SECRET not set — skipping signature verification');
    return true;
  }
  if (!signature) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}

/**
 * Generate a concise summary of a phone call transcript.
 */
async function generateSummary(transcript: string): Promise<string> {
  return callGroqChat([
    {
      role: 'system',
      content:
        'You are a helpful assistant. Summarize the following phone call transcript in 2-3 concise sentences, highlighting the key topics discussed and any action items.',
    },
    { role: 'user', content: transcript },
  ]);
}

/**
 * Process a "call-started" event asynchronously.
 */
async function handleCallStarted(payload: Record<string, any>) {
  const call = payload.call ?? payload;
  const callId: string = call.id;
  const callerNumber: string =
    call.customer?.number ?? call.phoneNumber?.number ?? 'unknown';

  await prisma.phoneCall.upsert({
    where: { callId },
    update: {
      status: 'in_progress',
      startedAt: call.startedAt ? new Date(call.startedAt) : new Date(),
    },
    create: {
      callId,
      callerNumber,
      status: 'in_progress',
      startedAt: call.startedAt ? new Date(call.startedAt) : new Date(),
    },
  });

  console.log(`[vapi-webhook] call-started recorded: ${callId}`);
}

/**
 * Process a "call-ended" event asynchronously.
 */
async function handleCallEnded(payload: Record<string, any>) {
  const call = payload.call ?? payload;
  const callId: string = call.id;
  const callerNumber: string =
    call.customer?.number ?? call.phoneNumber?.number ?? 'unknown';

  const startedAt = call.startedAt ? new Date(call.startedAt) : null;
  const endedAt = call.endedAt ? new Date(call.endedAt) : new Date();

  const duration =
    startedAt && endedAt
      ? Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
      : null;

  // Build transcript text from messages array if present
  const transcript: string | null =
    typeof call.transcript === 'string'
      ? call.transcript
      : Array.isArray(call.messages)
        ? call.messages
            .filter((m: any) => m.role && m.message)
            .map((m: any) => `${m.role}: ${m.message}`)
            .join('\n')
        : null;

  const recordingUrl: string | null =
    call.recordingUrl ?? call.artifact?.recordingUrl ?? null;

  // Generate summary from transcript
  let summary: string | null = null;
  if (transcript) {
    try {
      summary = await generateSummary(transcript);
    } catch (err) {
      console.error('[vapi-webhook] summary generation failed:', err);
    }
  }

  const record = await prisma.phoneCall.upsert({
    where: { callId },
    update: {
      status: 'completed',
      endedAt,
      duration,
      recordingUrl,
      transcript,
      summary,
    },
    create: {
      callId,
      callerNumber,
      status: 'completed',
      startedAt,
      endedAt,
      duration,
      recordingUrl,
      transcript,
      summary,
    },
  });

  console.log(
    `[vapi-webhook] call-ended recorded: ${callId} (${duration ?? '?'}s)`,
  );

  // Send email + SMS notifications (fire-and-forget)
  sendNotification(record).catch((err) =>
    console.error('[vapi-webhook] notification error:', err),
  );
}

/**
 * POST /api/webhooks/vapi
 *
 * Receives Vapi call-lifecycle webhooks. Returns 200 immediately and
 * processes events asynchronously so Vapi never times out.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify webhook signature
  const signature = request.headers.get('x-vapi-signature');
  if (!verifySignature(rawBody, signature)) {
    console.warn('[vapi-webhook] invalid signature — rejecting');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: Record<string, any>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event: string | undefined =
    body.message?.type ?? body.type ?? body.event;

  console.log(`[vapi-webhook] received event: ${event ?? 'unknown'}`);

  // Fire-and-forget: process in the background so we return 200 quickly.
  // Any errors are logged but do not affect the response.
  switch (event) {
    case 'call-started':
    case 'call.started':
      handleCallStarted(body.message ?? body).catch((err) =>
        console.error('[vapi-webhook] handleCallStarted error:', err),
      );
      break;

    case 'call-ended':
    case 'call.ended':
    case 'end-of-call-report':
      handleCallEnded(body.message ?? body).catch((err) =>
        console.error('[vapi-webhook] handleCallEnded error:', err),
      );
      break;

    default:
      console.log(`[vapi-webhook] unhandled event: ${event}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
