// API-specific types

export interface ChatMessageType {
  id: string;
  userId: string;
  content: string;
  role: "user" | "assistant";
  createdAt: Date;
}

export interface ChatSessionType {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessageType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InsightType {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  metric?: number;
  createdAt: Date;
}

export interface DashboardStatsType {
  totalUsers: number;
  activeSessions: number;
  insights: number;
}
