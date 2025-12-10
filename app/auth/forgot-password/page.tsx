"use client";

import { AuthButton } from "@/components/auth/AuthButton";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AUTH_ROUTES } from "@/lib/constants/authConfig";
import { getSupabase } from "@/lib/supabaseClient";
import { FormErrors } from "@/lib/types/auth";
import { hasErrors, validateForgotPasswordForm } from "@/lib/utils/validation";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForgotPasswordForm({ email });
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const supabase = getSupabase();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${AUTH_ROUTES.RESET_PASSWORD}`,
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      setSuccessMessage(
        "Password reset link sent! Please check your email inbox."
      );
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show success state
  if (successMessage) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="We've sent you a password reset link"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-slate-600">{successMessage}</p>
          <p className="text-sm text-slate-500">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => {
                setSuccessMessage(null);
                setEmail("");
              }}
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              try again
            </button>
          </p>
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="inline-block text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div
            className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
            role="alert"
            aria-live="polite"
          >
            {serverError}
          </div>
        )}

        {/* Email */}
        <AuthInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: undefined }));
            }
            setServerError(null);
          }}
          error={errors.email}
          autoComplete="email"
          aria-required="true"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
        />

        {/* Submit Button */}
        <AuthButton type="submit" isLoading={isLoading}>
          Send Reset Link
        </AuthButton>
      </form>

      {/* Back to Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Remember your password?{" "}
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
