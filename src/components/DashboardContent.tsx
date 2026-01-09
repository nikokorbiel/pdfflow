"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  Calendar,
  Zap,
  Crown,
  FileText,
  ArrowRight,
  Sparkles,
  Clock,
  Trash2,
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
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Search,
  Keyboard,
  CheckCircle,
  Circle,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFileHistory,
  removeFromHistory,
  clearFileHistory,
  formatRelativeTime,
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
  { id: "merge", name: "Merge PDF", href: "/merge", description: "Combine multiple PDFs into one", gradient: "from-blue-500 to-cyan-500", icon: Combine, shortcut: "M" },
  { id: "split", name: "Split PDF", href: "/split", description: "Extract or divide pages", gradient: "from-purple-500 to-pink-500", icon: Split, shortcut: "S" },
  { id: "compress", name: "Compress", href: "/compress", description: "Reduce file size", gradient: "from-orange-500 to-red-500", icon: FileDown, shortcut: "C" },
  { id: "pdf-to-image", name: "PDF to Image", href: "/pdf-to-image", description: "Convert to PNG/JPG", gradient: "from-green-500 to-emerald-500", icon: Image, shortcut: "I" },
  { id: "image-to-pdf", name: "Image to PDF", href: "/image-to-pdf", description: "Create PDF from images", gradient: "from-indigo-500 to-purple-500", icon: FileImage, shortcut: "P" },
  { id: "rotate", name: "Rotate PDF", href: "/rotate", description: "Rotate pages any direction", gradient: "from-pink-500 to-rose-500", icon: RotateCw, shortcut: "R" },
  { id: "watermark", name: "Watermark", href: "/watermark", description: "Add text or image watermarks", gradient: "from-blue-500 to-indigo-500", icon: Droplets, shortcut: "W" },
  { id: "page-numbers", name: "Page Numbers", href: "/page-numbers", description: "Add page numbering", gradient: "from-slate-500 to-gray-500", icon: Hash, shortcut: "N" },
  { id: "reorder", name: "Reorder Pages", href: "/reorder", description: "Drag & drop to rearrange", gradient: "from-teal-500 to-cyan-500", icon: ArrowUpDown, shortcut: "O" },
  { id: "sign", name: "Sign PDF", href: "/sign", description: "Add signatures & initials", gradient: "from-purple-500 to-pink-500", icon: PenTool, shortcut: "G" },
  { id: "protect", name: "Protect PDF", href: "/protect", description: "Password-protect your PDF", gradient: "from-amber-500 to-yellow-500", icon: Lock, shortcut: "L" },
  { id: "unlock", name: "Unlock PDF", href: "/unlock", description: "Remove PDF password", gradient: "from-cyan-500 to-sky-500", icon: Unlock, shortcut: "U" },
];

const FAVORITES_KEY = "pdfflow_favorite_tools";
const BANNER_DISMISSED_KEY = "pdfflow_whats_new_dismissed_v1.3";
const COLLAPSED_SECTIONS_KEY = "pdfflow_collapsed_sections";
const ONBOARDING_KEY = "pdfflow_onboarding_dismissed";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch { return []; }
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

function getCollapsedSections(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COLLAPSED_SECTIONS_KEY) || "[]");
  } catch { return []; }
}

function saveCollapsedSections(sections: string[]): void {
  localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(sections));
}

function isOnboardingDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

function dismissOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Calculate activity stats from history
function getActivityStats(history: FileHistoryItem[]) {
  const totalFiles = history.length;
  const toolCounts: Record<string, number> = {};

  history.forEach((item) => {
    toolCounts[item.toolName] = (toolCounts[item.toolName] || 0) + 1;
  });

  let mostUsedTool = null;
  let maxCount = 0;
  Object.entries(toolCounts).forEach(([tool, count]) => {
    if (count > maxCount) {
      mostUsedTool = tool;
      maxCount = count;
    }
  });

  return { totalFiles, mostUsedTool, mostUsedCount: maxCount };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Combine, Split, FileDown, Image, FileImage, FileText, RotateCw, Droplets, Hash, ArrowUpDown, PenTool, Lock, Unlock,
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

// Animated Greeting Component
function AnimatedGreeting({ name }: { name: string }) {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const greeting = `${getTimeBasedGreeting()}, ${name}`;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    let index = 0;
    const timer = setInterval(() => {
      if (index <= greeting.length) {
        setDisplayText(greeting.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowCursor(false), 500);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [greeting]);

  return (
    <h1 className="mt-6 text-3xl font-semibold">
      {displayText}
      <span className={`inline-block w-0.5 h-8 ml-1 bg-[var(--accent)] align-middle transition-opacity duration-100 ${showCursor ? "opacity-100 animate-pulse" : "opacity-0"}`} />
    </h1>
  );
}

// Keyboard Shortcuts Modal
function KeyboardShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Navigate faster with shortcuts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <X className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Navigation</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Open shortcuts</span>
                  <kbd className="px-2 py-1 rounded bg-[var(--muted)] text-xs font-mono">?</kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Search tools</span>
                  <kbd className="px-2 py-1 rounded bg-[var(--muted)] text-xs font-mono">/</kbd>
                </div>
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-4">
              <h3 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                {allTools.map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between py-1.5">
                    <span className="text-sm truncate">{tool.name}</span>
                    <kbd className="px-2 py-0.5 rounded bg-[var(--muted)] text-xs font-mono ml-2">{tool.shortcut}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/30">
          <p className="text-xs text-center text-[var(--muted-foreground)]">Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-xs font-mono">Esc</kbd> to close</p>
        </div>
      </div>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  id, title, icon: Icon, children, collapsedSections, onToggle
}: {
  id: string; title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; collapsedSections: string[]; onToggle: (id: string) => void;
}) {
  const isCollapsed = collapsedSections.includes(id);

  return (
    <div className="mb-10">
      <button
        onClick={() => onToggle(id)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
          {title}
        </h2>
        <ChevronDown className={`h-5 w-5 text-[var(--muted-foreground)] transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
      </button>
      {!isCollapsed && children}
    </div>
  );
}

export function DashboardContent({ profile, usage }: DashboardContentProps) {
  const router = useRouter();
  const { isPro } = useAuth();
  const todayUsage = usage?.file_count ?? 0;
  const maxFiles = isPro ? 999 : 2;
  const usagePercentage = isPro ? 0 : Math.min((todayUsage / maxFiles) * 100, 100);

  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [watermarkTemplates, setWatermarkTemplates] = useState<WatermarkTemplate[]>([]);
  const [signatureTemplates, setSignatureTemplates] = useState<SignatureTemplate[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFileHistory(getFileHistory());
    setWorkflows(getWorkflows());
    setWatermarkTemplates(getWatermarkTemplates());
    setSignatureTemplates(getSignatureTemplates());
    setFavorites(getFavorites());
    setShowBanner(!isBannerDismissed());
    setCollapsedSections(getCollapsedSections());
    setShowOnboarding(!isOnboardingDismissed());
  }, []);

  // Activity stats
  const stats = getActivityStats(fileHistory);

  // Onboarding checklist items
  const onboardingItems = [
    { id: "profile", label: "Complete your profile", done: !!profile?.full_name },
    { id: "first-tool", label: "Process your first PDF", done: fileHistory.length > 0 },
    { id: "favorite", label: "Add a tool to favorites", done: favorites.length > 0 },
    { id: "workflow", label: "Create a workflow", done: workflows.length > 0 },
  ];
  const completedOnboarding = onboardingItems.filter(i => i.done).length;
  const allOnboardingDone = completedOnboarding === onboardingItems.length;

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.key === "?") {
      e.preventDefault();
      setShowShortcuts(true);
    } else if (e.key === "/") {
      e.preventDefault();
      searchInputRef.current?.focus();
    } else if (e.key === "Escape") {
      setShowShortcuts(false);
      searchInputRef.current?.blur();
    } else {
      // Tool shortcuts
      const tool = allTools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
      if (tool) {
        e.preventDefault();
        router.push(tool.href);
      }
    }
  }, [router]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleFavorite = (toolId: string) => {
    const newFavorites = favorites.includes(toolId) ? favorites.filter(id => id !== toolId) : [...favorites, toolId];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const handleDismissBanner = () => {
    dismissBanner();
    setShowBanner(false);
  };

  const handleDismissOnboarding = () => {
    dismissOnboarding();
    setShowOnboarding(false);
  };

  const toggleSection = (sectionId: string) => {
    const newSections = collapsedSections.includes(sectionId)
      ? collapsedSections.filter(id => id !== sectionId)
      : [...collapsedSections, sectionId];
    setCollapsedSections(newSections);
    saveCollapsedSections(newSections);
  };

  const favoriteTools = allTools.filter(tool => favorites.includes(tool.id));
  const nonFavoriteTools = allTools.filter(tool => !favorites.includes(tool.id));
  const quickAccessTools = favoriteTools.length > 0 ? favoriteTools.slice(0, 6) : allTools.slice(0, 6);

  // Filter tools by search
  const filteredTools = searchQuery
    ? allTools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (favoriteTools.length > 0 ? nonFavoriteTools : allTools);

  const handleRemoveFromHistory = (id: string) => {
    removeFromHistory(id);
    setFileHistory(getFileHistory());
  };

  const handleClearHistory = () => {
    clearFileHistory();
    setFileHistory([]);
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-[80vh]">
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {/* What's New Banner */}
          {showBanner && (
            <div className="mb-8 animate-fade-in-up">
              <div className="relative overflow-hidden rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 p-4">
                <button onClick={handleDismissBanner} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[var(--muted)] transition-colors">
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
                  <Link href="/changelog" className="hidden sm:flex items-center gap-1 text-sm text-[var(--accent)] hover:opacity-80 transition-opacity whitespace-nowrap">
                    See all updates <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-8">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || "User"} className="h-20 w-20 rounded-2xl object-cover border-2 border-[var(--border)] shadow-lg" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-500 shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
                {isPro && (
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <AnimatedGreeting name={firstName} />
                <p className="mt-1 text-[var(--muted-foreground)]">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2.5 rounded-xl border bg-[var(--card)] hover:bg-[var(--muted)] transition-colors"
                title="Keyboard shortcuts (?)"
              >
                <Keyboard className="h-5 w-5 text-[var(--muted-foreground)]" />
              </button>
              <div className={`px-4 py-2 rounded-xl border ${isPro ? "border-yellow-500/30 bg-yellow-500/10" : "border-[var(--border)] bg-[var(--card)]"}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isPro ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-gradient-to-br from-[var(--accent)] to-purple-500"}`}>
                    {isPro ? <Crown className="h-4 w-4 text-white" /> : <Zap className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Current Plan</p>
                    <p className="font-semibold text-sm">{isPro ? "Pro" : "Free"}</p>
                  </div>
                </div>
              </div>
              {!isPro && (
                <Link href="/pricing" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2">
                  Upgrade <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            {/* Usage */}
            {!isPro && (
              <div className="p-4 rounded-xl border bg-[var(--card)]">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <span className="text-sm font-medium">Daily Usage</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{todayUsage}/{maxFiles}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">files today</span>
                </div>
                <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden mt-3">
                  <div className={`h-full rounded-full transition-all ${usagePercentage >= 100 ? "bg-red-500" : usagePercentage >= 50 ? "bg-yellow-500" : "bg-[var(--accent)]"}`} style={{ width: `${usagePercentage}%` }} />
                </div>
              </div>
            )}

            {/* Total Processed */}
            <div className="p-4 rounded-xl border bg-[var(--card)]">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span className="text-sm font-medium">Total Processed</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold">{stats.totalFiles}</span>
                <span className="text-xs text-[var(--muted-foreground)]">files all time</span>
              </div>
            </div>

            {/* Most Used */}
            <div className="p-4 rounded-xl border bg-[var(--card)]">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span className="text-sm font-medium">Most Used Tool</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-lg font-bold truncate">{stats.mostUsedTool || "—"}</span>
                {stats.mostUsedCount > 0 && <span className="text-xs text-[var(--muted-foreground)]">{stats.mostUsedCount}x</span>}
              </div>
            </div>
          </div>

          {/* Onboarding Checklist */}
          {showOnboarding && !allOnboardingDone && (
            <div className="mb-8 p-5 rounded-2xl border bg-[var(--card)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Get Started</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">{completedOnboarding} of {onboardingItems.length} completed</p>
                  </div>
                </div>
                <button onClick={handleDismissOnboarding} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  Dismiss
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {onboardingItems.map((item) => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg ${item.done ? "bg-emerald-500/10" : "bg-[var(--muted)]/50"}`}>
                    {item.done ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-[var(--muted-foreground)] flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.done ? "text-emerald-600 line-through" : ""}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search tools... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--muted)]">
                  <X className="h-4 w-4 text-[var(--muted-foreground)]" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Access Bar */}
          {!searchQuery && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Quick Access</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickAccessTools.map((tool) => (
                  <Link key={tool.id} href={tool.href} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-[var(--card)] hover:border-[var(--accent)] hover:shadow-md transition-all" title={`${tool.description} (${tool.shortcut})`}>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${tool.gradient}`}>
                      <tool.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{tool.name}</span>
                  </Link>
                ))}
                <Link href="#all-tools" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                  <span className="text-sm">All tools</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Continue Where You Left Off */}
          {!searchQuery && fileHistory.length > 0 && (
            <CollapsibleSection id="history" title="Continue Where You Left Off" icon={Clock} collapsedSections={collapsedSections} onToggle={toggleSection}>
              <div className="flex justify-end mb-4 -mt-2">
                <button onClick={handleClearHistory} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                  Clear history
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fileHistory.slice(0, 3).map((item) => {
                  const IconComponent = iconMap[item.toolIcon] || FileText;
                  const gradient = toolColors[item.tool] || "from-gray-500 to-gray-400";
                  return (
                    <div key={item.id} className="group flex items-center gap-3 p-4 rounded-xl border bg-[var(--card)] hover:shadow-md transition-all">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow flex-shrink-0`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.originalName}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{item.toolName} • {formatRelativeTime(item.timestamp)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link href={`/${item.tool}`} className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors" title="Process again">
                          <RefreshCw className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleRemoveFromHistory(item.id)} className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors opacity-0 group-hover:opacity-100" title="Remove">
                          <Trash2 className="h-4 w-4 text-[var(--muted-foreground)]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* Saved Workflows */}
          {!searchQuery && (
            <CollapsibleSection id="workflows" title="Saved Workflows" icon={Workflow} collapsedSections={collapsedSections} onToggle={toggleSection}>
              {workflows.length > 0 ? (
                <>
                  <div className="flex justify-end mb-4 -mt-2">
                    <Link href="/workflow" className="text-sm text-[var(--accent)] hover:opacity-80 transition-opacity">View all</Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {workflows.slice(0, 3).map((workflow) => (
                      <Link key={workflow.id} href="/workflow" className="group flex items-center gap-3 p-4 rounded-xl border bg-[var(--card)] hover:shadow-md transition-all">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow flex-shrink-0">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate group-hover:text-[var(--accent)] transition-colors">{workflow.name}</h3>
                          <p className="text-xs text-[var(--muted-foreground)]">{workflow.steps.length} step{workflow.steps.length !== 1 ? "s" : ""}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors" />
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex-shrink-0">
                      <Workflow className="h-6 w-6 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-0.5">Create your first workflow</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">Chain multiple tools together</p>
                    </div>
                    <Link href="/workflow" className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--muted)] transition-all flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Create
                    </Link>
                  </div>
                </div>
              )}
            </CollapsibleSection>
          )}

          {/* Saved Templates */}
          {!searchQuery && (watermarkTemplates.length > 0 || signatureTemplates.length > 0) && (
            <CollapsibleSection id="templates" title="Saved Templates" icon={Layers} collapsedSections={collapsedSections} onToggle={toggleSection}>
              <div className="grid gap-3 sm:grid-cols-2">
                {watermarkTemplates.length > 0 && (
                  <Link href="/watermark" className="group flex items-center gap-3 p-4 rounded-xl border bg-[var(--card)] hover:shadow-md transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow flex-shrink-0">
                      <Droplets className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm group-hover:text-[var(--accent)] transition-colors">Watermark Templates</h3>
                      <p className="text-xs text-[var(--muted-foreground)]">{watermarkTemplates.length} saved</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </Link>
                )}
                {signatureTemplates.length > 0 && (
                  <Link href="/sign" className="group flex items-center gap-3 p-4 rounded-xl border bg-[var(--card)] hover:shadow-md transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow flex-shrink-0">
                      <PenTool className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm group-hover:text-[var(--accent)] transition-colors">Signature Templates</h3>
                      <p className="text-xs text-[var(--muted-foreground)]">{signatureTemplates.length} saved</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </Link>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Favorite Tools */}
          {!searchQuery && favoriteTools.length > 0 && (
            <CollapsibleSection id="favorites" title="Favorites" icon={Star} collapsedSections={collapsedSections} onToggle={toggleSection}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteTools.map((tool) => (
                  <div key={tool.id} className="group relative rounded-xl border bg-[var(--card)] hover:shadow-md transition-all">
                    <button onClick={() => toggleFavorite(tool.id)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors z-10" title="Remove from favorites">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </button>
                    <Link href={tool.href} className="flex items-center gap-3 p-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} shadow flex-shrink-0`}>
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <h3 className="font-medium text-sm group-hover:text-[var(--accent)] transition-colors">{tool.name}</h3>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">{tool.description}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* All Tools */}
          <div id="all-tools" className="scroll-mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {searchQuery ? `Search Results (${filteredTools.length})` : favoriteTools.length > 0 ? "All Tools" : "PDF Tools"}
              </h2>
              {!searchQuery && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Click <Star className="h-3.5 w-3.5 inline mx-0.5" /> to favorite
                </p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTools.map((tool) => (
                <div key={tool.id} className="group relative rounded-xl border bg-[var(--card)] hover:shadow-md transition-all h-[88px]">
                  <button onClick={() => toggleFavorite(tool.id)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors z-10" title={favorites.includes(tool.id) ? "Remove from favorites" : "Add to favorites"}>
                    <Star className={`h-4 w-4 ${favorites.includes(tool.id) ? "text-yellow-500 fill-yellow-500" : "text-[var(--muted-foreground)] group-hover:text-yellow-500"} transition-colors`} />
                  </button>
                  <Link href={tool.href} className="flex items-center gap-3 p-4 h-full">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} shadow flex-shrink-0`}>
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h3 className="font-medium text-sm group-hover:text-[var(--accent)] transition-colors">{tool.name}</h3>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{tool.description}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            {searchQuery && filteredTools.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
                <p className="text-[var(--muted-foreground)]">No tools found for &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <div className="flex items-center justify-center gap-6 text-xs text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "-"}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
              <button onClick={() => setShowShortcuts(true)} className="hover:text-[var(--foreground)] transition-colors">
                Shortcuts (?)
              </button>
              <div className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
              <Link href="/settings" className="hover:text-[var(--foreground)] transition-colors">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
