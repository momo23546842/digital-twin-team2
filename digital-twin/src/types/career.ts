// Career Assistant specific types

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationGroup {
  label: string;
  conversations: Conversation[];
}

export interface LeadInfo {
  id: string;
  name: string;
  email?: string;
  company?: string;
  position?: string;
  extractedAt: Date;
}

export interface ConversationKPIs {
  messageCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
  timeSpentMinutes: number;
  startedAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  type: 'document' | 'link' | 'video';
  url?: string;
  description?: string;
}
