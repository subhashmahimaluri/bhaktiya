// Authentication Types and Enums

/**
 * User type enum - matches database user_type column
 */
export enum UserType {
  SEEKER = "seeker",
  HELPER = "helper",
}

/**
 * User profile from users table
 */
export interface UserProfile {
  id: string;
  auth_uid: string;
  email: string;
  name: string;
  user_type: UserType;
  created_at: string;
}

/**
 * Helper profile from helpers table
 */
export interface HelperProfile {
  id: string;
  user_id: string;
  skills: string[];
  languages: string[];
  price_min: number;
  price_max: number;
  country: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Signup form data
 */
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
}

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Helper onboarding form data
 */
export interface HelperOnboardingData {
  skills: string[];
  languages: string[];
  price_min: number;
  price_max: number;
  country: string;
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
