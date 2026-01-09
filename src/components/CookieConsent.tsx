"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay showing the banner for a smoother experience
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
      <div className="mx-auto max-w-2xl">
        <div className="relative overflow-hidden rounded-3xl border-2 border-[var(--border)] bg-[var(--background)] p-6 shadow-glass-lg">
          {/* Decorative gradient */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-[var(--accent)]/20 to-purple-500/20 rounded-full blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Icon and text */}
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--muted)]">
                <Cookie className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-medium">We value your privacy</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  We use cookies to enhance your experience.{" "}
                  <Link href="/privacy" className="text-[var(--accent)] hover:underline">
                    Learn more
                  </Link>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <button
                onClick={declineCookies}
                className="px-4 py-2.5 text-sm font-medium rounded-full border border-[var(--border)] hover:bg-[var(--muted)] transition-all press-effect"
              >
                Decline
              </button>
              <button
                onClick={acceptCookies}
                className="px-4 py-2.5 text-sm font-medium text-white rounded-full bg-gradient-to-r from-[var(--accent)] to-purple-500 shadow-lg shadow-[var(--accent)]/25 hover:opacity-90 transition-all press-effect"
              >
                Accept
              </button>
            </div>

            {/* Close button - mobile */}
            <button
              onClick={declineCookies}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--muted)] transition-colors sm:hidden"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-[var(--muted-foreground)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
