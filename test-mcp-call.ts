import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function testMCPTool() {
  // Create client connected to MCP server
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/mcp-server/index.ts"],
  });

  const client = new Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);

  try {
    // List available tools
    console.log("Listing available tools...");
    const tools = await client.listTools();
    console.log("Available tools:", JSON.stringify(tools, null, 2));

    // Call analyze_job_match tool
    console.log("\nCalling analyze_job_match with candidateId: 123");
    const result = await client.callTool({
      name: "analyze_job_match",
      arguments: {
        candidateId: "123",
        jobDescription: "We need a Next.js developer with TypeScript experience",
      },
    });

    console.log("\nResult:");
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await client.close();
  }
}

testMCPTool().catch(console.error);
