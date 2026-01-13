"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Table, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

export default function ExcelToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isPro, canProcess: _canProcess, maxFileSize, recordUsage: _recordUsage, usageDisplay } = useToolUsage();

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
      "Excel to PDF conversion requires server-side processing to maintain formatting and formulas. " +
      "This feature will be available with PDFflow Pro. For now, you can use Microsoft Excel or Google Sheets' built-in 'Export as PDF' option."
    );
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/20 to-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-400/10 to-green-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg">
                <Table className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Excel to PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Convert your spreadsheets to PDF format
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                {isPro ? (
                  <Crown className="h-4 w-4 text-amber-500" />
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
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
                <strong className="text-foreground">Pro Feature:</strong> Excel to PDF conversion requires server-side processing.
                <br className="hidden sm:block" />
                <span className="text-[var(--accent)]"> Upgrade to Pro</span> for instant spreadsheet to PDF conversion.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertToPDF}
                disabled={files.length === 0}
                className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 px-8 py-4 font-medium text-white shadow-lg shadow-green-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
              >
                <Table className="h-5 w-5" />
                Convert to PDF
              </button>
            </div>

            <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
              <h3 className="font-medium mb-4">Free alternatives while we build this feature:</h3>
              <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  <span><strong>Microsoft Excel:</strong> File → Save As → PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  <span><strong>Google Sheets:</strong> File → Download → PDF document</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  <span><strong>LibreOffice Calc:</strong> Free open-source alternative with PDF export</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
