import { NextResponse } from 'next/server';
import pg from 'pg';

const { Pool } = pg;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

// Create database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

/**
 * Fetch candidate profile data from database to use as context
 */
async function getCandidateContext(): Promise<string> {
  const client = await pool.connect();
  
  try {
    // Fetch complete profile with skills, experience, and education
    const profileQuery = `
      SELECT 
        cp.first_name,
        cp.last_name,
        cp.email,
        cp.phone,
        cp.location,
        cp.career_objective,
        cp.professional_summary,
        cp.current_position,
        cp.years_of_experience,
        json_agg(DISTINCT jsonb_build_object(
          'category', sc.category_name,
          'skill', s.skill_name
        )) FILTER (WHERE s.id IS NOT NULL) as skills,
        json_agg(DISTINCT jsonb_build_object(
          'title', we.job_title,
          'company', we.company_name,
          'location', we.location,
          'start_date', we.start_date,
          'end_date', we.end_date,
          'is_current', we.is_current,
          'description', we.description
        )) FILTER (WHERE we.id IS NOT NULL) as work_experience,
        json_agg(DISTINCT jsonb_build_object(
          'degree', e.degree_name,
          'field', e.field_of_study,
          'institution', e.institution_name,
          'location', e.location,
          'graduation_year', e.graduation_year
        )) FILTER (WHERE e.id IS NOT NULL) as education
      FROM candidate_profile cp
      LEFT JOIN skills s ON cp.id = s.candidate_id
      LEFT JOIN skill_categories sc ON s.category_id = sc.id
      LEFT JOIN work_experience we ON cp.id = we.candidate_id
      LEFT JOIN education e ON cp.id = e.candidate_id
      WHERE cp.id = 1
      GROUP BY cp.id
    `;
    
    const result = await client.query(profileQuery);
    
    if (result.rows.length === 0) {
      return 'No candidate profile found.';
    }
    
    const profile = result.rows[0];
    
    // Format the context in a natural way for the AI
    return `You are a digital twin AI assistant representing ${profile.first_name} ${profile.last_name}.

PROFILE:
- Name: ${profile.first_name} ${profile.last_name}
- Email: ${profile.email}
- Phone: ${profile.phone}
- Location: ${profile.location}
- Current Position: ${profile.current_position}
- Years of Experience: ${profile.years_of_experience}

CAREER OBJECTIVE:
${profile.career_objective}

PROFESSIONAL SUMMARY:
${profile.professional_summary}

SKILLS:
${profile.skills ? profile.skills.map((s: any) => `- ${s.category}: ${s.skill}`).join('\n') : 'No skills listed'}

WORK EXPERIENCE:
${profile.work_experience ? profile.work_experience.map((exp: any) => `
- ${exp.title} at ${exp.company} (${exp.location})
  ${exp.start_date} - ${exp.is_current ? 'Present' : exp.end_date || 'N/A'}
  ${exp.description || ''}
`).join('\n') : 'No work experience listed'}

EDUCATION:
${profile.education ? profile.education.map((edu: any) => `
- ${edu.degree} in ${edu.field}
  ${edu.institution}, ${edu.location}
  Graduated: ${edu.graduation_year || 'In Progress'}
`).join('\n') : 'No education listed'}

INSTRUCTIONS:
- Answer questions as if you are ${profile.first_name}, speaking in first person
- Provide accurate information based on the profile data above
- Be professional, friendly, and helpful
- If asked about experience, skills, or qualifications, reference specific details from above
- If you don't have information about something, politely say so
- Help recruiters and hiring managers understand ${profile.first_name}'s background and qualifications`;
    
  } finally {
    client.release();
  }
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

  // Try to call Groq SDK if available. Keep this implementation tolerant
  // so repository builds even if the SDK isn't installed in this environment.
  try {
    // Fetch candidate context from database
    const candidateContext = await getCandidateContext();
    
    // Try common package names - adapt if your project uses a different SDK import
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const groqSdk = await import('groq-sdk').catch(() => null);

    if (!groqSdk) {
      return NextResponse.json({ error: 'Groq SDK not installed on server' }, { status: 501 });
    }

    // Example usage - adapt to the actual SDK methods available in your version.
    // This is a generic pattern: create client with API key, call chat/completion, return text.
    // Replace the following lines with the correct SDK usage if different.
    const Groq = groqSdk.default || groqSdk.Groq;
    const client = new Groq({ apiKey: GROQ_API_KEY });

    // Format messages for Groq API
    const formattedMessages = [
      // System message with candidate context
      {
        role: 'system' as const,
        content: candidateContext,
      },
      // User messages
      ...messages.map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      })),
    ];

    // Call Groq API with chat completions
    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const textReply = response?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ reply: textReply });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
