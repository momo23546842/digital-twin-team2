/**
 * Shared candidate database logic.
 *
 * This module exports:
 *  - The pg connection pool and withClient helper
 *  - Raw async query functions (used by the MCP server)
 *  - AI SDK tool definitions wrapping those queries (used by the chat API)
 *  - buildFallbackReply helper
 */
import pg from 'pg';
import { tool } from 'ai';
import { z } from 'zod';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

export async function withClient<T>(work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await work(client);
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Raw query functions (no AI SDK coupling) — consumed by the MCP server
// ---------------------------------------------------------------------------

export async function queryCandidateProfile(candidateId: number) {
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
    return result.rows[0] ?? null;
  });
}

export async function queryContactInfo(candidateId: number) {
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
}

export async function querySkills(candidateId: number, category?: string) {
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
}

export async function queryWorkExperience(candidateId: number) {
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
}

export async function queryEducation(candidateId: number) {
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
}

export async function queryProjects(candidateId: number) {
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
}

export async function queryCertifications(candidateId: number) {
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
}

// ---------------------------------------------------------------------------
// AI SDK tool definitions — consumed by the chat API (and chat MCP tool)
// ---------------------------------------------------------------------------

// Use z.coerce.number() so that string values like "1" from LLMs are
// automatically converted to numbers instead of failing validation.
const candidateIdSchema = z.object({
  candidateId: z.coerce.number().int().positive().default(1),
});

export const profileTools = {
  getCandidateProfile: tool({
    description: 'Get basic candidate profile from candidate_profile table.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => queryCandidateProfile(candidateId),
  }),

  getContactInfo: tool({
    description: 'Get contact information from contact_info table.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => queryContactInfo(candidateId),
  }),

  getSkills: tool({
    description: 'Get candidate skills grouped by categories from skills and skill_categories tables.',
    inputSchema: z.object({
      candidateId: z.coerce.number().int().positive().default(1),
      category: z.string().trim().nullable().optional(),
    }),
    execute: async ({ candidateId, category }) => querySkills(candidateId, category ?? undefined),
  }),

  getWorkExperience: tool({
    description: 'Get work history, highlights, and tags from work_experience tables.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => queryWorkExperience(candidateId),
  }),

  getEducation: tool({
    description: 'Get education and coursework from education tables.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => queryEducation(candidateId),
  }),

  getProjects: tool({
    description: 'Get projects, highlights, and tags from projects tables.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => queryProjects(candidateId),
  }),

  getCertifications: tool({
    description: 'Get certifications from certifications table.',
    inputSchema: candidateIdSchema,
    execute: async ({ candidateId }) => queryCertifications(candidateId),
  }),
};

// ---------------------------------------------------------------------------
// Fallback reply when AI generation fails
// ---------------------------------------------------------------------------

export async function buildFallbackReply(): Promise<string> {
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
