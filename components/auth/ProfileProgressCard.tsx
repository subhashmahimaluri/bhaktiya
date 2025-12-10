import { AUTH_ROUTES } from "@/lib/constants/authConfig";
import { HelperProfile } from "@/lib/types/auth";
import Link from "next/link";

interface ProfileProgressCardProps {
  helperProfile: HelperProfile | null;
}

/**
 * Calculate profile completion percentage for helpers
 */
function calculateProgress(profile: HelperProfile | null): {
  percentage: number;
  items: { label: string; completed: boolean }[];
} {
  if (!profile) {
    return {
      percentage: 20, // Account created
      items: [
        { label: "Account created", completed: true },
        { label: "Add skills", completed: false },
        { label: "Add languages", completed: false },
        { label: "Set pricing", completed: false },
        { label: "Select country", completed: false },
      ],
    };
  }

  const items = [
    { label: "Account created", completed: true },
    { label: "Add skills", completed: profile.skills?.length > 0 },
    { label: "Add languages", completed: profile.languages?.length > 0 },
    {
      label: "Set pricing",
      completed: profile.price_min > 0 || profile.price_max > 0,
    },
    { label: "Select country", completed: !!profile.country },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  return { percentage, items };
}

/**
 * Profile completion progress indicator for helper dashboard
 */
export function ProfileProgressCard({
  helperProfile,
}: ProfileProgressCardProps) {
  const { percentage, items } = calculateProgress(helperProfile);
  const isComplete = percentage === 100;

  if (isComplete) {
    return null; // Don't show if profile is complete
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="font-semibold text-slate-800">
              Complete Your Profile
            </h3>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Finish setting up your helper profile to start receiving requests
            from seekers.
          </p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">
                Profile completion
              </span>
              <span className="text-amber-600 font-bold">{percentage}%</span>
            </div>
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Profile ${percentage}% complete`}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                {item.completed ? (
                  <svg
                    className="w-3.5 h-3.5 text-emerald-500"
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
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-slate-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  </svg>
                )}
                <span
                  className={
                    item.completed
                      ? "text-slate-500 line-through"
                      : "text-slate-700"
                  }
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href={AUTH_ROUTES.ONBOARDING}
          className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Complete Now
        </Link>
      </div>
    </div>
  );
}
