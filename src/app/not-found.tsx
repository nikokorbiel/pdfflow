"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="relative text-center max-w-lg">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 rounded-full blur-3xl -z-10" />

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-purple-500 mb-8 shadow-lg shadow-[var(--accent)]/25">
          <FileQuestion className="w-12 h-12 text-white" />
        </div>

        {/* Error code */}
        <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold mb-4">Page not found</h2>
        <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[var(--border)] hover:bg-[var(--muted)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white font-medium shadow-lg shadow-[var(--accent)]/25 hover:opacity-90 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--surface)] text-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              All Tools
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--surface)] text-sm transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="px-4 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--surface)] text-sm transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
