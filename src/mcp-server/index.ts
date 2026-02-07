#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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

// ─── Resume data ──────────────────────────────────────────────

let resumeData: any = null;

function loadResume(): any {
  if (resumeData) return resumeData;

  // Try several possible paths to find the resume JSON
  const possiblePaths = [
    resolve(process.cwd(), "..", "digital-twin", "src", "data", "resume.json"),
    resolve(process.cwd(), "digital-twin", "src", "data", "resume.json"),
    resolve(process.cwd(), "src", "data", "resume.json"),
  ];

  for (const p of possiblePaths) {
    try {
      const raw = readFileSync(p, "utf-8");
      resumeData = JSON.parse(raw);
      console.error(`[MCP] Loaded resume from ${p}`);
      return resumeData;
    } catch {
      // try next path
    }
  }

  console.error("[MCP] Could not find resume.json at any expected path");
  return null;
}

/**
 * Fetch candidate profile data from the resume JSON.
 */
function getCandidateProfile(candidateId: string) {
  const r = loadResume();

  if (!r) {
    return {
      id: candidateId,
      name: "Unknown",
      summary: "No resume data found. Ensure resume.json exists in digital-twin/src/data/.",
      skills: [],
      experience: "N/A",
      education: "N/A",
    };
  }

  // Flatten all skill categories into a single list
  const allSkills = r.skills
    ? Object.values(r.skills).flat()
    : [];

  return {
    id: candidateId,
    name: r.name || "Unknown",
    title: r.title || "",
    location: r.location || "",
    email: r.email || "",
    summary: r.summary || "",
    skills: allSkills,
    experience: (r.experience || []).map((job: any) => ({
      role: job.title,
      company: job.company,
      period: `${job.startDate} – ${job.endDate}`,
      highlights: job.highlights,
    })),
    education: (r.education || []).map((edu: any) => ({
      degree: edu.degree,
      institution: edu.institution,
      graduated: edu.graduationDate,
      gpa: edu.gpa,
    })),
    projects: r.projects || [],
    certifications: r.certifications || [],
    interests: r.interests || [],
  };
}

/**
 * Analyze job match by comparing resume skills against a job description.
 */
function analyzeJobMatch(candidateId: string, jobDescription: string) {
  const profile = getCandidateProfile(candidateId);
  const profileSkills: string[] = (profile.skills || []) as string[];

  if (profileSkills.length === 0) {
    return {
      candidateId,
      matchScore: 0,
      strengths: [],
      gaps: ["No skill data available in resume"],
      recommendation: "Cannot analyze job match without resume data.",
    };
  }

  const jobLower = jobDescription.toLowerCase();
  const matchedSkills = profileSkills.filter((skill: string) =>
    jobLower.includes(skill.toLowerCase())
  );
  const unmatchedSkills = profileSkills.filter(
    (skill: string) => !jobLower.includes(skill.toLowerCase())
  );

  const matchRatio =
    profileSkills.length > 0
      ? matchedSkills.length / profileSkills.length
      : 0;
  const matchScore = Math.round(matchRatio * 100);

  return {
    candidateId,
    candidateName: profile.name,
    matchScore,
    matchedSkills,
    totalSkillsInResume: profileSkills.length,
    strengths: matchedSkills.map((s: string) => `Has ${s} experience`),
    gaps:
      unmatchedSkills.length > 0
        ? [`Skills not mentioned in job: ${unmatchedSkills.join(", ")}`]
        : [],
    recommendation:
      matchScore >= 70
        ? "Strong match – candidate's skills align well with this role."
        : matchScore >= 40
        ? "Moderate match – some skill overlap, but gaps exist."
        : "Weak match – significant skill gaps for this role.",
  };
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
        const result = getCandidateProfile(candidateId);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case "analyze_job_match": {
        const candidateId = getStringArg(args, "candidateId", toolName);
        const jobDescription = getStringArg(args, "jobDescription", toolName);
        const result = analyzeJobMatch(candidateId, jobDescription);
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
