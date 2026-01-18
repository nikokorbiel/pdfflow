"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Combine,
  Split,
  FileDown,
  RotateCw,
  Image,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  Sparkles,
} from "lucide-react";

interface QuickAction {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const defaultActions: QuickAction[] = [
  { name: "Merge", href: "/merge", icon: Combine, color: "from-violet-500 to-purple-500" },
  { name: "Split", href: "/split", icon: Split, color: "from-blue-500 to-cyan-400" },
  { name: "Compress", href: "/compress", icon: FileDown, color: "from-emerald-500 to-teal-400" },
  { name: "Rotate", href: "/rotate", icon: RotateCw, color: "from-teal-500 to-cyan-400" },
  { name: "To Image", href: "/pdf-to-image", icon: Image, color: "from-orange-500 to-amber-400" },
  { name: "Delete Pages", href: "/delete-pages", icon: Trash2, color: "from-red-500 to-rose-500" },
];

const FAVORITES_KEY = "pdfflow-favorite-tools";

export function QuickActions() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
    setIsLoaded(true);
  }, []);

  // Don't show on homepage or non-tool pages
  const toolPages = ["/merge", "/split", "/compress", "/rotate", "/watermark", "/sign", "/pdf-to-image", "/image-to-pdf", "/reorder", "/delete-pages", "/crop", "/unlock", "/encrypt", "/flatten", "/repair", "/redact", "/extract-images", "/page-numbers", "/pdf-to-word", "/pdf-to-excel", "/grayscale", "/sharpen", "/blur", "/brightness-contrast"];
  const isToolPage = toolPages.some(page => pathname.startsWith(page)) || pathname.match(/^\/[a-z-]+$/);

  if (!isLoaded || !isToolPage || pathname === "/") {
    return null;
  }

  // Filter out current page from actions
  const actions = defaultActions.filter(action => action.href !== pathname);

  const toggleFavorite = (href: string) => {
    const newFavorites = favorites.includes(href)
      ? favorites.filter(f => f !== href)
      : [...favorites, href];

    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center animate-fade-in-up">
      <div className="relative">
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:text-white hover:bg-[#334155] transition-all"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Actions Bar */}
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0f0f14]/95 backdrop-blur-xl border border-[#1e293b] shadow-2xl transition-all duration-300 ${
            isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {/* Label */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-[#334155]">
            <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
            <span className="text-xs font-medium text-[#94a3b8] whitespace-nowrap">Quick</span>
          </div>

          {/* Action Buttons */}
          {actions.slice(0, 5).map((action) => {
            const Icon = action.icon;
            const isFavorite = favorites.includes(action.href);

            return (
              <div key={action.href} className="relative group">
                <Link
                  href={action.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br ${action.color} bg-opacity-10 hover:bg-opacity-20 transition-all hover:scale-105`}
                  title={action.name}
                >
                  <Icon className="w-4 h-4 text-white" />
                  <span className="text-xs font-medium text-white hidden sm:inline">{action.name}</span>
                </Link>

                {/* Favorite Toggle */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(action.href);
                  }}
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    isFavorite
                      ? "bg-yellow-500 text-white"
                      : "bg-[#1e293b] text-[#64748b] opacity-0 group-hover:opacity-100"
                  }`}
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className="w-2.5 h-2.5" fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
