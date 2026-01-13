// Analytics tracking for Pro users

export interface AnalyticsData {
  totalFilesProcessed: number;
  totalBytesProcessed: number;
  toolUsage: Record<string, number>;
  dailyUsage: Record<string, number>; // date string -> count
  lastUpdated: number;
}

const ANALYTICS_KEY = "pdfflow-analytics";
const MAX_DAILY_ENTRIES = 90; // Keep 90 days of history

function getDefaultAnalytics(): AnalyticsData {
  return {
    totalFilesProcessed: 0,
    totalBytesProcessed: 0,
    toolUsage: {},
    dailyUsage: {},
    lastUpdated: Date.now(),
  };
}

export function getAnalytics(): AnalyticsData {
  if (typeof window === "undefined") return getDefaultAnalytics();

  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (!stored) return getDefaultAnalytics();
    return JSON.parse(stored);
  } catch {
    return getDefaultAnalytics();
  }
}

export function trackFileProcessed(tool: string, fileSize: number): void {
  if (typeof window === "undefined") return;

  try {
    const analytics = getAnalytics();
    const today = new Date().toISOString().split("T")[0];

    // Update totals
    analytics.totalFilesProcessed += 1;
    analytics.totalBytesProcessed += fileSize;

    // Update tool usage
    analytics.toolUsage[tool] = (analytics.toolUsage[tool] || 0) + 1;

    // Update daily usage
    analytics.dailyUsage[today] = (analytics.dailyUsage[today] || 0) + 1;

    // Clean up old daily entries (keep only last MAX_DAILY_ENTRIES days)
    const sortedDates = Object.keys(analytics.dailyUsage).sort().reverse();
    if (sortedDates.length > MAX_DAILY_ENTRIES) {
      const toRemove = sortedDates.slice(MAX_DAILY_ENTRIES);
      toRemove.forEach((date) => delete analytics.dailyUsage[date]);
    }

    analytics.lastUpdated = Date.now();
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch {
    // Silently fail if localStorage is full
  }
}

// Get usage for the last N days
export function getRecentUsage(days: number): { date: string; count: number }[] {
  const analytics = getAnalytics();
  const result: { date: string; count: number }[] = [];

  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      count: analytics.dailyUsage[dateStr] || 0,
    });
  }

  return result;
}

// Get top tools by usage
export function getTopTools(limit: number = 5): { tool: string; count: number }[] {
  const analytics = getAnalytics();

  return Object.entries(analytics.toolUsage)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Get week-over-week change
export function getWeeklyChange(): { current: number; previous: number; change: number } {
  const analytics = getAnalytics();
  const today = new Date();

  let currentWeek = 0;
  let previousWeek = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    currentWeek += analytics.dailyUsage[dateStr] || 0;
  }

  for (let i = 7; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    previousWeek += analytics.dailyUsage[dateStr] || 0;
  }

  const change = previousWeek === 0
    ? (currentWeek > 0 ? 100 : 0)
    : Math.round(((currentWeek - previousWeek) / previousWeek) * 100);

  return { current: currentWeek, previous: previousWeek, change };
}

// Get monthly total
export function getMonthlyTotal(): number {
  const analytics = getAnalytics();
  const today = new Date();
  let total = 0;

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    total += analytics.dailyUsage[dateStr] || 0;
  }

  return total;
}

// Clear all analytics data
export function clearAnalytics(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ANALYTICS_KEY);
}
