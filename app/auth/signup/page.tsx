"use client";

import { AuthButton } from "@/components/auth/AuthButton";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { UserTypeSelector } from "@/components/auth/UserTypeSelector";
import { AUTH_ROUTES } from "@/lib/constants/authConfig";
import { getSupabase } from "@/lib/supabaseClient";
import { FormErrors, SignupFormData, UserType } from "@/lib/types/auth";
import { hasErrors, validateSignupForm } from "@/lib/utils/validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "" as UserType,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateSignupForm(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const supabase = getSupabase();

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}${AUTH_ROUTES.CALLBACK}`,
          data: {
            name: formData.name,
            user_type: formData.userType,
          },
        },
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      router.push(AUTH_ROUTES.CALLBACK);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start your migration journey with PlanBPass"
    >
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

        {/* Name */}
        <AuthInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          autoComplete="name"
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />

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
          autoComplete="new-password"
          aria-required="true"
          aria-describedby="password-hint"
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
        <p id="password-hint" className="text-xs text-slate-500 -mt-2">
          Minimum 8 characters
        </p>

        {/* Confirm Password */}
        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
        />

        {/* User Type Selector with Tooltip */}
        <UserTypeSelector
          value={formData.userType}
          onChange={(value) => handleChange("userType", value)}
          error={errors.userType}
          showTooltip
        />

        {/* Submit Button */}
        <AuthButton type="submit" isLoading={isLoading}>
          Create Account
        </AuthButton>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
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
