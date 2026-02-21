import { NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const messages: ChatMessage[] = body?.messages || [];

  if (!messages.length) {
    return NextResponse.json({ error: 'no messages' }, { status: 400 });
  }

  // Require API key in env. Do NOT hardcode keys.
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  // Allow configuring the model via env variable. Use a conservative default.
  const GROQ_MODEL = process.env.GROQ_MODEL || 'groq-1';

  if (!GROQ_API_KEY) {
    // Fallback: return a simple assistant echo when no key provided.
    const lastUser = messages.slice().reverse().find((m) => m.role === 'user')?.text || '';
    return NextResponse.json({ reply: `(mock) Echo: ${lastUser}` });
  }

  // Try to call Groq SDK if available. Keep this implementation tolerant
  // so repository builds even if the SDK isn't installed in this environment.
  try {
    // Try common package names - adapt if your project uses a different SDK import
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const groqSdk = await import('@groq/sdk').catch(() => null) || await import('groq-sdk').catch(() => null) || await import('groq').catch(() => null);

    if (!groqSdk) {
      return NextResponse.json({ error: 'Groq SDK not installed on server' }, { status: 501 });
    }

    // Example usage - adapt to the actual SDK methods available in your version.
    // This is a generic pattern: create client with API key, call chat/completion, return text.
    // Replace the following lines with the correct SDK usage if different.
    const Client = groqSdk.default || groqSdk.Groq || groqSdk.Client || groqSdk;
    const client = new Client({ apiKey: GROQ_API_KEY });

    // Compose a simple prompt from the last N messages
    const prompt = messages.map((m) => `${m.role}: ${m.text}`).join('\n');

    // Choose model from environment. Preference for chat-optimized models is left
    // to the `GROQ_MODEL` value. Default is `groq-1` which is a general-purpose model.
    const model = GROQ_MODEL;

    // Attempt to call a conversational endpoint - adjust per your SDK
    // Many SDKs provide `chat.completions.create` or `completions.create`.
    let textReply = '';
    if (client.chat && client.chat.completions && typeof client.chat.completions.create === 'function') {
      const resp = await client.chat.completions.create({ model, messages: [{ role: 'user', content: prompt }] });
      // Attempt to extract text from common response shapes
      textReply = resp?.choices?.[0]?.message?.content || resp?.choices?.[0]?.text || String(resp?.output || resp);
    } else if (typeof client.create === 'function') {
      const resp = await client.create({ model, prompt });
      textReply = resp?.text || String(resp?.output || resp);
    } else {
      return NextResponse.json({ error: 'Unsupported Groq SDK interface' }, { status: 501 });
    }

    return NextResponse.json({ reply: textReply });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
