"use client";

import { cn } from "@/lib/utils/classNames";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

/**
 * Reusable auth button with loading state and variants
 */
export function AuthButton({
  children,
  isLoading = false,
  variant = "primary",
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={cn(
        "w-full py-3 px-4 rounded-xl font-semibold",
        "transition-all duration-200 transform",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
        variant === "primary" && [
          "bg-gradient-to-r from-pbp-purple-1 to-pbp-purple-2",
          "text-white shadow-lg shadow-purple-500/25",
          "hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5",
          "focus:ring-primary",
        ],
        variant === "secondary" && [
          "bg-secondary text-slate-900",
          "hover:bg-secondary/90 hover:-translate-y-0.5",
          "focus:ring-secondary",
        ],
        variant === "outline" && [
          "border-2 border-slate-200 bg-transparent text-slate-700",
          "hover:bg-slate-50 hover:border-slate-300",
          "focus:ring-slate-300",
        ],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
