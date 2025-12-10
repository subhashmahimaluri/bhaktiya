// Authentication Configuration Constants

/**
 * Route paths for authentication flow
 */
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  CALLBACK: "/auth/callback",
  ONBOARDING: "/onboarding",
  DASHBOARD: "/dashboard",
  HOME: "/",
} as const;

/**
 * Protected route patterns - require authentication
 */
export const PROTECTED_ROUTES = ["/dashboard", "/onboarding"];

/**
 * Public routes - accessible without authentication
 */
export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
];
