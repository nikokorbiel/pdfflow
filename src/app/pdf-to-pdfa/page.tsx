"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { FileCheck, Sparkles, AlertCircle, Shield, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

export default function PDFToPDFA() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setError(null);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
  }, []);

  const convertToPDFA = async () => {
    setError(
      "PDF/A conversion requires specialized processing to ensure archival compliance (embedding fonts, color profiles, metadata). " +
      "This feature will be available with PDFflow Pro, supporting PDF/A-1b, PDF/A-2b, and PDF/A-3b standards."
    );
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-green-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-400/10 to-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-green-400 shadow-lg">
                <FileCheck className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              PDF to PDF/A
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Convert to archival-compliant PDF/A format
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                {isPro ? (
                  <>
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Unlimited
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {usageDisplay}
                    </span>
                  </>
                )}
              </div>
              {!isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <Link href="/pricing" className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity">
                    Upgrade
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <FileDropzone
              onFilesSelected={handleFilesSelected}
              accept=".pdf,application/pdf"
              multiple={false}
              maxSize={maxFileSize}
              maxFiles={1}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={false}
            />

            {error && (
              <div className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-5 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
                    <div className="mt-4">
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-all"
                      >
                        <Sparkles className="h-4 w-4" />
                        Upgrade to Pro
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-[var(--muted)]/50 border border-[var(--border)] p-5 animate-fade-in">
              <p className="text-sm text-[var(--muted-foreground)] text-center">
                <strong className="text-foreground">Pro Feature:</strong> PDF/A conversion requires specialized processing.
                <br className="hidden sm:block" />
                <span className="text-[var(--accent)]"> Upgrade to Pro</span> for ISO-compliant archival conversion.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertToPDFA}
                disabled={files.length === 0}
                className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
              >
                <FileCheck className="h-5 w-5" />
                Convert to PDF/A
              </button>
            </div>

            {/* Info about PDF/A */}
            <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                What is PDF/A?
              </h3>
              <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span><strong>Long-term archival:</strong> PDF/A is an ISO-standardized format designed for long-term preservation of documents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span><strong>Self-contained:</strong> All fonts, colors, and images are embedded within the document.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span><strong>Legal compliance:</strong> Required by many government agencies and legal systems for official documents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span><strong>Multiple conformance levels:</strong> PDF/A-1b, PDF/A-2b, PDF/A-3b with increasing capabilities.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
