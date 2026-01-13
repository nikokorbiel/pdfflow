import { createClient } from "@/lib/supabase/client";

const USAGE_KEY = "pdf-tools-usage";
const PREMIUM_USAGE_KEY = "pdf-tools-premium-usage";
const MAX_FREE_PREMIUM_TOOLS = 4; // 4 free uses for premium tools, then Pro required
const MAX_FREE_FILE_SIZE_MB = 10;
const MAX_PRO_FILE_SIZE_MB = 100;

interface UsageData {
  date: string;
  count: number;
}

interface PremiumUsageData {
  count: number; // Total uses (not per day)
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// Legacy daily usage (no longer used for new system but kept for backwards compatibility)
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

// Premium tool usage (total, not per day)
function getPremiumUsageData(): PremiumUsageData {
  if (typeof window === "undefined") {
    return { count: 0 };
  }

  const stored = localStorage.getItem(PREMIUM_USAGE_KEY);
  if (!stored) {
    return { count: 0 };
  }

  try {
    return JSON.parse(stored) as PremiumUsageData;
  } catch {
    return { count: 0 };
  }
}

function savePremiumUsageData(data: PremiumUsageData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREMIUM_USAGE_KEY, JSON.stringify(data));
}

// ============================================
// Synchronous functions for anonymous users
// ============================================

// For premium tools - returns remaining uses (out of 4 total)
export function getRemainingPremiumUsage(): number {
  const usage = getPremiumUsageData();
  return Math.max(0, MAX_FREE_PREMIUM_TOOLS - usage.count);
}

// Legacy - kept for backwards compatibility
export function getRemainingUsage(): number {
  const usage = getUsageData();
  return Math.max(0, 2 - usage.count); // Legacy 2 per day
}

export function canProcessFile(isPremiumTool: boolean = false): boolean {
  if (!isPremiumTool) return true; // Free tools are unlimited
  return getRemainingPremiumUsage() > 0;
}

export function incrementUsage(): void {
  const usage = getUsageData();
  usage.count += 1;
  saveUsageData(usage);
}

export function incrementPremiumUsage(): void {
  const usage = getPremiumUsageData();
  usage.count += 1;
  savePremiumUsageData(usage);
}

export function getMaxFileSize(isPro: boolean = false): number {
  return isPro ? MAX_PRO_FILE_SIZE_MB : MAX_FREE_FILE_SIZE_MB;
}

export function getMaxFreePremiumTools(): number {
  return MAX_FREE_PREMIUM_TOOLS;
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

  return subscription?.plan === "pro" || subscription?.plan === "team" || subscription?.plan === "lifetime";
}

// For premium tools - get remaining uses for logged-in users
export async function getRemainingPremiumUsageAsync(
  userId?: string
): Promise<number> {
  // Anonymous user - use localStorage
  if (!userId) {
    return getRemainingPremiumUsage();
  }

  const supabase = createClient();

  // Check subscription status first
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  // Pro/Team/Lifetime users have unlimited usage
  if (subscription?.plan === "pro" || subscription?.plan === "team" || subscription?.plan === "lifetime") {
    return Infinity;
  }

  // Get total premium usage for free users (not per day)
  const { data: usage } = await supabase
    .from("premium_usage")
    .select("total_count")
    .eq("user_id", userId)
    .single();

  return Math.max(0, MAX_FREE_PREMIUM_TOOLS - (usage?.total_count || 0));
}

// Legacy - kept for backwards compatibility
export async function getRemainingUsageAsync(
  userId?: string
): Promise<number> {
  // For the new system, free tools are unlimited
  // This is kept for backwards compatibility
  if (!userId) {
    return getRemainingUsage();
  }
  return Infinity; // Free tools are now unlimited
}

export async function incrementPremiumUsageAsync(userId: string): Promise<void> {
  const supabase = createClient();

  // Check if usage record exists
  const { data: existing } = await supabase
    .from("premium_usage")
    .select("id, total_count")
    .eq("user_id", userId)
    .single();

  if (existing) {
    // Update existing record
    await supabase
      .from("premium_usage")
      .update({ total_count: existing.total_count + 1 })
      .eq("id", existing.id);
  } else {
    // Create new record
    await supabase
      .from("premium_usage")
      .insert({ user_id: userId, total_count: 1 });
  }
}

// Legacy - kept for backwards compatibility
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
    await supabase
      .from("usage")
      .update({ file_count: existing.file_count + 1 })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("usage")
      .insert({ user_id: userId, date: today, file_count: 1 });
  }
}

export async function canProcessFileAsync(userId?: string, isPremiumTool: boolean = false): Promise<boolean> {
  if (!isPremiumTool) return true; // Free tools are unlimited
  const remaining = await getRemainingPremiumUsageAsync(userId);
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
