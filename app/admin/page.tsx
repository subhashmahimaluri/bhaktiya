"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getSupabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/login");
        return;
      }

      // Check if user is admin
      supabase
        .from("users")
        .select("role")
        .eq("auth_uid", session.user.id)
        .single()
        .then(({ data }) => {
          if (data?.role === "admin") {
            setIsAdmin(true);
          } else {
            router.push("/dashboard");
          }
          setLoading(false);
        });
    });
  }, [router]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p>Checking authorization...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Admin Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-2">📄 Articles</h2>
              <p className="text-gray-600 mb-4">Manage articles</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                Coming Soon
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-2">🙏 Stotras</h2>
              <p className="text-gray-600 mb-4">Manage stotras</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                Coming Soon
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-2">👥 Users</h2>
              <p className="text-gray-600 mb-4">Manage users</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
