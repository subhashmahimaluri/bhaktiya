"use client";

import { AuthButton } from "@/components/auth/AuthButton";
import {
  AUTH_ROUTES,
  HELPER_COUNTRIES,
  HELPER_LANGUAGES,
  HELPER_SKILLS,
  PRICE_RANGE,
} from "@/lib/constants/authConfig";
import { HelperOnboardingData, UserType } from "@/lib/types/auth";
import { cn } from "@/lib/utils/classNames";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface OnboardingFormProps {
  userType: UserType;
  userName: string;
}

/**
 * Searchable chip selector component for skills/languages
 */
function SearchableChipSelector({
  label,
  items,
  selectedItems,
  onToggle,
  placeholder,
  selectedColor = "bg-primary border-primary",
}: {
  label: string;
  items: readonly string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  placeholder: string;
  selectedColor?: string;
}) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>

      {/* Search input */}
      <div className="relative mb-3">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          aria-label={`Search ${label.toLowerCase()}`}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Selected count */}
      {selectedItems.length > 0 && (
        <p className="text-xs text-slate-500 mb-2">
          {selectedItems.length} selected
        </p>
      )}

      {/* Chips */}
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No matches found</p>
        ) : (
          filteredItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              aria-pressed={selectedItems.includes(item)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                "border-2 focus:outline-none focus:ring-2 focus:ring-primary/50",
                selectedItems.includes(item)
                  ? `${selectedColor} text-white`
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary/50"
              )}
            >
              {item}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function OnboardingForm({ userType, userName }: OnboardingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<HelperOnboardingData>({
    skills: [],
    languages: [],
    price_min: 50,
    price_max: 200,
    country: "",
  });

  const isHelper = userType === UserType.HELPER;

  const toggleArrayItem = (field: "skills" | "languages", item: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isHelper) {
      if (formData.skills.length === 0) {
        setError("Please select at least one skill");
        return;
      }
      if (formData.languages.length === 0) {
        setError("Please select at least one language");
        return;
      }
      if (!formData.country) {
        setError("Please select your country");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/helper/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to save helper profile");
          return;
        }

        router.push(AUTH_ROUTES.DASHBOARD);
        router.refresh();
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    } else {
      router.push(AUTH_ROUTES.DASHBOARD);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {isHelper ? (
        <>
          {/* Skills Selection with Search */}
          <SearchableChipSelector
            label="Your Skills"
            items={HELPER_SKILLS}
            selectedItems={formData.skills}
            onToggle={(item) => toggleArrayItem("skills", item)}
            placeholder="Search skills..."
            selectedColor="bg-primary border-primary"
          />

          {/* Languages Selection with Search */}
          <SearchableChipSelector
            label="Languages You Speak"
            items={HELPER_LANGUAGES}
            selectedItems={formData.languages}
            onToggle={(item) => toggleArrayItem("languages", item)}
            placeholder="Search languages..."
            selectedColor="bg-pbp-purple-2 border-pbp-purple-2"
          />

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Hourly Rate Range (USD)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price-min"
                  className="block text-xs text-slate-500 mb-1"
                >
                  Minimum
                </label>
                <input
                  id="price-min"
                  type="number"
                  min={PRICE_RANGE.MIN}
                  max={formData.price_max}
                  step={PRICE_RANGE.STEP}
                  value={formData.price_min}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price_min: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label
                  htmlFor="price-max"
                  className="block text-xs text-slate-500 mb-1"
                >
                  Maximum
                </label>
                <input
                  id="price-max"
                  type="number"
                  min={formData.price_min}
                  max={PRICE_RANGE.MAX}
                  step={PRICE_RANGE.STEP}
                  value={formData.price_max}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price_max: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Country Selection */}
          <div>
            <label
              htmlFor="country-select"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country-select"
              value={formData.country}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, country: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
              aria-required="true"
            >
              <option value="">Select your country</option>
              {HELPER_COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        /* Seeker Welcome Message */
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pbp-purple-1 to-pbp-purple-2 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Welcome, {userName}!
          </h3>
          <p className="text-slate-600">
            Your account is ready. Click below to start exploring migration
            opportunities and connect with verified helpers.
          </p>
        </div>
      )}

      <AuthButton type="submit" isLoading={isLoading}>
        {isHelper ? "Complete Profile" : "Go to Dashboard"}
      </AuthButton>
    </form>
  );
}
