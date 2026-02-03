#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

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
        description: "Retrieve candidate profile information for the digital twin",
        inputSchema: {
          type: "object",
          properties: {
            candidateId: {
              type: "string",
              description: "The unique identifier for the candidate",
            },
          },
          required: ["candidateId"],
          additionalProperties: false,
        },
      },
      {
        name: "analyze_job_match",
        description: "Analyze how well a candidate matches a job description",
        inputSchema: {
          type: "object",
          properties: {
            candidateId: {
              type: "string",
              description: "The candidate's ID",
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

        // Mock data - replace with your actual data source
        const result = {
          id: candidateId,
          name: "John Doe",
          skills: ["JavaScript", "React", "Node.js"],
          experience: "5 years",
          education: "BS Computer Science",
        };

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "analyze_job_match": {
        const candidateId = getStringArg(args, "candidateId", toolName);
        const jobDescription = getStringArg(args, "jobDescription", toolName);

        // Mock analysis - replace with actual logic
        const result = {
          candidateId,
          matchScore: 85,
          strengths: ["Strong technical background", "Relevant experience"],
          gaps: ["Needs more cloud experience"],
          notes: `Job description length: ${jobDescription.length}`,
        };

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
