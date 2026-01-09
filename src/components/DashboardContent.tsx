"use client";

import { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Zap,
  Crown,
  FileText,
  Settings as SettingsIcon,
  ArrowRight,
  Sparkles,
  Clock,
  Trash2,
  ExternalLink,
  Combine,
  Split,
  FileDown,
  Image,
  FileImage,
  RotateCw,
  Droplets,
  Hash,
  ArrowUpDown,
  PenTool,
  Lock,
  Unlock,
  X,
  Star,
  Workflow,
  Play,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFileHistory,
  removeFromHistory,
  clearFileHistory,
  formatRelativeTime,
  formatFileSize,
  FileHistoryItem,
} from "@/lib/file-history";
import { getWorkflows, Workflow as WorkflowType } from "@/lib/workflow";
import { getWatermarkTemplates, getSignatureTemplates, WatermarkTemplate, SignatureTemplate } from "@/lib/templates";

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

const allTools = [
  { id: "merge", name: "Merge PDF", href: "/merge", description: "Combine multiple PDFs into one", gradient: "from-blue-500 to-cyan-500", icon: Combine },
  { id: "split", name: "Split PDF", href: "/split", description: "Extract or divide pages", gradient: "from-purple-500 to-pink-500", icon: Split },
  { id: "compress", name: "Compress", href: "/compress", description: "Reduce file size", gradient: "from-orange-500 to-red-500", icon: FileDown },
  { id: "pdf-to-image", name: "PDF to Image", href: "/pdf-to-image", description: "Convert to PNG/JPG", gradient: "from-green-500 to-emerald-500", icon: Image },
  { id: "image-to-pdf", name: "Image to PDF", href: "/image-to-pdf", description: "Create PDF from images", gradient: "from-indigo-500 to-purple-500", icon: FileImage },
  { id: "rotate", name: "Rotate PDF", href: "/rotate", description: "Rotate pages any direction", gradient: "from-pink-500 to-rose-500", icon: RotateCw },
  { id: "watermark", name: "Watermark", href: "/watermark", description: "Add text or image watermarks", gradient: "from-blue-500 to-indigo-500", icon: Droplets },
  { id: "page-numbers", name: "Page Numbers", href: "/page-numbers", description: "Add page numbering", gradient: "from-slate-500 to-gray-500", icon: Hash },
  { id: "reorder", name: "Reorder Pages", href: "/reorder", description: "Drag & drop to rearrange", gradient: "from-teal-500 to-cyan-500", icon: ArrowUpDown },
  { id: "sign", name: "Sign PDF", href: "/sign", description: "Add signatures & initials", gradient: "from-purple-500 to-pink-500", icon: PenTool },
  { id: "protect", name: "Protect PDF", href: "/protect", description: "Password-protect your PDF", gradient: "from-amber-500 to-yellow-500", icon: Lock },
  { id: "unlock", name: "Unlock PDF", href: "/unlock", description: "Remove PDF password", gradient: "from-cyan-500 to-sky-500", icon: Unlock },
];

const FAVORITES_KEY = "pdfflow_favorite_tools";
const BANNER_DISMISSED_KEY = "pdfflow_whats_new_dismissed_v1.3";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isBannerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BANNER_DISMISSED_KEY) === "true";
}

function dismissBanner(): void {
  localStorage.setItem(BANNER_DISMISSED_KEY, "true");
}

// Icon map for history items
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Combine,
  Split,
  FileDown,
  Image,
  FileImage,
  FileText,
  RotateCw,
  Droplets,
  Hash,
  ArrowUpDown,
  PenTool,
  Lock,
  Unlock,
};

const toolColors: Record<string, string> = {
  merge: "from-violet-500 to-purple-500",
  split: "from-blue-500 to-cyan-400",
  compress: "from-emerald-500 to-teal-400",
  "pdf-to-image": "from-orange-500 to-amber-400",
  "image-to-pdf": "from-indigo-500 to-blue-400",
  "pdf-to-word": "from-blue-600 to-blue-400",
  rotate: "from-teal-500 to-cyan-400",
  watermark: "from-blue-500 to-indigo-500",
  "page-numbers": "from-slate-500 to-gray-400",
  reorder: "from-pink-500 to-rose-500",
  sign: "from-purple-500 to-pink-500",
  protect: "from-amber-500 to-yellow-500",
  unlock: "from-cyan-500 to-sky-500",
};

export function DashboardContent({
  profile,
  subscription,
  usage,
}: DashboardContentProps) {
  const { signOut, isPro } = useAuth();
  const todayUsage = usage?.file_count ?? 0;
  const maxFiles = isPro ? "Unlimited" : "2";

  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [watermarkTemplates, setWatermarkTemplates] = useState<WatermarkTemplate[]>([]);
  const [signatureTemplates, setSignatureTemplates] = useState<SignatureTemplate[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setFileHistory(getFileHistory());
    setWorkflows(getWorkflows());
    setWatermarkTemplates(getWatermarkTemplates());
    setSignatureTemplates(getSignatureTemplates());
    setFavorites(getFavorites());
    setShowBanner(!isBannerDismissed());
  }, []);

  const toggleFavorite = (toolId: string) => {
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter((id) => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const handleDismissBanner = () => {
    dismissBanner();
    setShowBanner(false);
  };

  const favoriteTools = allTools.filter((tool) => favorites.includes(tool.id));
  const nonFavoriteTools = allTools.filter((tool) => !favorites.includes(tool.id));

  const handleRemoveFromHistory = (id: string) => {
    removeFromHistory(id);
    setFileHistory(getFileHistory());
  };

  const handleClearHistory = () => {
    clearFileHistory();
    setFileHistory([]);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          {/* What's New Banner */}
          {showBanner && (
            <div className="mb-8 animate-fade-in-up">
              <div className="relative overflow-hidden rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 p-4">
                <button
                  onClick={handleDismissBanner}
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[var(--muted)] transition-colors"
                >
                  <X className="h-4 w-4 text-[var(--muted-foreground)]" />
                </button>
                <div className="flex items-center gap-4 pr-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-500 flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">New in v1.3: Workflow Builder</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Chain multiple tools together and save templates for reuse.</p>
                  </div>
                  <Link
                    href="/changelog"
                    className="hidden sm:flex items-center gap-1 text-sm text-[var(--accent)] hover:opacity-80 transition-opacity whitespace-nowrap"
                  >
                    See all updates
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

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

          {/* Saved Workflows */}
          {workflows.length > 0 && (
            <div
              className="mt-12 animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-[var(--muted-foreground)]" />
                  Saved Workflows
                </h2>
                <Link
                  href="/workflow"
                  className="text-sm text-[var(--accent)] hover:opacity-80 transition-opacity"
                >
                  View all
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {workflows.slice(0, 3).map((workflow) => (
                  <Link
                    key={workflow.id}
                    href="/workflow"
                    className="group p-4 rounded-2xl border bg-[var(--card)] hover:shadow-glass transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg flex-shrink-0">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {workflow.steps.length} step{workflow.steps.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Saved Templates */}
          {(watermarkTemplates.length > 0 || signatureTemplates.length > 0) && (
            <div
              className="mt-12 animate-fade-in-up"
              style={{ animationDelay: "0.18s" }}
            >
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <Layers className="h-5 w-5 text-[var(--muted-foreground)]" />
                Saved Templates
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Watermark Templates */}
                {watermarkTemplates.length > 0 && (
                  <Link
                    href="/watermark"
                    className="group p-4 rounded-2xl border bg-[var(--card)] hover:shadow-glass transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg flex-shrink-0">
                        <Droplets className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium group-hover:text-[var(--accent)] transition-colors">
                          Watermark Templates
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {watermarkTemplates.length} saved template{watermarkTemplates.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                )}

                {/* Signature Templates */}
                {signatureTemplates.length > 0 && (
                  <Link
                    href="/sign"
                    className="group p-4 rounded-2xl border bg-[var(--card)] hover:shadow-glass transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg flex-shrink-0">
                        <PenTool className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium group-hover:text-[var(--accent)] transition-colors">
                          Signature Templates
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {signatureTemplates.length} saved signature{signatureTemplates.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Recent Files */}
          {fileHistory.length > 0 && (
            <div
              className="mt-12 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[var(--muted-foreground)]" />
                  Recent Files
                </h2>
                <button
                  onClick={handleClearHistory}
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-3">
                {fileHistory.map((item) => {
                  const IconComponent = iconMap[item.toolIcon] || FileText;
                  const gradient = toolColors[item.tool] || "from-gray-500 to-gray-400";

                  return (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 p-4 rounded-2xl border bg-[var(--card)] hover:shadow-glass transition-all"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg flex-shrink-0`}
                      >
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.originalName}</p>
                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                          <span>{item.toolName}</span>
                          {item.fileSize && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(item.fileSize)}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatRelativeTime(item.timestamp)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/${item.tool}`}
                          className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                          title="Process again"
                        >
                          <ExternalLink className="h-4 w-4 text-[var(--muted-foreground)]" />
                        </Link>
                        <button
                          onClick={() => handleRemoveFromHistory(item.id)}
                          className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                          title="Remove from history"
                        >
                          <Trash2 className="h-4 w-4 text-[var(--muted-foreground)]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Favorite Tools */}
          {favoriteTools.length > 0 && (
            <div
              className="mt-12 animate-fade-in-up"
              style={{ animationDelay: "0.22s" }}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Favorites
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="group relative overflow-hidden rounded-2xl border bg-[var(--card)] p-5 hover:shadow-glass transition-all"
                  >
                    <button
                      onClick={() => toggleFavorite(tool.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors z-10"
                      title="Remove from favorites"
                    >
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </button>
                    <Link href={tool.href} className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg flex-shrink-0`}
                      >
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <h3 className="font-medium group-hover:text-[var(--accent)] transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Tools */}
          <div
            className="mt-12 animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            <h2 className="text-xl font-semibold mb-2">
              {favoriteTools.length > 0 ? "All Tools" : "Quick Actions"}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Click the star to add tools to your favorites
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(favoriteTools.length > 0 ? nonFavoriteTools : allTools).map((tool) => (
                <div
                  key={tool.id}
                  className="group relative overflow-hidden rounded-2xl border bg-[var(--card)] p-5 hover:shadow-glass transition-all"
                >
                  <button
                    onClick={() => toggleFavorite(tool.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors z-10"
                    title={favorites.includes(tool.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        favorites.includes(tool.id)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-[var(--muted-foreground)] group-hover:text-yellow-500"
                      } transition-colors`}
                    />
                  </button>
                  <Link href={tool.href} className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg flex-shrink-0`}
                    >
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="font-medium group-hover:text-[var(--accent)] transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                </div>
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
