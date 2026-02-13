import { Resend } from "resend";
import twilio from "twilio";

// ---------------------------------------------------------------------------
// Clients (lazy-init singletons)
// ---------------------------------------------------------------------------
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

let twilioClient: twilio.Twilio | null = null;
function getTwilio(): twilio.Twilio {
  if (!twilioClient) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set");
    }
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CallNotification {
  callId: string;
  callerNumber: string;
  duration: number | null;
  summary: string | null;
  recordingUrl: string | null;
}

// ---------------------------------------------------------------------------
// sendNotification
// ---------------------------------------------------------------------------
export async function sendNotification(call: CallNotification): Promise<void> {
  const results = await Promise.allSettled([
    sendEmailNotification(call),
    sendSmsNotification(call),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[notifications] Partial failure:", result.reason);
    }
  }
}

// ---------------------------------------------------------------------------
// Email via Resend
// ---------------------------------------------------------------------------
async function sendEmailNotification(call: CallNotification): Promise<void> {
  const to = process.env.NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!to) {
    console.warn("[notifications] NOTIFICATION_EMAIL not set – skipping email");
    return;
  }

  const durationDisplay = call.duration != null ? formatDuration(call.duration) : "N/A";

  try {
    const { error } = await getResend().emails.send({
      from: `AI Twin <${from}>`,
      to: [to],
      subject: `AI Call Completed - ${call.callerNumber}`,
      html: buildEmailHtml(call, durationDisplay),
    });

    if (error) {
      console.error("[notifications] Resend error:", error);
      return;
    }

    console.log(`[notifications] Email sent to ${to}`);
  } catch (err) {
    console.error("[notifications] Failed to send email:", err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// SMS via Twilio
// ---------------------------------------------------------------------------
async function sendSmsNotification(call: CallNotification): Promise<void> {
  const to = process.env.NOTIFICATION_PHONE;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!to || !twilioNumber) {
    console.warn("[notifications] NOTIFICATION_PHONE or TWILIO_PHONE_NUMBER not set – skipping SMS");
    return;
  }

  const durationDisplay = call.duration != null ? `${call.duration}s` : "unknown duration";

  try {
    const message = await getTwilio().messages.create({
      to,
      from: twilioNumber,
      body: `📞 Your AI twin finished a call (${durationDisplay}) from ${call.callerNumber}. Check email for recording.`,
    });

    console.log(`[notifications] SMS sent: ${message.sid}`);
  } catch (err) {
    console.error("[notifications] Failed to send SMS:", err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function buildEmailHtml(call: CallNotification, durationDisplay: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0f172a; color: #fff; padding: 20px 24px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; }
    .meta { display: flex; gap: 24px; margin-bottom: 20px; }
    .meta-item { }
    .meta-label { font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
    .meta-value { font-size: 16px; font-weight: 600; }
    .section { margin-top: 20px; }
    .section h2 { font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
    .summary-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; }
    .transcript-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; font-size: 13px; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
    .btn { display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; margin-top: 16px; }
    .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📞 AI Call Completed</h1>
  </div>
  <div class="content">
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding:4px 16px 4px 0;">
          <div class="meta-label">Caller</div>
          <div class="meta-value">${escapeHtml(call.callerNumber)}</div>
        </td>
        <td style="padding:4px 16px 4px 0;">
          <div class="meta-label">Duration</div>
          <div class="meta-value">${durationDisplay}</div>
        </td>
        <td style="padding:4px 0;">
          <div class="meta-label">Call ID</div>
          <div class="meta-value" style="font-size:13px;">${escapeHtml(call.callId)}</div>
        </td>
      </tr>
    </table>

    ${call.summary ? `
    <div class="section">
      <h2>Summary</h2>
      <div class="summary-box">${escapeHtml(call.summary)}</div>
    </div>` : ""}

    ${call.recordingUrl ? `
    <div class="section">
      <a href="${escapeHtml(call.recordingUrl)}" class="btn">🎧 Listen to Recording</a>
    </div>` : ""}

    <div class="section">
      <h2>Transcript</h2>
      <div class="transcript-box">${call.summary ? "See full transcript in your dashboard." : "No transcript available."}</div>
    </div>
  </div>
  <div class="footer">
    Sent by your Digital Twin AI &middot; ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
  </div>
</body>
</html>`.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
