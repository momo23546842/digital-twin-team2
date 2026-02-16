import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants/api";
import type { ChatMessageType, ChatResponsePayload, InsightType, UserType } from "@/types";

// Chat endpoints
export const chatApi = {
  sendMessage: (message: string) =>
    apiClient.post<ChatResponsePayload>(API_ENDPOINTS.CHAT, { content: message }),

  getMessages: (sessionId: string) =>
    apiClient.get<ChatMessageType[]>(`${API_ENDPOINTS.CHAT_MESSAGES}?sessionId=${sessionId}`),

  getSessions: () =>
    apiClient.get(API_ENDPOINTS.CHAT_SESSIONS),
};

// Insights endpoints
export const insightsApi = {
  getInsights: () =>
    apiClient.get<InsightType[]>(API_ENDPOINTS.INSIGHTS),

  getStats: () =>
    apiClient.get(API_ENDPOINTS.INSIGHTS_STATS),
};

// Users endpoints
export const usersApi = {
  getProfile: () =>
    apiClient.get<UserType>(API_ENDPOINTS.USERS_ME),

  updateProfile: (data: Partial<UserType>) =>
    apiClient.put(API_ENDPOINTS.USERS_PROFILE, data),

  getUser: (id: string) =>
    apiClient.get<UserType>(`${API_ENDPOINTS.USERS}/${id}`),
};

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post(API_ENDPOINTS.AUTH_LOGIN, { email, password }),

  signup: (email: string, password: string, name: string) =>
    apiClient.post(API_ENDPOINTS.AUTH_SIGNUP, { email, password, name }),

  logout: () =>
    apiClient.post(API_ENDPOINTS.AUTH_LOGOUT, {}),
};
