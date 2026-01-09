"use client";

import {
  User,
  Calendar,
  Zap,
  Crown,
  FileText,
  Settings as SettingsIcon,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardContentProps {
  profile: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    created_at: string;
  } | null;
  subscription: {
    plan: string;
    status: string;
    current_period_end: string | null;
  } | null;
  usage: {
    file_count: number;
  } | null;
}

const tools = [
  {
    name: "Merge PDF",
    href: "/merge",
    description: "Combine multiple PDFs into one",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Split PDF",
    href: "/split",
    description: "Extract or divide pages",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Compress",
    href: "/compress",
    description: "Reduce file size",
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "PDF to Image",
    href: "/pdf-to-image",
    description: "Convert to PNG/JPG",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Image to PDF",
    href: "/image-to-pdf",
    description: "Create PDF from images",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    name: "Rotate PDF",
    href: "/rotate",
    description: "Rotate pages any direction",
    gradient: "from-pink-500 to-rose-500",
  },
];

export function DashboardContent({
  profile,
  subscription,
  usage,
}: DashboardContentProps) {
  const { signOut, isPro } = useAuth();
  const todayUsage = usage?.file_count ?? 0;
  const maxFiles = isPro ? "Unlimited" : "2";

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "User"}
                  className="h-24 w-24 rounded-full object-cover border-4 border-[var(--accent)] shadow-lg shadow-[var(--accent)]/25"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 shadow-lg shadow-[var(--accent)]/25">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
              {isPro && (
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                  <Crown className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <h1 className="mt-6 text-3xl font-semibold">
              Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
            </h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              {profile?.email}
            </p>
          </div>

          {/* Stats cards */}
          <div
            className="mt-12 grid gap-6 sm:grid-cols-3 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="rounded-3xl border bg-[var(--card)] p-6 hover:shadow-glass transition-all">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Current Plan
                  </p>
                  <p className="text-xl font-semibold capitalize">
                    {subscription?.plan || "Free"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-[var(--card)] p-6 hover:shadow-glass transition-all">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Today&apos;s Usage
                  </p>
                  <p className="text-xl font-semibold">
                    {todayUsage} / {maxFiles}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-[var(--card)] p-6 hover:shadow-glass transition-all">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Member Since
                  </p>
                  <p className="text-xl font-semibold">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade CTA for free users */}
          {!isPro && (
            <div
              className="mt-8 animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-[var(--accent)]/10 to-purple-500/10 p-6 sm:p-8">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-purple-500 rounded-full opacity-20 blur-2xl" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Crown className="h-5 w-5 text-[var(--accent)]" />
                      Upgrade to Pro
                    </h3>
                    <p className="mt-1 text-[var(--muted-foreground)]">
                      Get unlimited file processing, 100MB file size limit, and
                      priority support.
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white font-medium shadow-lg shadow-[var(--accent)]/25 hover:opacity-90 transition-all whitespace-nowrap"
                  >
                    View Plans
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div
            className="mt-12 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="group relative overflow-hidden rounded-2xl border bg-[var(--card)] p-5 hover:shadow-glass transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg`}
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-[var(--accent)] transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {tool.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Account actions */}
          <div
            className="mt-12 flex flex-wrap gap-4 justify-center animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            <Link
              href="/settings"
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-all"
            >
              <SettingsIcon className="h-5 w-5" />
              Settings
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
