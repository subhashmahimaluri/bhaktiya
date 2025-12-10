"use client";

import { cn } from "@/lib/utils/classNames";
import { forwardRef } from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable auth form input with label, error state, and optional icon
 */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-4 py-3 rounded-xl border bg-white/50 backdrop-blur-sm",
              "text-slate-800 placeholder:text-slate-400",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              icon && "pl-10",
              error
                ? "border-red-400 focus:ring-red-400/50 focus:border-red-400"
                : "border-slate-200 hover:border-slate-300",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
