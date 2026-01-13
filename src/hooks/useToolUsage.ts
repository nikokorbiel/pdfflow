"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  getRemainingUsage,
  incrementUsage,
  getMaxFileSize,
  incrementUsageAsync,
  getRemainingUsageAsync,
} from "@/lib/usage";
import { useEffect, useState, useCallback } from "react";

interface ToolUsageResult {
  isPro: boolean;
  isLoading: boolean;
  remainingUsage: number;
  maxFileSize: number;
  canProcess: boolean;
  recordUsage: () => Promise<void>;
  usageDisplay: string;
}

export function useToolUsage(): ToolUsageResult {
  const { user, isPro, isLoading: authLoading } = useAuth();
  const [remainingUsage, setRemainingUsage] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      if (authLoading) return;

      if (isPro) {
        setRemainingUsage(Infinity);
        setIsLoading(false);
        return;
      }

      if (user) {
        // Logged-in free user - check server-side usage
        const remaining = await getRemainingUsageAsync(user.id);
        setRemainingUsage(remaining);
      } else {
        // Anonymous user - use localStorage
        setRemainingUsage(getRemainingUsage());
      }
      setIsLoading(false);
    };

    fetchUsage();
  }, [user, isPro, authLoading]);

  const recordUsage = useCallback(async () => {
    if (isPro) return; // Pro users don't track usage

    if (user) {
      await incrementUsageAsync(user.id);
      const remaining = await getRemainingUsageAsync(user.id);
      setRemainingUsage(remaining);
    } else {
      incrementUsage();
      setRemainingUsage(getRemainingUsage());
    }
  }, [user, isPro]);

  const maxFileSize = getMaxFileSize(isPro);
  const canProcess = isPro || remainingUsage > 0;

  const usageDisplay = isPro
    ? "Unlimited"
    : `${remainingUsage} of 2 free uses today`;

  return {
    isPro,
    isLoading: isLoading || authLoading,
    remainingUsage,
    maxFileSize,
    canProcess,
    recordUsage,
    usageDisplay,
  };
}
