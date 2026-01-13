"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  getRemainingPremiumUsage,
  incrementPremiumUsage,
  getMaxFileSize,
  incrementPremiumUsageAsync,
  getRemainingPremiumUsageAsync,
  getMaxFreePremiumTools,
} from "@/lib/usage";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { isToolPremium } from "@/config/tools";

interface ToolUsageResult {
  isPro: boolean;
  isLoading: boolean;
  remainingUsage: number;
  maxFileSize: number;
  canProcess: boolean;
  recordUsage: () => Promise<void>;
  usageDisplay: string;
  isPremiumTool: boolean;
  isUnlimited: boolean;
}

export function useToolUsage(): ToolUsageResult {
  const { user, isPro, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const [remainingUsage, setRemainingUsage] = useState<number>(4);
  const [isLoading, setIsLoading] = useState(true);

  // Check if current tool is premium
  const isPremiumTool = isToolPremium(pathname);
  const maxPremiumTools = getMaxFreePremiumTools();

  useEffect(() => {
    const fetchUsage = async () => {
      if (authLoading) return;

      // Pro users have unlimited usage
      if (isPro) {
        setRemainingUsage(Infinity);
        setIsLoading(false);
        return;
      }

      // Free tools are unlimited
      if (!isPremiumTool) {
        setRemainingUsage(Infinity);
        setIsLoading(false);
        return;
      }

      // Premium tool - check usage limits
      if (user) {
        // Logged-in free user - check server-side usage
        const remaining = await getRemainingPremiumUsageAsync(user.id);
        setRemainingUsage(remaining);
      } else {
        // Anonymous user - use localStorage
        setRemainingUsage(getRemainingPremiumUsage());
      }
      setIsLoading(false);
    };

    fetchUsage();
  }, [user, isPro, authLoading, isPremiumTool]);

  const recordUsage = useCallback(async () => {
    // Pro users don't track usage
    if (isPro) return;

    // Free tools don't track usage
    if (!isPremiumTool) return;

    // Only track premium tool usage
    if (user) {
      await incrementPremiumUsageAsync(user.id);
      const remaining = await getRemainingPremiumUsageAsync(user.id);
      setRemainingUsage(remaining);
    } else {
      incrementPremiumUsage();
      setRemainingUsage(getRemainingPremiumUsage());
    }
  }, [user, isPro, isPremiumTool]);

  const maxFileSize = getMaxFileSize(isPro);
  const isUnlimited = isPro || !isPremiumTool;
  const canProcess = isUnlimited || remainingUsage > 0;

  // Usage display based on tool type
  let usageDisplay: string;
  if (isPro) {
    usageDisplay = "Unlimited";
  } else if (!isPremiumTool) {
    usageDisplay = "Free · Unlimited";
  } else {
    usageDisplay = `${remainingUsage} of ${maxPremiumTools} free uses`;
  }

  return {
    isPro,
    isLoading: isLoading || authLoading,
    remainingUsage,
    maxFileSize,
    canProcess,
    recordUsage,
    usageDisplay,
    isPremiumTool,
    isUnlimited,
  };
}
