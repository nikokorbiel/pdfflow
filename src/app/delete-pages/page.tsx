"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Trash2, Sparkles, FileText, Check, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

// Dynamic import for pdfjs-dist to avoid SSR issues
const loadPdfJs = async () => {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  return pdfjsLib;
};

export default function DeletePages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pagesToDelete, setPagesToDelete] = useState<Set<number>>(new Set());
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setPagesToDelete(new Set());

      try {
        const pdfjsLib = await loadPdfJs();
        const buffer = await newFiles[0].arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const totalPages = pdf.numPages;
        setPageCount(totalPages);

        // Generate thumbnails for first 20 pages
        const previews: string[] = [];
        const maxPreviews = Math.min(totalPages, 20);

        for (let i = 1; i <= maxPreviews; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // @ts-expect-error - pdfjs-dist types mismatch
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          previews.push(canvas.toDataURL());
        }

        setPagePreviews(previews);
      } catch {
        setError("Could not read PDF file");
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setPageCount(0);
    setPagesToDelete(new Set());
    setPagePreviews([]);
  }, []);

  const togglePage = (pageNum: number) => {
    const newSet = new Set(pagesToDelete);
    if (newSet.has(pageNum)) {
      newSet.delete(pageNum);
    } else {
      newSet.add(pageNum);
    }
    setPagesToDelete(newSet);
  };

  const deletePages = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
      return;
    }

    if (pagesToDelete.size === 0) {
      setError("Please select at least one page to delete");
      return;
    }

    if (pagesToDelete.size >= pageCount) {
      setError("Cannot delete all pages");
      return;
    }

    if (!canProcess) {
      setError("Daily limit reached. Upgrade to Pro for unlimited processing.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setStatus("Loading PDF...");
      setProgress(20);

      const fileBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);

      setStatus("Removing pages...");
      setProgress(50);

      // Get pages to keep (sorted in reverse to avoid index shifting)
      const pagesToRemove = Array.from(pagesToDelete).sort((a, b) => b - a);

      for (const pageNum of pagesToRemove) {
        pdf.removePage(pageNum - 1); // 0-indexed
      }

      setStatus("Saving PDF...");
      setProgress(80);

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete pages. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `edited_${files[0]?.name || "document.pdf"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/20 to-orange-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-amber-400/10 to-red-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-orange-400 shadow-lg">
                <Trash2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Delete Pages
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Remove unwanted pages from your PDF
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
                  {isPro ? "Unlimited" : usageDisplay}
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
              accept=".pdf,application/pdf"
              multiple={false}
              maxSize={maxFileSize}
              maxFiles={1}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={isProcessing}
            />

            {/* Page Selection */}
            {pageCount > 0 && !isProcessing && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">{pageCount} pages total</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {pagesToDelete.size > 0
                          ? `${pagesToDelete.size} page${pagesToDelete.size > 1 ? "s" : ""} selected for deletion`
                          : "Click pages to select for deletion"}
                      </p>
                    </div>
                  </div>
                  {pagesToDelete.size > 0 && (
                    <button
                      onClick={() => setPagesToDelete(new Set())}
                      className="text-sm text-[var(--muted-foreground)] hover:text-foreground transition-colors"
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto p-2">
                  {pagePreviews.map((preview, index) => {
                    const pageNum = index + 1;
                    const isSelected = pagesToDelete.has(pageNum);

                    return (
                      <button
                        key={pageNum}
                        onClick={() => togglePage(pageNum)}
                        className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                          isSelected
                            ? "border-red-500 ring-2 ring-red-500/30"
                            : "border-[var(--border)] hover:border-[var(--accent)]"
                        }`}
                      >
                        <img src={preview} alt={`Page ${pageNum}`} className={`w-full ${isSelected ? "opacity-50" : ""}`} />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                              <Trash2 className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                        <div className={`absolute bottom-0 left-0 right-0 text-center py-1 text-xs font-medium ${isSelected ? "bg-red-500 text-white" : "bg-[var(--muted)]"}`}>
                          {pageNum}
                        </div>
                      </button>
                    );
                  })}

                  {pageCount > 20 && (
                    <div className="col-span-full text-center py-4 text-sm text-[var(--muted-foreground)]">
                      Showing first 20 pages. {pageCount - 20} more pages available.
                      <br />
                      Enter page numbers below for pages 21+
                    </div>
                  )}
                </div>

                {pageCount > 20 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Additional pages to delete (e.g., 21, 25-30)
                    </label>
                    <input
                      type="text"
                      placeholder="21, 25-30, 35"
                      className="w-full rounded-2xl border bg-[var(--background)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                      onChange={(e) => {
                        const input = e.target.value;
                        const newSet = new Set(pagesToDelete);

                        // Parse input
                        input.split(",").forEach(part => {
                          const trimmed = part.trim();
                          if (trimmed.includes("-")) {
                            const [start, end] = trimmed.split("-").map(n => parseInt(n.trim()));
                            if (!isNaN(start) && !isNaN(end)) {
                              for (let i = Math.max(21, start); i <= Math.min(pageCount, end); i++) {
                                newSet.add(i);
                              }
                            }
                          } else {
                            const num = parseInt(trimmed);
                            if (!isNaN(num) && num > 20 && num <= pageCount) {
                              newSet.add(num);
                            }
                          }
                        });

                        setPagesToDelete(newSet);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <ProgressBar progress={progress} status={status} />
              </div>
            )}

            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 text-sm text-red-500 dark:text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
                    <Check className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">Pages deleted successfully</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Removed {pagesToDelete.size} page{pagesToDelete.size > 1 ? "s" : ""}, {pageCount - pagesToDelete.size} remaining
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={deletePages}
                  disabled={files.length === 0 || isProcessing || pagesToDelete.size === 0}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-red-500 to-orange-400 px-8 py-4 font-medium text-white shadow-lg shadow-red-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete {pagesToDelete.size > 0 ? `${pagesToDelete.size} Page${pagesToDelete.size > 1 ? "s" : ""}` : "Pages"}
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                    setPageCount(0);
                    setPagesToDelete(new Set());
                    setPagePreviews([]);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Edit Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
