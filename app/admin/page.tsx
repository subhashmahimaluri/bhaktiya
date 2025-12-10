"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AUTH_ROUTES } from "@/lib/constants/authConfig";
import { getSupabase } from "@/lib/supabaseClient";
import { UserProfile } from "@/lib/types/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  actions: { label: string; href: string; primary?: boolean }[];
  comingSoon?: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabase();

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push(AUTH_ROUTES.LOGIN);
        return;
      }

      // Fetch user profile to check role
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_uid", authUser.id)
        .single();

      if (!profile || profile.role !== "admin") {
        // Not authorized - redirect to dashboard
        router.push(AUTH_ROUTES.DASHBOARD);
        return;
      }

      setUser(profile as UserProfile);
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading || !isAuthorized) {
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

  const adminCards: AdminCard[] = [
    {
      id: "articles",
      title: "Articles",
      description: "Create, edit, and manage articles on your website.",
      icon: <ArticleIcon />,
      actions: [
        { label: "Add Article", href: "/admin/articles/new", primary: true },
        { label: "View Articles", href: "/admin/articles" },
      ],
    },
    {
      id: "stotras",
      title: "Stotras",
      description: "Create, edit, and manage devotional stotras and prayers.",
      icon: <PrayerIcon />,
      actions: [
        { label: "Add Stotra", href: "/admin/stotras/new", primary: true },
        { label: "View Stotras", href: "/admin/stotras" },
      ],
    },
    {
      id: "media",
      title: "Media",
      description: "Upload, organize, and manage your media files and images.",
      icon: <MediaIcon />,
      actions: [
        { label: "Manage Media", href: "/admin/media", primary: true },
        { label: "Upload Files", href: "/admin/media/upload" },
      ],
    },
    {
      id: "blocks",
      title: "Blocks",
      description:
        "Create and manage reusable content blocks with multi-language support.",
      icon: <BlockIcon />,
      actions: [
        { label: "Add Block", href: "/admin/blocks/new", primary: true },
        { label: "Manage Blocks", href: "/admin/blocks" },
      ],
    },
    {
      id: "users",
      title: "Users",
      description: "Manage user accounts and permissions.",
      icon: <UsersIcon />,
      actions: [{ label: "Coming Soon", href: "#" }],
      comingSoon: true,
    },
    {
      id: "categories",
      title: "Categories & Tags",
      description: "Organize your content with categories and tags.",
      icon: <CategoryIcon />,
      actions: [
        {
          label: "Manage Categories",
          href: "/admin/categories",
          primary: true,
        },
        { label: "Add Category", href: "/admin/categories/new" },
      ],
    },
    {
      id: "comments",
      title: "Comments",
      description: "Manage and moderate user comments on articles and content.",
      icon: <CommentIcon />,
      actions: [
        { label: "Manage Comments", href: "/admin/comments", primary: true },
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Create and send push notifications to mobile app users.",
      icon: <NotificationIcon />,
      actions: [
        {
          label: "Manage Notifications",
          href: "/admin/notifications",
          primary: true,
        },
      ],
    },
  ];

  const navLinks = [
    { label: "Dashboard", href: "/admin" },
    { label: "Articles", href: "/admin/articles" },
    { label: "Add Article", href: "/admin/articles/new" },
    { label: "Stotras", href: "/admin/stotras" },
    { label: "Add Stotra", href: "/admin/stotras/new" },
    { label: "Blocks", href: "/admin/blocks" },
    { label: "Add Block", href: "/admin/blocks/new" },
    { label: "Categories", href: "/admin/categories" },
    { label: "Media", href: "/admin/media" },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100">
        {/* Admin Header */}
        <header className="bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <span className="font-semibold">Admin Panel</span>
              </div>
              <nav className="hidden md:flex items-center gap-4 text-sm">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <Link
                href="/"
                className="text-sm hover:text-secondary transition-colors"
              >
                ← Back to Site
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard {user?.name && `, ${user.name}`}
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome to the administration panel. Manage your content and
              settings here.
            </p>
          </div>

          {/* Admin Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminCards.map((card) => (
              <div
                key={card.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
                  card.comingSoon ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {card.actions.map((action, idx) => (
                    <Link
                      key={idx}
                      href={action.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        action.primary
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "border border-primary text-primary hover:bg-primary/10"
                      } ${card.comingSoon ? "pointer-events-none" : ""}`}
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* User Role Info */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Your Roles
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {user?.role}
              </span>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

// Icons
function ArticleIcon() {
  return <span>📄</span>;
}

function PrayerIcon() {
  return <span>🙏</span>;
}

function MediaIcon() {
  return <span>🖼️</span>;
}

function BlockIcon() {
  return <span>🧱</span>;
}

function UsersIcon() {
  return <span>👥</span>;
}

function CategoryIcon() {
  return <span>📁</span>;
}

function CommentIcon() {
  return <span>💬</span>;
}

function NotificationIcon() {
  return <span>🔔</span>;
}
