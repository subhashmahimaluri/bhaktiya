// Validation Utilities

import { FormErrors, SignupFormData } from "@/lib/types/auth";

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password minimum length
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate signup form data
 */
export function validateSignupForm(data: SignupFormData): FormErrors {
  const errors: FormErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = "Name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  // Email validation
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // User type validation
  if (!data.userType) {
    errors.userType = "Please select your account type";
  }

  return errors;
}

/**
 * Validate login form data
 */
export function validateLoginForm(data: {
  email: string;
  password: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.password) {
    errors.password = "Password is required";
  }

  return errors;
}

/**
 * Check if form has any errors
 */
export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((error) => error !== undefined);
}
