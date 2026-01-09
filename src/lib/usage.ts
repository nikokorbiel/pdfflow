import { createClient } from "@/lib/supabase/client";

const USAGE_KEY = "pdf-tools-usage";
const MAX_FREE_FILES_PER_DAY = 2;
const MAX_FREE_FILE_SIZE_MB = 10;
const MAX_PRO_FILE_SIZE_MB = 100;

interface UsageData {
  date: string;
  count: number;
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getUsageData(): UsageData {
  if (typeof window === "undefined") {
    return { date: getTodayString(), count: 0 };
  }

  const stored = localStorage.getItem(USAGE_KEY);
  if (!stored) {
    return { date: getTodayString(), count: 0 };
  }

  try {
    const data = JSON.parse(stored) as UsageData;
    // Reset if it's a new day
    if (data.date !== getTodayString()) {
      return { date: getTodayString(), count: 0 };
    }
    return data;
  } catch {
    return { date: getTodayString(), count: 0 };
  }
}

function saveUsageData(data: UsageData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USAGE_KEY, JSON.stringify(data));
}

// ============================================
// Synchronous functions for anonymous users
// ============================================

export function getRemainingUsage(): number {
  const usage = getUsageData();
  return Math.max(0, MAX_FREE_FILES_PER_DAY - usage.count);
}

export function canProcessFile(): boolean {
  return getRemainingUsage() > 0;
}

export function incrementUsage(): void {
  const usage = getUsageData();
  usage.count += 1;
  saveUsageData(usage);
}

export function getMaxFileSize(isPro: boolean = false): number {
  return isPro ? MAX_PRO_FILE_SIZE_MB : MAX_FREE_FILE_SIZE_MB;
}

export function getMaxFilesPerDay(): number {
  return MAX_FREE_FILES_PER_DAY;
}

// Check cached Pro status (set by AuthContext)
export function checkIsPro(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("pdf-tools-pro-cached") === "true";
}

// ============================================
// Async functions for logged-in users
// ============================================

export async function checkIsProAsync(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .single();

  return subscription?.plan === "pro" || subscription?.plan === "team";
}

export async function getRemainingUsageAsync(
  userId?: string
): Promise<number> {
  // Anonymous user - use localStorage
  if (!userId) {
    return getRemainingUsage();
  }

  const supabase = createClient();
  const today = getTodayString();

  // Check subscription status first
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  // Pro users have unlimited usage
  if (subscription?.plan === "pro" || subscription?.plan === "team") {
    return Infinity;
  }

  // Get today's usage for free users
  const { data: usage } = await supabase
    .from("usage")
    .select("file_count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  return Math.max(0, MAX_FREE_FILES_PER_DAY - (usage?.file_count || 0));
}

export async function incrementUsageAsync(userId: string): Promise<void> {
  const supabase = createClient();
  const today = getTodayString();

  // Check if usage record exists for today
  const { data: existing } = await supabase
    .from("usage")
    .select("id, file_count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (existing) {
    // Update existing record
    await supabase
      .from("usage")
      .update({ file_count: existing.file_count + 1 })
      .eq("id", existing.id);
  } else {
    // Create new record
    await supabase
      .from("usage")
      .insert({ user_id: userId, date: today, file_count: 1 });
  }
}

export async function canProcessFileAsync(userId?: string): Promise<boolean> {
  const remaining = await getRemainingUsageAsync(userId);
  return remaining > 0;
}

// Send usage limit notification email
export async function notifyUsageLimitReached(): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Check if we already sent this email today
    const emailSentKey = `usage-limit-email-${new Date().toISOString().split("T")[0]}`;
    if (typeof window !== "undefined" && localStorage.getItem(emailSentKey)) {
      return; // Already sent today
    }

    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "usage_limit",
        email: user.email,
        name: profile?.full_name,
      }),
    });

    // Mark as sent for today
    if (typeof window !== "undefined") {
      localStorage.setItem(emailSentKey, "true");
    }
  } catch (error) {
    console.error("Failed to send usage limit email:", error);
  }
}
