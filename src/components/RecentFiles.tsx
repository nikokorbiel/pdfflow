"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getFileHistory,
  formatFileSize,
  formatRelativeTime,
  FileHistoryItem,
  toolMeta,
} from "@/lib/file-history";
import {
  Clock,
  FileText,
  ArrowRight,
  Combine,
  Split,
  FileDown,
  Image,
  FileImage,
  Table,
  RotateCw,
  Droplets,
  Hash,
  ArrowUpDown,
  PenTool,
  Unlock,
  Crop,
  EyeOff,
  Layers,
  Wrench,
  Trash2,
  Code,
  Presentation,
  ChevronRight,
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Combine,
  Split,
  FileDown,
  Image,
  FileImage,
  FileText,
  Table,
  Presentation,
  RotateCw,
  Droplets,
  Hash,
  ArrowUpDown,
  PenTool,
  Unlock,
  Crop,
  EyeOff,
  Layers,
  Wrench,
  ImageIcon: Image,
  Trash2,
  Code,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || FileText;
}

export function RecentFiles() {
  const [recentFiles, setRecentFiles] = useState<FileHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const history = getFileHistory();
    setRecentFiles(history.slice(0, 5)); // Show max 5 recent files
    setIsLoaded(true);
  }, []);

  if (!isLoaded || recentFiles.length === 0) {
    return null;
  }

  return (
    <section className="py-12 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-purple-500/20">
              <Clock className="w-5 h-5 text-[#0ea5e9]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Files</h2>
              <p className="text-sm text-[#94a3b8]">Continue where you left off</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm text-[#0ea5e9] hover:text-[#0ea5e9]/80 transition-colors"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {recentFiles.map((file, index) => {
            const meta = toolMeta[file.tool] || { name: file.toolName, icon: "FileText", color: "from-gray-500 to-gray-400" };
            const Icon = getIcon(meta.icon);

            return (
              <Link
                key={file.id}
                href={`/${file.tool}`}
                className="group relative flex flex-col p-4 rounded-2xl bg-[#0f0f14] border border-[#1e293b] hover:border-[#334155] hover:bg-[#1a1a24] transition-all animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Tool Icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* File Info */}
                <p className="text-sm font-medium text-white truncate mb-1" title={file.originalName}>
                  {file.originalName}
                </p>
                <p className="text-xs text-[#64748b] mb-2">{meta.name}</p>

                {/* Meta */}
                <div className="mt-auto flex items-center justify-between text-xs text-[#64748b]">
                  <span>{formatRelativeTime(file.timestamp)}</span>
                  {file.fileSize && <span>{formatFileSize(file.fileSize)}</span>}
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-[#0ea5e9]" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
