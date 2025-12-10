"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AUTH_ROUTES } from "@/lib/constants/authConfig";
import { getSupabase } from "@/lib/supabaseClient";
import { UserProfile, UserRole } from "@/lib/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TabType = "profile" | "preferences" | "activity";

interface Preferences {
  language: string;
  region: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  festivalUpdates: boolean;
  panchangamUpdates: boolean;
  stotrasAndPrayers: boolean;
  specialEvents: boolean;
}

interface Activity {
  id: string;
  type: "account_created" | "login" | "profile_updated" | "password_changed";
  timestamp: string;
  description: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({
    language: "english",
    region: "auto",
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    festivalUpdates: true,
    panchangamUpdates: true,
    stotrasAndPrayers: false,
    specialEvents: false,
  });
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = getSupabase();

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push(AUTH_ROUTES.LOGIN);
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_uid", authUser.id)
        .single();

      if (profile) {
        setUser(profile as UserProfile);
        setEditName(profile.name);

        // Generate activities based on user data
        const userActivities: Activity[] = [
          {
            id: "1",
            type: "account_created",
            timestamp: profile.created_at,
            description: "Account Created",
          },
        ];

        if (profile.updated_at !== profile.created_at) {
          userActivities.push({
            id: "2",
            type: "profile_updated",
            timestamp: profile.updated_at,
            description: "Profile Updated",
          });
        }

        setActivities(userActivities);
      }

      setIsLoading(false);
    };

    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push(AUTH_ROUTES.HOME);
    router.refresh();
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    const supabase = getSupabase();

    const { error } = await supabase
      .from("users")
      .update({ name: editName })
      .eq("auth_uid", user.auth_uid);

    if (!error) {
      setUser({ ...user, name: editName });
    }

    setIsSaving(false);
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    // TODO: Save preferences to database when preferences table is created
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800";
      case UserRole.EDITOR:
        return "bg-blue-100 text-blue-800";
      case UserRole.PREMIUM:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  const tabs = [
    { id: "profile" as TabType, label: "Profile", icon: UserIcon },
    { id: "preferences" as TabType, label: "Preferences", icon: SettingsIcon },
    { id: "activity" as TabType, label: "Activity", icon: ClockIcon },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-4">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Sign out
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-56 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon
                      className={`w-5 h-5 ${
                        activeTab === tab.id ? "text-white" : "text-primary"
                      }`}
                    />
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Admin Link */}
              {user?.role === UserRole.ADMIN && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => router.push("/admin")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
                  >
                    <ShieldIcon className="w-5 h-5 text-primary" />
                    Admin Panel
                  </button>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Personal Information
                  </h2>

                  <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full max-w-md px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>

                    {/* Read-only Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                      <div>
                        <span className="text-sm text-primary font-medium">
                          Email
                        </span>
                        <p className="text-gray-900 mt-1">{user?.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-primary font-medium">
                          Role
                        </span>
                        <p className="mt-1">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(
                              user?.role as UserRole
                            )}`}
                          >
                            {user?.role}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-primary font-medium">
                          Member Since
                        </span>
                        <p className="text-gray-900 mt-1">
                          {user?.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : "Not available"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-primary font-medium">
                          Email Verified
                        </span>
                        <p className="mt-1">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              user?.email_verified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user?.email_verified ? "Verified" : "Pending"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving || editName === user?.name}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => setEditName(user?.name || "")}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Preferences
                  </h2>

                  <div className="space-y-8">
                    {/* Language Preferences */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Language Preferences
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Display Language
                          </label>
                          <select
                            value={preferences.language}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                language: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="english">English</option>
                            <option value="kannada">ಕನ್ನಡ</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Region Settings
                          </label>
                          <select
                            value={preferences.region}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                region: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="auto">Auto-detect</option>
                            <option value="india">India</option>
                            <option value="usa">USA</option>
                            <option value="uk">UK</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Notification Preferences
                      </h3>
                      <div className="space-y-3 max-w-xl">
                        <ToggleRow
                          label="Email Notifications"
                          checked={preferences.emailNotifications}
                          onChange={(checked) =>
                            setPreferences({
                              ...preferences,
                              emailNotifications: checked,
                            })
                          }
                        />
                        <ToggleRow
                          label="Push Notifications"
                          checked={preferences.pushNotifications}
                          onChange={(checked) =>
                            setPreferences({
                              ...preferences,
                              pushNotifications: checked,
                            })
                          }
                        />
                        <ToggleRow
                          label="SMS Notifications"
                          checked={preferences.smsNotifications}
                          onChange={(checked) =>
                            setPreferences({
                              ...preferences,
                              smsNotifications: checked,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Newsletter Preferences */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Newsletter Preferences
                      </h3>
                      <div className="space-y-3 max-w-xl">
                        <ToggleRow
                          label="Festival Updates"
                          checked={preferences.festivalUpdates}
                          onChange={(checked) =>
                            setPreferences({
                              ...preferences,
                              festivalUpdates: checked,
                            })
                          }
                        />
                        <ToggleRow
                          label="Panchangam Updates"
                          checked={preferences.panchangamUpdates}
                          onChange={(checked) =>
                            setPreferences({
                              ...preferences,
                              panchangamUpdates: checked,
                            })
                          }
                        />
                        <ToggleRow
                          label="Stotras & Prayers"
                          checked={preferences.stotrasAndPrayers}
                          onChange={(checked) =>
                            setPreferences({
                              ...preferences,
                              stotrasAndPrayers: checked,
                            })
                          }
                        />
                        <ToggleRow
                          label="Special Events"
                          checked={preferences.specialEvents}
                          onChange={(checked) =>
                            setPreferences({
                              ...preferences,
                              specialEvents: checked,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSavePreferences}
                        disabled={isSaving}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save Preferences"}
                      </button>
                      <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Recent Activity
                  </h2>

                  <div className="relative">
                    {activities.length === 0 ? (
                      <p className="text-gray-500">No recent activity</p>
                    ) : (
                      <div className="space-y-0">
                        {activities.map((activity, index) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4"
                          >
                            {/* Timeline Line */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  activity.type === "account_created"
                                    ? "bg-blue-100"
                                    : activity.type === "login"
                                    ? "bg-green-100"
                                    : "bg-purple-100"
                                }`}
                              >
                                {activity.type === "account_created" && (
                                  <UserIcon className="w-5 h-5 text-blue-600" />
                                )}
                                {activity.type === "login" && (
                                  <CheckIcon className="w-5 h-5 text-green-600" />
                                )}
                                {activity.type === "profile_updated" && (
                                  <EditIcon className="w-5 h-5 text-purple-600" />
                                )}
                              </div>
                              {index < activities.length - 1 && (
                                <div className="w-0.5 h-8 bg-gray-200"></div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex items-center justify-between pb-8">
                              <p className="text-gray-900 font-medium">
                                {activity.description}
                              </p>
                              <span className="text-sm text-primary">
                                {formatDate(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Toggle Component
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <span className="text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// Icons
function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}
