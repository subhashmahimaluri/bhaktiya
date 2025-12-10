"use client";

import { AuthButton } from "@/components/auth/AuthButton";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AUTH_ROUTES } from "@/lib/constants/authConfig";
import { getSupabase } from "@/lib/supabaseClient";
import { FormErrors } from "@/lib/types/auth";
import { hasErrors, validateLoginForm } from "@/lib/utils/validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const supabase = getSupabase();

      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setServerError("Invalid email or password. Please try again.");
        } else {
          setServerError(error.message);
        }
        return;
      }

      router.push(AUTH_ROUTES.DASHBOARD);
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue your journey">
      {/* Google OAuth Button */}
      <div className="mb-6">
        <GoogleAuthButton />
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-slate-500">
            or continue with email
          </span>
        </div>
      </div>

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
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
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

        {/* Password */}
        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          autoComplete="current-password"
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
        />

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            href="#"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <AuthButton type="submit" isLoading={isLoading}>
          Sign In
        </AuthButton>
      </form>

      {/* Signup Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href={AUTH_ROUTES.SIGNUP}
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
