// Authentication Configuration Constants

/**
 * Route paths for authentication flow
 */
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  CALLBACK: "/auth/callback",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
  ONBOARDING: "/onboarding",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
  HOME: "/",
} as const;

/**
 * Protected route patterns - require authentication
 */
export const PROTECTED_ROUTES = ["/dashboard", "/onboarding", "/admin"];

/**
 * Public routes - accessible without authentication
 */
export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
];
