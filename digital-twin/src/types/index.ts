// Chat message type
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Chat session state
export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

// Agent definition
export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: "active" | "inactive" | "error";
}

// API request/response types
export interface ChatRequestPayload {
  messages: Message[];
  sessionId?: string;
  userId?: string;
}

export interface ChatResponsePayload {
  id: string;
  message: Message;
  sessionId: string;
  agentId?: string;
}

// Digital Twin state
export interface DigitalTwinState {
  id: string;
  agents: Agent[];
  currentSession?: ChatSession;
  lastUpdate: Date;
  metadata: Record<string, unknown>;
}
