/**
 * MCP server for the Digital Twin chatbot — stateless Web Standard HTTP transport.
 *
 * Route:   /api/[transport]   (Next.js dynamic segment)
 * Connect: http://localhost:3002/api/mcp
 *
 * Uses @modelcontextprotocol/sdk directly in stateless mode — no Redis required.
 *
 * Exposed tools:
 *  - get_candidate_profile   — basic profile
 *  - get_contact_info        — contact links
 *  - get_skills              — skills (optional category filter)
 *  - get_work_experience     — work history
 *  - get_education           — education and coursework
 *  - get_projects            — portfolio projects
 *  - get_certifications      — certifications
 *  - chat                    — full AI chat (reuses chat API logic)
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { generateText, stepCountIs } from 'ai';
import { groq } from '@ai-sdk/groq';
import {
  queryCandidateProfile,
  queryContactInfo,
  querySkills,
  queryWorkExperience,
  queryEducation,
  queryProjects,
  queryCertifications,
  profileTools,
  buildFallbackReply,
} from '@/lib/candidate-db';

const SYSTEM_PROMPT = `You are a digital twin assistant for a candidate resume app.

Use tool-calling to fetch candidate data from the PostgreSQL schema (candidate_profile, contact_info, skills, skill_categories, work_experience, work_experience_highlights, work_experience_tags, education, education_coursework, projects, project_highlights, project_tags, certifications).

Important behavior:
- Do not assume profile details; call tools for factual data.
- If a question is broad (e.g., "tell me about yourself"), call enough tools to answer fully.
- If data is missing, say that clearly.
- Answer in first person as the candidate and keep responses recruiter-friendly.
- Use a conversational, natural tone (warm, clear, and concise).
- Avoid sounding robotic or listing raw database fields unless specifically asked.
- Prefer short paragraphs or light bullets that are easy to read in chat.
`;

function buildMcpServer(): McpServer {
  const server = new McpServer({
    name: 'digital-twin',
    version: '1.0.0',
  });

  server.tool(
    'get_candidate_profile',
    'Get basic candidate profile (name, location, title, summary, etc.).',
    { candidateId: z.number().int().positive().default(1) },
    async ({ candidateId }) => {
      const data = await queryCandidateProfile(candidateId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_contact_info',
    "Get the candidate's contact links (email, LinkedIn, GitHub, etc.).",
    { candidateId: z.number().int().positive().default(1) },
    async ({ candidateId }) => {
      const data = await queryContactInfo(candidateId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_skills',
    'Get skills grouped by category. Optionally filter by a category name.',
    {
      candidateId: z.number().int().positive().default(1),
      category: z.string().trim().optional().describe('Filter by skill category name (partial match).'),
    },
    async ({ candidateId, category }) => {
      const data = await querySkills(candidateId, category);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_work_experience',
    'Get the full work history including highlights and technology tags.',
    { candidateId: z.number().int().positive().default(1) },
    async ({ candidateId }) => {
      const data = await queryWorkExperience(candidateId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_education',
    'Get education records including degree, institution, and coursework.',
    { candidateId: z.number().int().positive().default(1) },
    async ({ candidateId }) => {
      const data = await queryEducation(candidateId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_projects',
    'Get portfolio projects with descriptions, highlights, and tags.',
    { candidateId: z.number().int().positive().default(1) },
    async ({ candidateId }) => {
      const data = await queryProjects(candidateId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_certifications',
    'Get professional certifications and credentials.',
    { candidateId: z.number().int().positive().default(1) },
    async ({ candidateId }) => {
      const data = await queryCertifications(candidateId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'chat',
    'Send a conversational message to the digital twin. Returns an AI-generated reply in first person as the candidate.',
    {
      messages: z
        .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
        .min(1)
        .describe('Conversation history. Last message should be from the user.'),
    },
    async ({ messages }) => {
      const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
      if (!process.env.GROQ_API_KEY) {
        const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
        return { content: [{ type: 'text' as const, text: `(mock) Echo: ${lastUser}` }] };
      }
      try {
        const result = await generateText({
          model: groq(GROQ_MODEL),
          system: SYSTEM_PROMPT,
          messages,
          tools: profileTools,
          stopWhen: stepCountIs(6),
          temperature: 0.4,
        });
        const reply = result.text?.trim() || (await buildFallbackReply());
        return { content: [{ type: 'text' as const, text: reply }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true };
      }
    },
  );

  return server;
}

async function handleMcpRequest(req: Request): Promise<Response> {
  // Stateless: fresh server + transport per request — no Redis needed.
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  const server = buildMcpServer();
  await server.connect(transport);

  return transport.handleRequest(req);
}

export async function GET(req: Request) {
  return handleMcpRequest(req);
}

export async function POST(req: Request) {
  return handleMcpRequest(req);
}

export async function DELETE(req: Request) {
  return handleMcpRequest(req);
}
