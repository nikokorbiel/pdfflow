"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { FileText, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

export default function WordToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isPro, maxFileSize, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setError(null);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
  }, []);

  const convertToPDF = async () => {
    setError(
      "Word to PDF conversion requires server-side processing to preserve formatting and styles. " +
      "This feature will be available with PDFflow Pro. For now, you can use Microsoft Word or Google Docs' built-in 'Export as PDF' option."
    );
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-400 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Word to PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Convert your Word documents to PDF format
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                {isPro ? (
                  <Crown className="h-4 w-4 text-[var(--accent)]" />
                ) : (
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                )}
                <span className="text-sm text-[var(--muted-foreground)]">
                  {usageDisplay}
                </span>
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
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                <strong className="text-foreground">Pro Feature:</strong> Word to PDF conversion requires server-side processing.
                <br className="hidden sm:block" />
                <span className="text-[var(--accent)]"> Upgrade to Pro</span> for instant Word, Excel, and PowerPoint to PDF conversion.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertToPDF}
                disabled={files.length === 0}
                className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 px-8 py-4 font-medium text-white shadow-lg shadow-blue-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
              >
                <FileText className="h-5 w-5" />
                Convert to PDF
              </button>
            </div>

            {/* Alternative methods */}
            <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
              <h3 className="font-medium mb-4">Free alternatives while we build this feature:</h3>
              <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  <span><strong>Microsoft Word:</strong> File → Save As → PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  <span><strong>Google Docs:</strong> Upload to Google Drive → Open with Docs → Download as PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  <span><strong>LibreOffice:</strong> Free open-source alternative with PDF export</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
