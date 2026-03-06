import { NextResponse } from 'next/server';
import { generateText, stepCountIs } from 'ai';
import { groq } from '@ai-sdk/groq';
import { profileTools, buildFallbackReply } from '@/lib/candidate-db';

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
  const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (!GROQ_API_KEY) {
    // Fallback: return a simple assistant echo when no key provided.
    const lastUser = messages.slice().reverse().find((m) => m.role === 'user')?.text || '';
    return NextResponse.json({ reply: `(mock) Echo: ${lastUser}` });
  }

  try {
    const result = await generateText({
      model: groq(GROQ_MODEL),
      system: `You are a digital twin assistant for a candidate resume app.

Use tool-calling to fetch candidate data from the PostgreSQL schema (candidate_profile, contact_info, skills, skill_categories, work_experience, work_experience_highlights, work_experience_tags, education, education_coursework, projects, project_highlights, project_tags, certifications).

Important behavior:
- Do not assume profile details; call tools for factual data.
- If a question is broad (e.g., "tell me about yourself"), call enough tools to answer fully.
- If data is missing, say that clearly.
    - Answer in first person as the candidate and keep responses recruiter-friendly.
    - Use a conversational, natural tone (warm, clear, and concise).
    - Avoid sounding robotic or listing raw database fields unless specifically asked.
    - Prefer short paragraphs or light bullets that are easy to read in chat.
`,
      messages: messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role,
          content: m.text,
        })),
      tools: profileTools,
      stopWhen: stepCountIs(6),
      temperature: 0.4,
    });

    let textReply = result.text?.trim() || '';

    if (!textReply) {
      textReply = await buildFallbackReply();
    }

    return NextResponse.json({ reply: textReply });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
