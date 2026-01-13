"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Hash, Sparkles, AlertCircle, Crown, FileText, Layers } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PDFInfo {
  pageCount: number;
  fileSize: string;
  fileName: string;
}

export default function PageCount() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PDFInfo[]>([]);

  const { isPro, maxFileSize, usageDisplay } = useToolUsage();

  const loadPdfJs = async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    return pdfjsLib;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    setFiles(newFiles);
    setError(null);
    setIsProcessing(true);
    setResults([]);

    try {
      const pdfjsLib = await loadPdfJs();
      const newResults: PDFInfo[] = [];

      for (const file of newFiles) {
        try {
          const fileBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise as PDFDocumentProxy;

          newResults.push({
            pageCount: pdf.numPages,
            fileSize: formatFileSize(file.size),
            fileName: file.name,
          });
        } catch {
          newResults.push({
            pageCount: 0,
            fileSize: formatFileSize(file.size),
            fileName: file.name + " (Error reading)",
          });
        }
      }

      setResults(newResults);
    } catch (err) {
      console.error("Count error:", err);
      setError("Failed to count pages. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResults(prev => prev.filter((_, i) => i !== index));
  }, []);

  const totalPages = results.reduce((sum, r) => sum + r.pageCount, 0);

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                <Hash className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Page Count</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Quickly count pages in your PDFs</p>
          </div>

          <div className="mt-8 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                {isPro ? <Crown className="h-4 w-4 text-amber-500" /> : <Sparkles className="h-4 w-4 text-[var(--accent)]" />}
                <span className="text-sm text-[var(--muted-foreground)]">{usageDisplay}</span>
              </div>
              {!isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <Link href="/pricing" className="text-sm font-medium text-[var(--accent)] hover:opacity-80">Upgrade</Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-6">
            <FileDropzone
              onFilesSelected={handleFilesSelected}
              accept=".pdf,application/pdf"
              multiple={true}
              maxSize={maxFileSize}
              maxFiles={50}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={isProcessing}
            />

            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4" />
                <p className="text-sm text-[var(--muted-foreground)]">Counting pages...</p>
              </div>
            )}

            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <>
                <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                  <div className="space-y-3">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--muted)]"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-emerald-500" />
                          <div>
                            <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-[400px]">
                              {result.fileName}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">{result.fileSize}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-500">{result.pageCount}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">pages</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {results.length > 1 && (
                  <div className="rounded-3xl border bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-6 shadow-glass">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Layers className="h-6 w-6 text-emerald-500" />
                        <div>
                          <p className="font-semibold">Total</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{results.length} files</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-emerald-500">{totalPages}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">pages</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {results.length > 0 && (
              <button
                onClick={() => { setFiles([]); setResults([]); }}
                className="w-full flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
              >
                Count More Files
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
