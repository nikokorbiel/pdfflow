"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  Zap,
  Crown,
  FileText,
  ArrowRight,
  ArrowUpRight,
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
  Search,
  Command,
  TrendingUp,
  Table,
  Presentation,
  Code,
  Crop,
  EyeOff,
  FileCheck,
  Wrench,
  ImageIcon,
  Upload,
  Sparkles,
  Activity,
  FolderOpen,
  Settings,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFileHistory,
  removeFromHistory,
  formatRelativeTime,
  FileHistoryItem,
} from "@/lib/file-history";
import { getWorkflows, Workflow as WorkflowType } from "@/lib/workflow";

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
  { id: "merge", name: "Merge PDF", href: "/merge", description: "Combine multiple PDFs", gradient: "from-blue-500 to-cyan-500", icon: Combine, shortcut: "M", category: "organize" },
  { id: "split", name: "Split PDF", href: "/split", description: "Extract pages", gradient: "from-violet-500 to-purple-500", icon: Split, shortcut: "S", category: "organize" },
  { id: "compress", name: "Compress", href: "/compress", description: "Reduce file size", gradient: "from-orange-500 to-amber-500", icon: FileDown, shortcut: "C", category: "optimize" },
  { id: "pdf-to-image", name: "PDF to Image", href: "/pdf-to-image", description: "Convert to PNG/JPG", gradient: "from-emerald-500 to-teal-500", icon: Image, shortcut: "I", category: "convert" },
  { id: "image-to-pdf", name: "Image to PDF", href: "/image-to-pdf", description: "Images to PDF", gradient: "from-pink-500 to-rose-500", icon: FileImage, shortcut: "P", category: "convert" },
  { id: "rotate", name: "Rotate", href: "/rotate", description: "Rotate pages", gradient: "from-cyan-500 to-blue-500", icon: RotateCw, shortcut: "R", category: "edit" },
  { id: "watermark", name: "Watermark", href: "/watermark", description: "Add watermarks", gradient: "from-indigo-500 to-blue-500", icon: Droplets, shortcut: "W", category: "edit" },
  { id: "sign", name: "Sign PDF", href: "/sign", description: "Add signatures", gradient: "from-purple-500 to-pink-500", icon: PenTool, shortcut: "G", category: "edit" },
  { id: "protect", name: "Protect", href: "/protect", description: "Password protect", gradient: "from-amber-500 to-orange-500", icon: Lock, shortcut: "L", category: "security" },
  { id: "unlock", name: "Unlock", href: "/unlock", description: "Remove password", gradient: "from-teal-500 to-emerald-500", icon: Unlock, shortcut: "U", category: "security" },
  { id: "reorder", name: "Reorder", href: "/reorder", description: "Rearrange pages", gradient: "from-rose-500 to-pink-500", icon: ArrowUpDown, shortcut: "O", category: "organize" },
  { id: "delete-pages", name: "Delete Pages", href: "/delete-pages", description: "Remove pages", gradient: "from-red-500 to-rose-500", icon: Trash2, shortcut: "D", category: "organize" },
  { id: "page-numbers", name: "Page Numbers", href: "/page-numbers", description: "Add numbering", gradient: "from-slate-500 to-zinc-500", icon: Hash, shortcut: "N", category: "edit" },
  { id: "crop", name: "Crop", href: "/crop", description: "Trim margins", gradient: "from-fuchsia-500 to-purple-500", icon: Crop, shortcut: "K", category: "edit" },
  { id: "redact", name: "Redact", href: "/redact", description: "Hide content", gradient: "from-zinc-600 to-slate-600", icon: EyeOff, shortcut: "A", category: "security" },
  { id: "flatten", name: "Flatten", href: "/flatten", description: "Flatten forms", gradient: "from-blue-600 to-indigo-600", icon: Layers, shortcut: "F", category: "optimize" },
  { id: "repair", name: "Repair", href: "/repair", description: "Fix corrupted", gradient: "from-yellow-500 to-amber-500", icon: Wrench, shortcut: "Q", category: "optimize" },
  { id: "extract-images", name: "Extract Images", href: "/extract-images", description: "Pull images", gradient: "from-sky-500 to-cyan-500", icon: ImageIcon, shortcut: "E", category: "convert" },
  { id: "pdf-to-excel", name: "PDF to Excel", href: "/pdf-to-excel", description: "To spreadsheet", gradient: "from-green-600 to-emerald-600", icon: Table, shortcut: "X", category: "convert" },
  { id: "pdf-to-powerpoint", name: "PDF to PPT", href: "/pdf-to-powerpoint", description: "To slides", gradient: "from-orange-600 to-red-500", icon: Presentation, shortcut: "T", category: "convert" },
  { id: "html-to-pdf", name: "HTML to PDF", href: "/html-to-pdf", description: "Web to PDF", gradient: "from-violet-600 to-purple-600", icon: Code, shortcut: "H", category: "convert" },
  { id: "pdf-to-pdfa", name: "PDF/A", href: "/pdf-to-pdfa", description: "Archive format", gradient: "from-emerald-600 to-green-600", icon: FileCheck, shortcut: "V", category: "convert" },
];

const FAVORITES_KEY = "pdfflow_favorite_tools";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch { return []; }
}

function saveFavorites(favorites: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Combine, Split, FileDown, Image, FileImage, FileText, RotateCw, Droplets, Hash, ArrowUpDown, PenTool, Lock, Unlock,
  Table, Presentation, Code, Crop, EyeOff, FileCheck, Wrench, ImageIcon, Trash2, Layers,
};

const toolGradients: Record<string, string> = {
  merge: "from-blue-500 to-cyan-500",
  split: "from-violet-500 to-purple-500",
  compress: "from-orange-500 to-amber-500",
  "pdf-to-image": "from-emerald-500 to-teal-500",
  "image-to-pdf": "from-pink-500 to-rose-500",
  rotate: "from-cyan-500 to-blue-500",
  watermark: "from-indigo-500 to-blue-500",
  sign: "from-purple-500 to-pink-500",
  protect: "from-amber-500 to-orange-500",
  unlock: "from-teal-500 to-emerald-500",
  reorder: "from-rose-500 to-pink-500",
  "delete-pages": "from-red-500 to-rose-500",
  "page-numbers": "from-slate-500 to-zinc-500",
  crop: "from-fuchsia-500 to-purple-500",
  redact: "from-zinc-600 to-slate-600",
  flatten: "from-blue-600 to-indigo-600",
  repair: "from-yellow-500 to-amber-500",
  "extract-images": "from-sky-500 to-cyan-500",
  "pdf-to-excel": "from-green-600 to-emerald-600",
  "pdf-to-powerpoint": "from-orange-600 to-red-500",
  "html-to-pdf": "from-violet-600 to-purple-600",
  "pdf-to-pdfa": "from-emerald-600 to-green-600",
};

// Command Palette Component
function CommandPalette({
  isOpen,
  onClose,
  tools,
  onNavigate
}: {
  isOpen: boolean;
  onClose: () => void;
  tools: typeof allTools;
  onNavigate: (href: string) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredTools = query
    ? tools.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
      )
    : tools.slice(0, 8);

  const handleSelect = (href: string) => {
    onNavigate(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-4 overflow-hidden rounded-2xl bg-[#0c0c0f] border border-white/10 shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 py-4 bg-transparent text-white placeholder:text-white/40 focus:outline-none text-lg"
          />
          <kbd className="px-2 py-1 rounded bg-white/10 text-white/40 text-xs font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filteredTools.length > 0 ? (
            <div className="space-y-1">
              {filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool.href)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient}`}>
                    <tool.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white group-hover:text-white">{tool.name}</p>
                    <p className="text-sm text-white/50">{tool.description}</p>
                  </div>
                  <kbd className="px-2 py-1 rounded bg-white/5 text-white/30 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {tool.shortcut}
                  </kbd>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-white/40">
              No tools found for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 text-xs text-white/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">↵</kbd> Select</span>
          </div>
          <span>Press letter key for quick access</span>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  gradient
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down";
  gradient: string;
}) {
  return (
    <div className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
            <TrendingUp className={`h-3 w-3 ${trend === "down" ? "rotate-180" : ""}`} />
            <span>{trend === "up" ? "+12%" : "-5%"}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
      {subtext && <p className="text-xs text-white/30 mt-1">{subtext}</p>}
    </div>
  );
}

// Quick Action Button
function QuickAction({ tool, isFavorite, onToggleFavorite }: {
  tool: typeof allTools[0];
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="group relative">
      <Link
        href={tool.href}
        className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.02]"
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} shadow-lg group-hover:shadow-xl group-hover:shadow-${tool.gradient.split('-')[1]}/20 transition-shadow`}>
          <tool.icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{tool.name}</span>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); onToggleFavorite(); }}
        className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
      >
        <Star className={`h-3.5 w-3.5 ${isFavorite ? "text-yellow-400 fill-yellow-400" : "text-white/30 hover:text-yellow-400"} transition-colors`} />
      </button>
    </div>
  );
}

// Activity Item
function ActivityItem({ item, onRemove }: { item: FileHistoryItem; onRemove: () => void }) {
  const IconComponent = iconMap[item.toolIcon] || FileText;
  const gradient = toolGradients[item.tool] || "from-gray-500 to-gray-600";

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} flex-shrink-0`}>
        <IconComponent className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white/90 truncate">{item.originalName}</p>
        <p className="text-sm text-white/40">{item.toolName} · {formatRelativeTime(item.timestamp)}</p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/${item.tool}`}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title="Process again"
        >
          <RefreshCw className="h-4 w-4 text-white/60" />
        </Link>
        <button
          onClick={onRemove}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Remove"
        >
          <X className="h-4 w-4 text-white/40" />
        </button>
      </div>
    </div>
  );
}

// Main Dashboard Component
export function DashboardContent({ profile, usage }: DashboardContentProps) {
  const router = useRouter();
  const { isPro } = useAuth();
  const todayUsage = usage?.file_count ?? 0;
  const maxFiles = isPro ? Infinity : 2;

  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setFileHistory(getFileHistory());
    setWorkflows(getWorkflows());
    setFavorites(getFavorites());
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setShowCommandPalette(true);
    } else if (e.key === "Escape") {
      setShowCommandPalette(false);
    } else if (!showCommandPalette) {
      const tool = allTools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
      if (tool) {
        e.preventDefault();
        router.push(tool.href);
      }
    }
  }, [router, showCommandPalette]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleFavorite = (toolId: string) => {
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const handleRemoveFromHistory = (id: string) => {
    removeFromHistory(id);
    setFileHistory(getFileHistory());
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Navigate to merge by default for multiple files
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      router.push("/merge");
    }
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const favoriteTools = allTools.filter(t => favorites.includes(t.id));
  const quickTools = favoriteTools.length >= 4 ? favoriteTools.slice(0, 6) : allTools.slice(0, 6);

  return (
    <div
      className="min-h-screen bg-[#030304]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        tools={allTools}
        onNavigate={(href) => router.push(href)}
      />

      {/* Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-40 bg-[#030304]/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center animate-pulse">
              <Upload className="w-12 h-12 text-white" />
            </div>
            <p className="text-2xl font-semibold text-white mb-2">Drop your files</p>
            <p className="text-white/50">Release to start processing</p>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-5">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="h-7 w-7 text-white" />
                </div>
              )}
              {isPro && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center ring-2 ring-[#030304]">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {getTimeBasedGreeting()}, {firstName}
              </h1>
              <p className="text-white/50">{profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
            >
              <Search className="h-4 w-4 text-white/40" />
              <span className="text-sm text-white/40">Search tools...</span>
              <kbd className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] text-white/30 text-xs">
                <Command className="h-3 w-3" />K
              </kbd>
            </button>

            {/* Plan Badge */}
            <div className={`px-4 py-2.5 rounded-xl border ${isPro ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
              <div className="flex items-center gap-2">
                {isPro ? (
                  <Crown className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Zap className="h-4 w-4 text-white/60" />
                )}
                <span className={`text-sm font-medium ${isPro ? "text-yellow-400" : "text-white/60"}`}>
                  {isPro ? "Pro" : "Free"}
                </span>
              </div>
            </div>

            {!isPro && (
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Upgrade <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard
            icon={FileText}
            label="Files Processed"
            value={fileHistory.length}
            subtext="All time"
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Activity}
            label="Today's Usage"
            value={`${todayUsage}${!isPro ? `/${maxFiles}` : ""}`}
            subtext={isPro ? "Unlimited" : "Daily limit"}
            gradient="from-violet-500 to-purple-500"
          />
          <StatCard
            icon={Workflow}
            label="Workflows"
            value={workflows.length}
            subtext="Saved automations"
            gradient="from-orange-500 to-amber-500"
          />
          <StatCard
            icon={Star}
            label="Favorites"
            value={favorites.length}
            subtext="Quick access tools"
            gradient="from-pink-500 to-rose-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drop Zone */}
            <div className="p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.02] transition-all cursor-pointer group"
                 onClick={() => router.push("/merge")}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-white/60" />
                </div>
                <p className="text-lg font-medium text-white/80 mb-1">Drop files here to get started</p>
                <p className="text-sm text-white/40">or click to browse · supports PDF, images, and more</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-white/60" />
                  Quick Actions
                </h2>
                <Link href="/tools" className="text-sm text-white/40 hover:text-white/60 transition-colors flex items-center gap-1">
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {quickTools.map((tool) => (
                  <QuickAction
                    key={tool.id}
                    tool={tool}
                    isFavorite={favorites.includes(tool.id)}
                    onToggleFavorite={() => toggleFavorite(tool.id)}
                  />
                ))}
              </div>
            </div>

            {/* Workflows */}
            {workflows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-white/60" />
                    Workflows
                  </h2>
                  <Link href="/workflow" className="text-sm text-white/40 hover:text-white/60 transition-colors flex items-center gap-1">
                    Manage <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {workflows.slice(0, 4).map((workflow) => (
                    <Link
                      key={workflow.id}
                      href="/workflow"
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white/90 truncate group-hover:text-white transition-colors">{workflow.name}</p>
                        <p className="text-sm text-white/40">{workflow.steps.length} steps</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Tools Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-white/60" />
                  All Tools
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 transition-all"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${tool.gradient} flex-shrink-0`}>
                      <tool.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 group-hover:text-white truncate transition-colors">{tool.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Activity */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/60" />
                  Recent Activity
                </h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {fileHistory.length > 0 ? (
                  fileHistory.slice(0, 5).map((item) => (
                    <ActivityItem
                      key={item.id}
                      item={item}
                      onRemove={() => handleRemoveFromHistory(item.id)}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white/30" />
                    </div>
                    <p className="text-white/40 text-sm">No recent activity</p>
                    <p className="text-white/25 text-xs mt-1">Process a file to see it here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-white/60" />
                Quick Links
              </h2>
              <div className="space-y-2">
                <Link href="/workflow" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20">
                    <Plus className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Create Workflow</p>
                    <p className="text-xs text-white/40">Automate your tasks</p>
                  </div>
                </Link>
                <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20">
                    <Settings className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Settings</p>
                    <p className="text-xs text-white/40">Account & preferences</p>
                  </div>
                </Link>
                <Link href="/changelog" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">What's New</p>
                    <p className="text-xs text-white/40">Latest updates</p>
                  </div>
                </Link>
                <a href="mailto:support@pdfflow.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/20">
                    <HelpCircle className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Get Help</p>
                    <p className="text-xs text-white/40">Contact support</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Pro Upgrade Card (for free users) */}
            {!isPro && (
              <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Upgrade to Pro</p>
                    <p className="text-xs text-white/50">Unlock all features</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-white/60">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Unlimited file processing
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/60">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/60">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                    Advanced tools
                  </li>
                </ul>
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  View Plans <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
