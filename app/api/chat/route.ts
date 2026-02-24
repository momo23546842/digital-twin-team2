import { NextResponse } from 'next/server';
import pg from 'pg';
import { generateText, stepCountIs, tool } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

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

async function withClient<T>(work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  try {
    return await work(client);
  } finally {
    client.release();
  }
}

const candidateIdSchema = z.object({
  candidateId: z.number().int().positive().default(1),
});

const profileTools = {
  getCandidateProfile: tool({
    description: 'Get basic candidate profile from candidate_profile table.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => {
      return withClient(async (client) => {
        const result = await client.query(
          `
          SELECT id, first_name, last_name, email, phone, location,
                 career_objective, professional_summary, status,
                 current_position, years_of_experience
          FROM candidate_profile
          WHERE id = $1
          `,
          [candidateId],
        );
        return result.rows[0] || null;
      });
    },
  }),

  getContactInfo: tool({
    description: 'Get contact information from contact_info table.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => {
      return withClient(async (client) => {
        const result = await client.query(
          `
          SELECT contact_type, contact_value, is_primary
          FROM contact_info
          WHERE candidate_id = $1
          ORDER BY is_primary DESC, contact_type ASC
          `,
          [candidateId],
        );
        return result.rows;
      });
    },
  }),

  getSkills: tool({
    description: 'Get candidate skills grouped by categories from skills and skill_categories tables.',
    inputSchema: z.object({
      candidateId: z.number().int().positive().default(1),
      category: z.string().trim().optional(),
    }),
    execute: async ({ candidateId, category }) => {
      return withClient(async (client) => {
        const result = await client.query(
          `
          SELECT sc.category_name, s.skill_name, s.proficiency_level, s.years_of_experience
          FROM skills s
          LEFT JOIN skill_categories sc ON s.category_id = sc.id
          WHERE s.candidate_id = $1
            AND ($2::text IS NULL OR sc.category_name ILIKE $2)
          ORDER BY sc.display_order NULLS LAST, s.skill_name ASC
          `,
          [candidateId, category ? `%${category}%` : null],
        );
        return result.rows;
      });
    },
  }),

  getWorkExperience: tool({
    description: 'Get work history, highlights, and tags from work_experience tables.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => {
      return withClient(async (client) => {
        const result = await client.query(
          `
          SELECT
            we.id,
            we.job_title,
            we.company_name,
            we.location,
            we.start_date,
            we.end_date,
            we.is_current,
            we.employment_type,
            we.description,
            COALESCE(
              json_agg(DISTINCT weh.highlight_text)
              FILTER (WHERE weh.id IS NOT NULL),
              '[]'::json
            ) AS highlights,
            COALESCE(
              json_agg(DISTINCT wet.tag_name)
              FILTER (WHERE wet.id IS NOT NULL),
              '[]'::json
            ) AS tags
          FROM work_experience we
          LEFT JOIN work_experience_highlights weh ON weh.experience_id = we.id
          LEFT JOIN work_experience_tags wet ON wet.experience_id = we.id
          WHERE we.candidate_id = $1
          GROUP BY we.id
          ORDER BY we.is_current DESC, we.start_date DESC
          `,
          [candidateId],
        );
        return result.rows;
      });
    },
  }),

  getEducation: tool({
    description: 'Get education and coursework from education tables.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => {
      return withClient(async (client) => {
        const result = await client.query(
          `
          SELECT
            e.id,
            e.degree_type,
            e.degree_name,
            e.field_of_study,
            e.institution_name,
            e.location,
            e.start_date,
            e.end_date,
            e.graduation_year,
            e.is_current,
            e.description,
            COALESCE(
              json_agg(DISTINCT ec.course_name)
              FILTER (WHERE ec.id IS NOT NULL),
              '[]'::json
            ) AS coursework
          FROM education e
          LEFT JOIN education_coursework ec ON ec.education_id = e.id
          WHERE e.candidate_id = $1
          GROUP BY e.id
          ORDER BY e.end_date DESC NULLS LAST, e.start_date DESC NULLS LAST
          `,
          [candidateId],
        );
        return result.rows;
      });
    },
  }),

  getProjects: tool({
    description: 'Get projects, highlights, and tags from projects tables.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => {
      return withClient(async (client) => {
        const result = await client.query(
          `
          SELECT
            p.id,
            p.project_title,
            p.project_subtitle,
            p.description,
            p.start_date,
            p.end_date,
            p.project_url,
            p.repository_url,
            p.is_featured,
            COALESCE(
              json_agg(DISTINCT ph.highlight_text)
              FILTER (WHERE ph.id IS NOT NULL),
              '[]'::json
            ) AS highlights,
            COALESCE(
              json_agg(DISTINCT pt.tag_name)
              FILTER (WHERE pt.id IS NOT NULL),
              '[]'::json
            ) AS tags
          FROM projects p
          LEFT JOIN project_highlights ph ON ph.project_id = p.id
          LEFT JOIN project_tags pt ON pt.project_id = p.id
          WHERE p.candidate_id = $1
          GROUP BY p.id
          ORDER BY p.is_featured DESC, p.created_at DESC
          `,
          [candidateId],
        );
        return result.rows;
      });
    },
  }),

  getCertifications: tool({
    description: 'Get certifications from certifications table.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => {
      return withClient(async (client) => {
        const result = await client.query(
          `
          SELECT certification_name, issuing_organization, issue_date, expiry_date,
                 credential_id, credential_url, description
          FROM certifications
          WHERE candidate_id = $1
          ORDER BY created_at DESC
          `,
          [candidateId],
        );
        return result.rows;
      });
    },
  }),
};

async function buildFallbackReply(): Promise<string> {
  return withClient(async (client) => {
    const result = await client.query(
      `
      SELECT first_name, last_name, current_position, years_of_experience,
             professional_summary, location
      FROM candidate_profile
      WHERE id = 1
      `,
    );

    if (!result.rows.length) {
      return 'I could not find my profile in the database right now. Please try again in a moment.';
    }

    const profile = result.rows[0];
    return `Hi, I'm ${profile.first_name} ${profile.last_name}, a ${profile.current_position} based in ${profile.location}. I have ${profile.years_of_experience} years of experience. ${profile.professional_summary}`;
  });
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
