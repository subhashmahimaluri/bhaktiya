"use client";

import { UserType } from "@/lib/types/auth";
import { cn } from "@/lib/utils/classNames";
import { useState } from "react";

interface UserTypeSelectorProps {
  value: UserType | "";
  onChange: (value: UserType) => void;
  error?: string;
  showTooltip?: boolean;
}

const userTypes = [
  {
    type: UserType.SEEKER,
    title: "Seeker",
    description: "I'm looking for help with my migration journey",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    type: UserType.HELPER,
    title: "Helper",
    description: "I want to help others with their migration needs",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>
    ),
  },
];

/**
 * User type selector for signup - seeker vs helper with optional tooltip
 */
export function UserTypeSelector({
  value,
  onChange,
  error,
  showTooltip = false,
}: UserTypeSelectorProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <div
      className="space-y-2"
      role="radiogroup"
      aria-labelledby="user-type-label"
    >
      <div className="flex items-center gap-2">
        <label
          id="user-type-label"
          className="block text-sm font-medium text-slate-700"
        >
          I am a...
        </label>

        {/* Tooltip - Why we ask */}
        {showTooltip && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setTooltipOpen(!tooltipOpen)}
              onBlur={() => setTimeout(() => setTooltipOpen(false), 200)}
              className="text-slate-400 hover:text-primary transition-colors focus:outline-none focus:text-primary"
              aria-label="Why we ask for account type"
              aria-expanded={tooltipOpen}
            >
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {/* Tooltip Dropdown */}
            {tooltipOpen && (
              <div
                className="absolute left-0 top-full mt-2 z-50 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg"
                role="tooltip"
              >
                <p className="font-medium mb-1">Why we ask this</p>
                <p className="text-slate-300">
                  This helps us personalize your experience.{" "}
                  <strong>Seekers</strong> get matched with migration experts.{" "}
                  <strong>Helpers</strong> can offer their services and connect
                  with those who need assistance.
                </p>
                <div className="absolute -top-1.5 left-3 w-3 h-3 bg-slate-800 rotate-45" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {userTypes.map((option) => (
          <button
            key={option.type}
            type="button"
            role="radio"
            aria-checked={value === option.type}
            onClick={() => onChange(option.type)}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-200",
              "text-left focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
              "hover:border-primary/50",
              value === option.type
                ? "border-primary bg-primary/5"
                : "border-slate-200 bg-white"
            )}
          >
            {/* Selection indicator */}
            {value === option.type && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            <div
              className={cn(
                "mb-2",
                value === option.type ? "text-primary" : "text-slate-400"
              )}
            >
              {option.icon}
            </div>
            <p
              className={cn(
                "font-semibold",
                value === option.type ? "text-primary" : "text-slate-700"
              )}
            >
              {option.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {option.description}
            </p>
          </button>
        ))}
      </div>

      {error && (
        <p
          className="text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
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
