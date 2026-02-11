// API Constants

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Parse timeout with validation to ensure we always have a valid number
const parseTimeout = (value: string | undefined): number => {
  const defaultTimeout = 30000;
  if (!value) return defaultTimeout;
  
  const parsed = parseInt(value, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : defaultTimeout;
};

export const API_TIMEOUT = parseTimeout(process.env.NEXT_PUBLIC_API_TIMEOUT);

export const API_ENDPOINTS = {
  // Chat
  CHAT: "/chat",
  CHAT_MESSAGES: "/chat/messages",
  CHAT_SESSIONS: "/chat/sessions",

  // Insights
  INSIGHTS: "/insights",
  INSIGHTS_STATS: "/insights/stats",

  // Users
  USERS: "/users",
  USERS_ME: "/users/me",
  USERS_PROFILE: "/users/profile",

  // Auth
  AUTH_LOGIN: "/auth/login",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_SIGNUP: "/auth/signup",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
