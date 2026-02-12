import { spawn, ChildProcess } from "child_process";
import path from "path";

/**
 * MCP Client – communicates with the digital-twin MCP server over stdio
 * using the JSON-RPC protocol defined by the Model Context Protocol.
 */

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

interface McpToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

let mcpProcess: ChildProcess | null = null;
let requestId = 0;
let initialized = false;

// Pending requests waiting for a response
const pending = new Map<
  number,
  { resolve: (v: JsonRpcResponse) => void; reject: (e: Error) => void }
>();

// Buffer for incoming data (messages may arrive in chunks)
let buffer = "";

/**
 * Get (or start) the MCP server child process.
 */
function getProcess(): ChildProcess {
  if (mcpProcess && !mcpProcess.killed) return mcpProcess;

  // Resolve the MCP server entry point (built JS or run via tsx)
  const serverDir = path.resolve(
    process.cwd(),
    "..",
    "src",
    "mcp-server"
  );
  const serverEntry = path.join(serverDir, "index.ts");

  mcpProcess = spawn("npx", ["tsx", serverEntry], {
    stdio: ["pipe", "pipe", "pipe"],
    cwd: serverDir,
    shell: true,
    env: {
      ...process.env,
      // Pass DATABASE_URL so the MCP server can access the DB
      DATABASE_URL: process.env.DATABASE_URL ?? "",
    },
  });

  mcpProcess.stdout!.on("data", (chunk: Buffer) => {
    buffer += chunk.toString("utf-8");

    // Messages are separated by newlines
    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!line) continue;

      try {
        const msg: JsonRpcResponse = JSON.parse(line);
        if (msg.id != null && pending.has(msg.id)) {
          const { resolve } = pending.get(msg.id)!;
          pending.delete(msg.id);
          resolve(msg);
        }
      } catch {
        // Not JSON – might be debug output, ignore
      }
    }
  });

  mcpProcess.stderr!.on("data", (chunk: Buffer) => {
    // MCP servers log to stderr (convention)
    console.error("[MCP Server]", chunk.toString("utf-8").trim());
  });

  mcpProcess.on("exit", (code) => {
    console.error(`[MCP Server] exited with code ${code}`);
    mcpProcess = null;
    initialized = false;
    // Reject all pending requests
    for (const [id, { reject }] of pending) {
      reject(new Error("MCP server process exited"));
      pending.delete(id);
    }
  });

  return mcpProcess;
}

/**
 * Send a JSON-RPC message and wait for the response.
 */
function send(method: string, params?: Record<string, unknown>): Promise<JsonRpcResponse> {
  return new Promise((resolve, reject) => {
    const proc = getProcess();
    const id = ++requestId;

    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id,
      method,
      ...(params ? { params } : {}),
    };

    pending.set(id, { resolve, reject });

    const payload = JSON.stringify(request) + "\n";
    proc.stdin!.write(payload, (err) => {
      if (err) {
        pending.delete(id);
        reject(err);
      }
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`MCP request timed out (method: ${method})`));
      }
    }, 15_000);
  });
}

/**
 * Initialize the MCP connection (must be called once).
 */
async function ensureInitialized(): Promise<void> {
  if (initialized) return;

  const res = await send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "digital-twin-webapp", version: "1.0.0" },
  });

  if (res.error) {
    throw new Error(`MCP init error: ${res.error.message}`);
  }

  // Send initialized notification (no id, but we use send helper anyway)
  const proc = getProcess();
  const notification = JSON.stringify({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  }) + "\n";
  proc.stdin!.write(notification);

  initialized = true;
}

// ─── Public API ───────────────────────────────────────────────

/**
 * List all tools the MCP server exposes.
 */
export async function listMcpTools(): Promise<
  Array<{ name: string; description: string; inputSchema: unknown }>
> {
  await ensureInitialized();
  const res = await send("tools/list");
  if (res.error) throw new Error(res.error.message);
  const result = res.result as { tools: Array<{ name: string; description: string; inputSchema: unknown }> };
  return result.tools ?? [];
}

/**
 * Call a specific MCP tool by name with the given arguments.
 */
export async function callMcpTool(
  name: string,
  args: Record<string, unknown> = {}
): Promise<McpToolResult> {
  await ensureInitialized();
  const res = await send("tools/call", { name, arguments: args });

  if (res.error) {
    return {
      content: [{ type: "text", text: `MCP error: ${res.error.message}` }],
      isError: true,
    };
  }

  return res.result as McpToolResult;
}

/**
 * Gracefully shut down the MCP server process.
 */
export function shutdownMcp(): void {
  if (mcpProcess && !mcpProcess.killed) {
    mcpProcess.kill();
    mcpProcess = null;
    initialized = false;
  }
}
