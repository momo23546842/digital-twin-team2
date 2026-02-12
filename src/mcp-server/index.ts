#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import pg from "pg";

const { Pool } = pg;

/**
 * Small helpers for safe input handling (works in TS strict mode)
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStringArg(
  args: unknown,
  key: string,
  toolName: string
): string {
  if (!isRecord(args)) {
    throw new Error(
      `Invalid arguments for ${toolName}: expected an object`
    );
  }
  const v = args[key];
  if (typeof v !== "string" || v.trim() === "") {
    throw new Error(
      `Invalid arguments for ${toolName}: "${key}" must be a non-empty string`
    );
  }
  return v;
}

// ─── Database connection ──────────────────────────────────────
let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not defined");
    }
    pool = new Pool({ connectionString, max: 5 });
  }
  return pool;
}

/**
 * Fetch candidate profile data from the vectors table.
 * Searches ingested documents for profile-related content.
 */
async function getCandidateProfile(candidateId: string) {
  try {
    const client = await getPool().connect();
    try {
      // Pull all ingested content to build a profile summary
      const result = await client.query(
        `SELECT id, content, metadata
         FROM vectors
         ORDER BY created_at DESC
         LIMIT 20`
      );

      if (result.rows.length === 0) {
        return {
          id: candidateId,
          name: "Unknown",
          summary:
            "No documents have been ingested yet. Upload a resume or bio to populate the profile.",
          skills: [],
          experience: "N/A",
          education: "N/A",
          documentCount: 0,
        };
      }

      // Aggregate content from ingested documents
      const allContent = result.rows
        .map((r: any) => r.content || "")
        .filter((c: string) => c.length > 0)
        .join("\n\n");

      // Extract skills (simple keyword extraction from content)
      const skillKeywords = [
        "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
        "Java", "C++", "C#", "SQL", "PostgreSQL", "MongoDB", "AWS", "Azure",
        "Docker", "Kubernetes", "Git", "HTML", "CSS", "Tailwind", "GraphQL",
        "REST", "API", "Machine Learning", "AI", "Data Science", "DevOps",
        "Agile", "Scrum", "Leadership", "Communication", "Problem Solving",
      ];
      const foundSkills = skillKeywords.filter((skill) =>
        allContent.toLowerCase().includes(skill.toLowerCase())
      );

      // Extract metadata from documents
      const metadataEntries = result.rows
        .map((r: any) => r.metadata)
        .filter((m: any) => m != null);

      return {
        id: candidateId,
        summary: allContent.slice(0, 2000),
        skills: foundSkills,
        documentCount: result.rows.length,
        sources: metadataEntries
          .slice(0, 5)
          .map((m: any) => m.title || m.source || "uploaded document"),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    return {
      id: candidateId,
      error: "Failed to fetch profile from database",
      summary: "Database connection error. Ensure DATABASE_URL is configured.",
      skills: [],
      documentCount: 0,
    };
  }
}

/**
 * Analyze job match by comparing ingested profile against a job description.
 */
async function analyzeJobMatch(candidateId: string, jobDescription: string) {
  try {
    const profile = await getCandidateProfile(candidateId);

    if (profile.documentCount === 0) {
      return {
        candidateId,
        matchScore: 0,
        strengths: [],
        gaps: ["No profile data available – upload documents first"],
        recommendation:
          "Cannot analyze job match without candidate documents.",
      };
    }

    // Simple keyword-based matching
    const jobLower = jobDescription.toLowerCase();
    const profileSkills: string[] = profile.skills || [];
    const matchedSkills = profileSkills.filter((skill: string) =>
      jobLower.includes(skill.toLowerCase())
    );
    const unmatchedJobKeywords = profileSkills.filter(
      (skill: string) => !jobLower.includes(skill.toLowerCase())
    );

    // Calculate a basic match score
    const matchRatio =
      profileSkills.length > 0
        ? matchedSkills.length / profileSkills.length
        : 0;
    const matchScore = Math.round(matchRatio * 100);

    return {
      candidateId,
      matchScore,
      matchedSkills,
      totalSkillsFound: profileSkills.length,
      strengths: matchedSkills.map((s: string) => `Has ${s} experience`),
      gaps:
        unmatchedJobKeywords.length > 0
          ? [`Skills not mentioned in job: ${unmatchedJobKeywords.join(", ")}`]
          : [],
      recommendation:
        matchScore >= 70
          ? "Strong match – candidate's skills align well with this role."
          : matchScore >= 40
          ? "Moderate match – some skill overlap, but gaps exist."
          : "Weak match – significant skill gaps for this role.",
      profileSummaryLength: (profile.summary || "").length,
      documentsAnalyzed: profile.documentCount,
    };
  } catch (error) {
    console.error("Error analyzing job match:", error);
    return {
      candidateId,
      matchScore: 0,
      error: "Failed to analyze job match",
      strengths: [],
      gaps: ["Analysis error"],
    };
  }
}

// ─── MCP Server ──────────────────────────────────────────────

// Initialize the MCP server
const server = new Server(
  {
    name: "digital-twin-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_candidate_info",
        description:
          "Retrieve candidate profile information from ingested documents in the digital twin database",
        inputSchema: {
          type: "object",
          properties: {
            candidateId: {
              type: "string",
              description:
                "The unique identifier for the candidate (use 'default' for the current user)",
            },
          },
          required: ["candidateId"],
          additionalProperties: false,
        },
      },
      {
        name: "analyze_job_match",
        description:
          "Analyze how well the candidate's profile matches a given job description using ingested documents",
        inputSchema: {
          type: "object",
          properties: {
            candidateId: {
              type: "string",
              description:
                "The candidate's ID (use 'default' for the current user)",
            },
            jobDescription: {
              type: "string",
              description: "The job description to match against",
            },
          },
          required: ["candidateId", "jobDescription"],
          additionalProperties: false,
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments; // can be undefined / unknown

  try {
    switch (toolName) {
      case "get_candidate_info": {
        const candidateId = getStringArg(args, "candidateId", toolName);
        const result = await getCandidateProfile(candidateId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "analyze_job_match": {
        const candidateId = getStringArg(args, "candidateId", toolName);
        const jobDescription = getStringArg(args, "jobDescription", toolName);
        const result = await analyzeJobMatch(candidateId, jobDescription);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        // Return a clean MCP tool error
        return {
          content: [{ type: "text", text: `Unknown tool: ${toolName}` }],
          isError: true,
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: message }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Keep logs on stderr (good practice for stdio servers)
  console.error("Digital Twin MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
