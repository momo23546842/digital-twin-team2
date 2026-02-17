/**
 * Notification Service
 * Sends email (Resend) and SMS (Twilio) notifications for completed phone calls.
 */

// ---------------------------------------------------------------------------
// PhoneCall shape (mirrors the Prisma model so we don't depend on generated types at import time)
// ---------------------------------------------------------------------------
export interface PhoneCallRecord {
  id: string;
  callId: string;
  callerNumber: string;
  status: string;
  startedAt: Date | null;
  endedAt: Date | null;
  duration: number | null;
  recordingUrl: string | null;
  transcript: string | null;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(seconds: number | null): string {
  if (seconds == null) return 'N/A';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ---------------------------------------------------------------------------
// Email – Resend
// ---------------------------------------------------------------------------

function buildEmailHtml(call: PhoneCallRecord): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e4e4e7; }
    .header { background: #18181b; color: #ffffff; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 24px; }
    .detail { margin-bottom: 12px; }
    .label { font-weight: 600; color: #52525b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
    .value { margin-top: 2px; font-size: 15px; }
    .section { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e4e4e7; }
    .transcript { background: #fafafa; padding: 16px; border-radius: 6px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; max-height: 400px; overflow-y: auto; }
    .btn { display: inline-block; background: #18181b; color: #ffffff !important; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; margin-top: 8px; }
    .footer { padding: 16px 24px; background: #fafafa; font-size: 12px; color: #71717a; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📞 Call Completed</h1>
    </div>
    <div class="body">
      <div class="detail">
        <div class="label">Caller</div>
        <div class="value">${call.callerNumber}</div>
      </div>
      <div class="detail">
        <div class="label">Duration</div>
        <div class="value">${formatDuration(call.duration)}</div>
      </div>
      <div class="detail">
        <div class="label">Started</div>
        <div class="value">${formatDate(call.startedAt)}</div>
      </div>
      <div class="detail">
        <div class="label">Ended</div>
        <div class="value">${formatDate(call.endedAt)}</div>
      </div>

      ${
        call.summary
          ? `<div class="section">
              <div class="label">Summary</div>
              <div class="value">${call.summary}</div>
            </div>`
          : ''
      }

      ${
        call.recordingUrl
          ? `<div class="section">
              <a class="btn" href="${call.recordingUrl}" target="_blank">🎧 Listen to Recording</a>
            </div>`
          : ''
      }

      ${
        call.transcript
          ? `<div class="section">
              <div class="label">Transcript</div>
              <div class="transcript">${call.transcript}</div>
            </div>`
          : ''
      }
    </div>
    <div class="footer">
      Digital Twin AI &middot; Call ID: ${call.callId}
    </div>
  </div>
</body>
</html>`.trim();
}

async function sendEmail(call: PhoneCallRecord): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;

  if (!apiKey || !to) {
    console.warn(
      '[notifications] RESEND_API_KEY or NOTIFICATION_EMAIL not set — skipping email',
    );
    return;
  }

  const fromAddress =
    process.env.RESEND_FROM_EMAIL ?? 'Digital Twin <noreply@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject: `📞 Call completed from ${call.callerNumber} (${formatDuration(call.duration)})`,
      html: buildEmailHtml(call),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[notifications] Resend email failed:', res.status, text);
    return;
  }

  console.log('[notifications] Email sent to', to);
}

// ---------------------------------------------------------------------------
// SMS – Twilio
// ---------------------------------------------------------------------------

function buildSmsText(call: PhoneCallRecord): string {
  const parts = [
    `📞 Call completed`,
    `From: ${call.callerNumber}`,
    `Duration: ${formatDuration(call.duration)}`,
  ];

  if (call.summary) {
    // Truncate summary to keep SMS short
    const short =
      call.summary.length > 120
        ? call.summary.slice(0, 117) + '...'
        : call.summary;
    parts.push(`Summary: ${short}`);
  }

  if (call.recordingUrl) {
    parts.push(`Recording: ${call.recordingUrl}`);
  }

  return parts.join('\n');
}

async function sendSms(call: PhoneCallRecord): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  const to = process.env.NOTIFICATION_PHONE;

  if (!accountSid || !authToken || !from || !to) {
    console.warn(
      '[notifications] Twilio credentials or NOTIFICATION_PHONE not set — skipping SMS',
    );
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: buildSmsText(call),
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[notifications] Twilio SMS failed:', res.status, text);
    return;
  }

  console.log('[notifications] SMS sent to', to);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send email and SMS notifications for a completed phone call.
 * Errors are logged but never thrown — callers are not interrupted.
 */
export async function sendNotification(call: PhoneCallRecord): Promise<void> {
  const results = await Promise.allSettled([sendEmail(call), sendSms(call)]);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[notifications] notification error:', result.reason);
    }
  }
}
