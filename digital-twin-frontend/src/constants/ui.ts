// UI Constants

export const SIDEBAR_ROUTES = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "Chat", href: "/chat", icon: "message" },
  { label: "Insights", href: "/insights", icon: "chart" },
  { label: "Settings", href: "/settings", icon: "settings" },
] as const;

export const THEME_COLORS = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
