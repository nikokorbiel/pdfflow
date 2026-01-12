"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#06b6d4]/20 flex items-center justify-center mx-auto mb-8">
          <WifiOff className="w-10 h-10 text-[#0ea5e9]" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          You&apos;re offline
        </h1>

        <p className="text-[#94a3b8] mb-8">
          It looks like you&apos;ve lost your internet connection. Don&apos;t worry - PDFflow works offline too!
          Any tools you&apos;ve used before are cached and ready to use.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1e293b] text-white font-medium hover:bg-white/5 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>

        <div className="mt-12 p-6 rounded-xl bg-[#0a0a0f] border border-[#1e293b]">
          <h2 className="text-sm font-semibold text-white mb-3">Available offline:</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Merge", "Split", "Compress", "Convert"].map((tool) => (
              <span
                key={tool}
                className="px-3 py-1 rounded-full bg-[#1e293b] text-[#94a3b8] text-sm"
              >
                {tool}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#64748b] mt-3">
            All PDF processing happens in your browser - no internet required.
          </p>
        </div>
      </div>
    </div>
  );
}
