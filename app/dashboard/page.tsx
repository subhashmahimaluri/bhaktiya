"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getSupabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/login");
        return;
      }

      // Get user profile
      supabase
        .from("users")
        .select("*")
        .eq("auth_uid", session.user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setUser({
              id: data.id,
              email: data.email,
              name: data.name,
              role: data.role,
            });
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.name,
            });
          }
        });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>

            {user ? (
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {user.name || "Not set"}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role || "basic"}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </div>

          {user?.role === "admin" && (
            <div className="mt-6">
              <Link
                href="/admin"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Go to Admin Panel
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
