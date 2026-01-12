"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#030304] flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-8">
          <FileQuestion className="w-12 h-12 text-red-400" />
        </div>

        {/* Error code */}
        <div className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-4">
          404
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Page not found
        </h1>
        <p className="text-lg text-white/60 mb-10 max-w-md mx-auto">
          Looks like this page got lost in the shuffle. Don&apos;t worry, even PDFs get misplaced sometimes.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Popular links */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-sm text-white/40 mb-4">Popular destinations</p>
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
            <Link href="/merge" className="text-white/60 hover:text-white transition-colors">
              Merge PDFs
            </Link>
            <Link href="/split" className="text-white/60 hover:text-white transition-colors">
              Split PDF
            </Link>
            <Link href="/compress" className="text-white/60 hover:text-white transition-colors">
              Compress PDF
            </Link>
            <Link href="/pricing" className="text-white/60 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-white/60 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
