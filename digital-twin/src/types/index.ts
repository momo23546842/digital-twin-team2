/**
 * Application Type Definitions
 * Complete types for all entities in the Digital Twin Career Agent
 */

// ========================
// User & Authentication
// ========================
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'owner';
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

// ========================
// Chat & Messaging
// ========================
export interface Message {
  id: string;
  conversation_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  voice_url?: string;
  input_method?: 'text' | 'voice';
  voice_transcript?: string;
  timestamp?: Date;
  created_at?: Date;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  user_id?: string;
  session_id: string;
  title?: string;
  status: 'active' | 'archived' | 'closed';
  created_at: Date;
  updated_at: Date;
  summary?: string;
  metadata?: Record<string, any>;
}

// Legacy/Compatibility
export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

// ========================
// Contact Management & Leads
// ========================
export interface Contact {
  id: string;
  conversation_id?: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  title?: string;
  message?: string;
  source: 'chat' | 'form' | 'voice';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'archived';
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

// ========================
// Meetings & Scheduling
// ========================
export interface Meeting {
  id: string;
  contact_id: string;
  conversation_id?: string;
  scheduled_at: Date;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  zoom_url?: string;
  calendar_event_id?: string;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

// ========================
// Voice & Media
// ========================
export interface VoiceRecording {
  id: string;
  message_id?: string;
  conversation_id: string;
  audio_url: string;
  duration_seconds?: number;
  transcription?: string;
  created_at: Date;
  metadata?: Record<string, any>;
}

// ========================
// Analytics & Tracking
// ========================
export interface AnalyticsEvent {
  id: string;
  conversation_id?: string;
  event_type: string;
  event_data?: Record<string, any>;
  user_id?: string;
  created_at: Date;
}

// ========================
// Agent & Business Logic
// ========================
export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'error';
}

export interface DigitalTwinState {
  id: string;
  agents: Agent[];
  currentSession?: ChatSession;
  lastUpdate: Date;
  metadata: Record<string, unknown>;
}

// ========================
// API Request/Response
// ========================
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

export interface ChatRequest {
  messages: Message[];
  sessionId?: string;
  userId?: string;
}

export interface ChatResponse {
  message: Message;
  conversation_id: string;
}

export interface ContactRequest {
  email: string;
  name: string;
  phone?: string;
  company?: string;
  title?: string;
  message?: string;
  conversation_id?: string;
}

export interface ContactResponse {
  contact: Contact;
  success: boolean;
}

export interface MeetingRequest {
  contact_id: string;
  scheduled_at: Date;
  duration_minutes?: number;
  notes?: string;
}

export interface MeetingResponse {
  meeting: Meeting;
  success: boolean;
}

// ========================
// Admin & Dashboard
// ========================
export interface DashboardStats {
  total_conversations: number;
  total_contacts: number;
  total_meetings: number;
  conversations_today: number;
  new_contacts_today: number;
  pending_meetings: number;
}

export interface AdminContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminConversationsResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
}

// ========================
// Errors
// ========================
export interface ApiError {
  error: string;
  code?: string;
  details?: string;
}
