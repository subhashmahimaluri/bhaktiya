// Authentication Types and Enums

/**
 * User role enum - matches database user_role column
 */
export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  PREMIUM = "premium",
  BASIC = "basic",
}

/**
 * User profile from users table
 */
export interface UserProfile {
  id: string;
  auth_uid: string;
  email: string;
  name: string;
  role: UserRole;
  email_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Signup form data
 */
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Forgot password form data
 */
export interface ForgotPasswordFormData {
  email: string;
}

/**
 * Reset password form data
 */
export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Form field error state
 */
export interface FormErrors {
  [key: string]: string | undefined;
}

/**
 * AI Advisor intake form data
 */
export interface AdvisorIntake {
  goal: string;
  background: string;
  preferredCountries: string[];
}

/**
 * AI Advisor session from advisor_sessions table
 */
export interface AdvisorSession {
  id: string;
  user_id: string;
  intake: AdvisorIntake;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
}
