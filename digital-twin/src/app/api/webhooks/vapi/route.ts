import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { callGroqChat } from "@/lib/groq";

// ---------------------------------------------------------------------------
// Webhook signature verification
// ---------------------------------------------------------------------------
function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.WEBHOOK_SECRET) return false;

  const expected = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}

// ---------------------------------------------------------------------------
// POST /api/webhooks/vapi
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-vapi-signature");

  // Verify webhook authenticity
  if (!verifySignature(rawBody, signature)) {
    console.warn("[vapi-webhook] Invalid signature – rejecting request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.message?.type ?? payload.type;

  console.log(`[vapi-webhook] Received event: ${event}`);

  // Return immediately – heavy work runs asynchronously
  // (Next.js keeps the serverless function alive for the remaining promise)
  switch (event) {
    case "call-started":
    case "call.started":
      handleCallStarted(payload).catch((err) =>
        console.error("[vapi-webhook] handleCallStarted failed:", err)
      );
      break;

    case "call-ended":
    case "call.ended":
      handleCallEnded(payload).catch((err) =>
        console.error("[vapi-webhook] handleCallEnded failed:", err)
      );
      break;

    case "recording-available":
    case "recording.available":
      console.log("[vapi-webhook] Recording available:", payload.message?.recordingUrl ?? payload.recordingUrl);
      break;

    default:
      console.log(`[vapi-webhook] Unhandled event: ${event}`);
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}

// ---------------------------------------------------------------------------
// Event handlers (run asynchronously after response is sent)
// ---------------------------------------------------------------------------

async function handleCallStarted(payload: any) {
  const call = payload.message?.call ?? payload.call ?? payload;
  const callId = call.id ?? call.callId;
  const callerNumber = call.customer?.number ?? call.phoneNumber ?? "unknown";

  if (!callId) {
    console.error("[vapi-webhook] call-started missing callId");
    return;
  }

  console.log(`[vapi-webhook] Call started: ${callId} from ${callerNumber}`);

  await prisma.phoneCall.create({
    data: {
      callId,
      callerNumber,
      status: "in_progress",
      startedAt: new Date(),
    },
  });

  console.log(`[vapi-webhook] PhoneCall record created for ${callId}`);
}

async function handleCallEnded(payload: any) {
  const call = payload.message?.call ?? payload.call ?? payload;
  const callId = call.id ?? call.callId;

  if (!callId) {
    console.error("[vapi-webhook] call-ended missing callId");
    return;
  }

  const endedAt = call.endedAt ? new Date(call.endedAt) : new Date();
  const durationSeconds = call.duration ?? call.durationSeconds ?? null;
  const recordingUrl = call.recordingUrl ?? call.artifact?.recordingUrl ?? null;
  const transcript =
    call.transcript ??
    call.artifact?.transcript ??
    call.messages?.map((m: any) => `${m.role}: ${m.content}`).join("\n") ??
    null;

  console.log(`[vapi-webhook] Call ended: ${callId} (duration: ${durationSeconds}s)`);

  // Generate summary from transcript via Groq
  let summary: string | null = null;
  if (transcript) {
    try {
      summary = await callGroqChat([
        {
          role: "system",
          content:
            "Summarise the following phone call transcript in 2-3 concise sentences. " +
            "Include the caller's intent and any key outcomes or action items.",
        },
        { role: "user", content: transcript },
      ]);
    } catch (err) {
      console.error("[vapi-webhook] Summary generation failed:", err);
    }
  }

  // Update the PhoneCall record
  await prisma.phoneCall.update({
    where: { callId },
    data: {
      status: "completed",
      endedAt,
      duration: durationSeconds,
      recordingUrl,
      transcript,
      summary,
    },
  });

  console.log(`[vapi-webhook] PhoneCall record updated for ${callId}`);

  // Fire-and-forget notification (you'll create sendNotification next)
  try {
    const { sendNotification } = await import("@/lib/notifications");
    await sendNotification({
      callId,
      callerNumber: call.customer?.number ?? "unknown",
      duration: durationSeconds,
      summary,
      recordingUrl,
    });
  } catch (err) {
    console.error("[vapi-webhook] sendNotification failed:", err);
  }
}
