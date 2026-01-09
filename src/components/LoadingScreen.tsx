"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

// Track if we've shown the loading screen during this page load
let hasShownThisPageLoad = false;

export function LoadingScreen() {
  const pathname = usePathname();

  // Determine initial visibility synchronously
  const shouldShow = () => {
    if (typeof window === "undefined") return false;
    if (pathname !== "/") return false;
    if (hasShownThisPageLoad) return false;

    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    const isInternalNavigation = referrer && referrer.startsWith(currentOrigin);

    return !isInternalNavigation;
  };

  const [isVisible, setIsVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (shouldShow() && !hasShownThisPageLoad) {
      hasShownThisPageLoad = true;
      setIsVisible(true);
    }
  }, []);

  // Separate effect for the fade-out timer
  useEffect(() => {
    if (!isVisible) return;

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)] transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[var(--accent)]/20 to-transparent rounded-full animate-pulse" />
      </div>

      {/* Logo and content */}
      <div className="relative flex flex-col items-center">
        {/* Animated logo */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-purple-500 rounded-3xl blur-2xl opacity-40 animate-pulse" />

          {/* Logo container */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--accent)] to-purple-500 shadow-2xl animate-logo-bounce">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Brand name */}
        <div className="mt-8 flex items-center gap-1">
          <span className="text-3xl font-semibold tracking-tight animate-fade-in-up">
            PDF
          </span>
          <span className="text-3xl font-semibold tracking-tight text-gradient animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            flow
          </span>
        </div>

        {/* Loading indicator */}
        <div className="mt-8 flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
