"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  FileText,
  HardDrive,
  TrendingUp,
  TrendingDown,
  Crown,
} from "lucide-react";
import {
  getAnalytics,
  getRecentUsage,
  getTopTools,
  formatBytes,
  getWeeklyChange,
  getMonthlyTotal,
  AnalyticsData,
} from "@/lib/analytics";
import { toolMeta } from "@/lib/file-history";

// Simple bar chart component
function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((item, index) => {
        const height = (item.count / maxCount) * 100;
        const isToday = index === data.length - 1;
        return (
          <div
            key={item.date}
            className="flex-1 flex flex-col items-center gap-1 group"
          >
            <div className="relative w-full flex items-end justify-center h-20">
              <div
                className={`w-full max-w-8 rounded-t transition-all ${
                  isToday
                    ? "bg-gradient-to-t from-blue-500 to-cyan-400"
                    : "bg-white/10 group-hover:bg-white/20"
                }`}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-[#1a1a1f] border border-white/10 px-2 py-1 rounded text-xs whitespace-nowrap">
                  <p className="text-white font-medium">{item.count} files</p>
                  <p className="text-white/50">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-white/30">
              {new Date(item.date).toLocaleDateString("en-US", {
                weekday: "narrow",
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Tool usage item
function ToolUsageItem({
  tool,
  count,
  maxCount,
}: {
  tool: string;
  count: number;
  maxCount: number;
}) {
  const meta = toolMeta[tool] || { name: tool, color: "from-gray-500 to-gray-600" };
  const percentage = (count / maxCount) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white/80">{meta.name}</span>
          <span className="text-xs text-white/40">{count} files</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${meta.color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function ProAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentUsage, setRecentUsage] = useState<{ date: string; count: number }[]>([]);
  const [topTools, setTopTools] = useState<{ tool: string; count: number }[]>([]);
  const [weeklyChange, setWeeklyChange] = useState({ current: 0, previous: 0, change: 0 });
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    setAnalytics(getAnalytics());
    setRecentUsage(getRecentUsage(7)); // Last 7 days
    setTopTools(getTopTools(5));
    setWeeklyChange(getWeeklyChange());
    setMonthlyTotal(getMonthlyTotal());
  }, []);

  if (!analytics) return null;

  const maxToolCount = Math.max(...topTools.map((t) => t.count), 1);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-white flex items-center gap-2">
            Usage Analytics
            <Crown className="h-3.5 w-3.5 text-yellow-400" />
          </h2>
          <p className="text-xs text-white/50">Pro feature</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <FileText className="h-4 w-4 text-blue-400 mb-2" />
            <p className="text-xl font-bold text-white">{analytics.totalFilesProcessed}</p>
            <p className="text-xs text-white/40">Total files</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <HardDrive className="h-4 w-4 text-purple-400 mb-2" />
            <p className="text-xl font-bold text-white">
              {formatBytes(analytics.totalBytesProcessed)}
            </p>
            <p className="text-xs text-white/40">Data processed</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {weeklyChange.change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-400 mb-2" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400 mb-2" />
            )}
            <p className="text-xl font-bold text-white flex items-center gap-1">
              {weeklyChange.change >= 0 ? "+" : ""}
              {weeklyChange.change}%
            </p>
            <p className="text-xs text-white/40">vs last week</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white/60">This Week</h3>
            <span className="text-xs text-white/40">
              {weeklyChange.current} files processed
            </span>
          </div>
          <MiniBarChart data={recentUsage} />
        </div>

        {/* Top Tools */}
        {topTools.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/60 mb-3">Most Used Tools</h3>
            <div className="space-y-3">
              {topTools.map((item) => (
                <ToolUsageItem
                  key={item.tool}
                  tool={item.tool}
                  count={item.count}
                  maxCount={maxToolCount}
                />
              ))}
            </div>
          </div>
        )}

        {/* Monthly Summary */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/[0.06]">
          <p className="text-sm text-white/60 mb-1">This Month</p>
          <p className="text-2xl font-bold text-white">{monthlyTotal} files</p>
          <p className="text-xs text-white/40 mt-1">
            Last updated: {new Date(analytics.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
