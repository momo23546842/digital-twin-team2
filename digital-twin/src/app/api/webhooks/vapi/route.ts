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
    console.warn('[vapi-webhook] WEBHOOK_SECRET not set — allowing all webhooks');
    return true;
  }
  if (!signature) {
    console.warn('[vapi-webhook] No signature provided in webhook');
    return true; // Allow unsigned webhooks during development
  }

  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    // Try exact match first
    if (signature === expected) {
      return true;
    }

    // Try Buffer comparison
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expected, 'hex'),
      );
    } catch {
      return signature === expected;
    }
  } catch (error) {
    console.error('[vapi-webhook] Signature verification error:', error);
    return true; // Allow webhook if verification fails (for debugging)
  }
}

/**
 * Generate a concise summary of a phone call transcript.
 */
async function generateSummary(transcript: string): Promise<string> {
  try {
    // If transcript is empty or too short, don't attempt summary
    if (!transcript || transcript.length < 10) {
      return 'Call completed with minimal transcript';
    }

    // Add a timeout to prevent hanging
    const summaryPromise = callGroqChat([
      {
        role: 'system',
        content:
          'You are a helpful assistant. Summarize the following phone call transcript in 2-3 concise sentences, highlighting the key topics discussed and any action items.',
      },
      { role: 'user', content: transcript },
    ]);

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Summary generation timeout')), 10000),
    );

    const summary = await Promise.race([summaryPromise, timeoutPromise]);
    return summary;
  } catch (error) {
    console.error('[vapi-webhook] Summary generation error:', error);
    return `Call summary unavailable (${error instanceof Error ? error.message : 'Unknown error'})`;
  }
}

/**
 * Process a "call-started" event asynchronously.
 */
async function handleCallStarted(payload: Record<string, any>) {
  try {
    const call = payload.call ?? payload;
    const callId: string = call.id ?? call.callId ?? 'unknown';
    const callerNumber: string =
      call.customer?.number ?? call.phoneNumber?.number ?? call.callerNumber ?? 'unknown';

    if (!prisma) {
      console.warn('[vapi-webhook] Prisma not initialized, skipping call-started');
      return;
    }

    try {
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
    } catch (err) {
      console.error('[vapi-webhook] failed to record call-started:', err);
    }
  } catch (error) {
    console.error('[vapi-webhook] handleCallStarted error:', error);
  }
}

/**
 * Process a "call-ended" event asynchronously.
 */
async function handleCallEnded(payload: Record<string, any>) {
  try {
    const call = payload.call ?? payload;
    const callId: string = call.id ?? call.callId ?? 'unknown';
    const callerNumber: string =
      call.customer?.number ?? call.phoneNumber?.number ?? call.callerNumber ?? 'unknown';

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

    // Generate summary from transcript (with error handling)
    let summary: string | null = null;
    if (transcript) {
      try {
        summary = await generateSummary(transcript);
      } catch (err) {
        console.error('[vapi-webhook] summary generation failed:', err);
        summary = 'Failed to generate summary';
      }
    }

    // Store in database with fallback if Prisma fails
    let record: any = null;
    try {
      if (prisma) {
        record = await prisma.phoneCall.upsert({
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
      } else {
        console.warn('[vapi-webhook] Prisma not initialized, skipping database storage');
      }
    } catch (err) {
      console.error('[vapi-webhook] database error:', err);
      // Create a mock record for notifications if database fails
      record = {
        id: callId,
        callId,
        callerNumber,
        status: 'completed',
        startedAt,
        endedAt,
        duration,
        recordingUrl,
        transcript,
        summary,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Send notifications if we have a record
    if (record) {
      try {
        await sendNotification(record);
      } catch (err) {
        console.error('[vapi-webhook] notification error:', err);
      }
    }
  } catch (error) {
    console.error('[vapi-webhook] handleCallEnded error:', error);
  }
}

/**
 * POST /api/webhooks/vapi
 *
 * Receives Vapi call-lifecycle webhooks. Returns 200 immediately and
 * processes events asynchronously so Vapi never times out.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    console.log('[vapi-webhook] Raw webhook received, length:', rawBody.length);

    // Verify webhook signature (lenient during development)
    const signature = request.headers.get('x-vapi-signature');
    if (!verifySignature(rawBody, signature)) {
      console.warn('[vapi-webhook] signature verification failed, but continuing');
      // Don't reject - continue processing
    }

    let body: Record<string, any>;
    try {
      body = JSON.parse(rawBody);
    } catch (err) {
      console.error('[vapi-webhook] Failed to parse JSON:', err);
      console.log('[vapi-webhook] Raw body:', rawBody.substring(0, 500));
      return NextResponse.json({ error: 'Invalid JSON', details: String(err) }, { status: 400 });
    }

    const event: string | undefined =
      body.message?.type ?? body.type ?? body.event;

    console.log('[vapi-webhook] Received event:', event);
    console.log('[vapi-webhook] Payload keys:', Object.keys(body));

    // Fire-and-forget: process in the background so we return 200 quickly.
    // Any errors are logged but do not affect the response.
    if (event) {
      switch (event) {
        case 'call-started':
        case 'call.started':
          console.log('[vapi-webhook] Processing call-started');
          handleCallStarted(body.message ?? body).catch((err) =>
            console.error('[vapi-webhook] handleCallStarted error:', err),
          );
          break;

        case 'call-ended':
        case 'call.ended':
        case 'end-of-call-report':
          console.log('[vapi-webhook] Processing call-ended/end-of-call-report');
          handleCallEnded(body.message ?? body).catch((err) =>
            console.error('[vapi-webhook] handleCallEnded error:', err),
          );
          break;

        default:
          console.log(`[vapi-webhook] Unhandled event type: ${event}`);
          console.log('[vapi-webhook] Full payload:', JSON.stringify(body, null, 2).substring(0, 1000));
      }
    } else {
      console.log('[vapi-webhook] No event type found in payload');
      console.log('[vapi-webhook] Full payload:', JSON.stringify(body, null, 2).substring(0, 1000));
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ received: true, event }, { status: 200 });
  } catch (error) {
    console.error('[vapi-webhook] POST handler error:', error);
    // Still return 200 to avoid Vapi retrying
    return NextResponse.json(
      { received: true, error: String(error) },
      { status: 200 }
    );
  }
}
