"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Split, FileText, Sparkles, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

type SplitMode = "all" | "range" | "extract";

export default function SplitPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrls, setResultUrls] = useState<{ name: string; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<SplitMode>("all");
  const [pageRange, setPageRange] = useState("");

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrls([]);
      setError(null);

      // Get page count
      try {
        const buffer = await newFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        setPageCount(pdf.getPageCount());
      } catch {
        setError("Could not read PDF file");
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrls([]);
    setPageCount(0);
  }, []);

  const splitPDF = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
      return;
    }

    if (!canProcess) {
      setError("Daily limit reached. Upgrade to Pro for unlimited processing.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResultUrls([]);

    try {
      const fileBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const totalPages = pdf.getPageCount();
      const results: { name: string; url: string }[] = [];

      if (splitMode === "all") {
        // Split into individual pages
        for (let i = 0; i < totalPages; i++) {
          setStatus(`Extracting page ${i + 1} of ${totalPages}...`);
          setProgress(((i + 1) / totalPages) * 90);

          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(page);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          results.push({ name: `page_${i + 1}.pdf`, url });
        }
      } else if (splitMode === "range" || splitMode === "extract") {
        // Parse page range (e.g., "1-3, 5, 7-9")
        const pages = parsePageRange(pageRange, totalPages);
        if (pages.length === 0) {
          throw new Error("Invalid page range");
        }

        if (splitMode === "extract") {
          // Extract as single PDF
          setStatus("Extracting selected pages...");
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(pdf, pages.map((p) => p - 1));
          copiedPages.forEach((page) => newPdf.addPage(page));

          const pdfBytes = await newPdf.save();
          const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          results.push({ name: `extracted_pages.pdf`, url });
        } else {
          // Split by ranges
          for (let i = 0; i < pages.length; i++) {
            setStatus(`Extracting page ${pages[i]}...`);
            setProgress(((i + 1) / pages.length) * 90);

            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdf, [pages[i] - 1]);
            newPdf.addPage(page);

            const pdfBytes = await newPdf.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            results.push({ name: `page_${pages[i]}.pdf`, url });
          }
        }
      }

      setResultUrls(results);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Split error:", err);
      setError("Failed to split PDF. Please ensure the file is a valid PDF and page range is correct.");
    } finally {
      setIsProcessing(false);
    }
  };

  const parsePageRange = (range: string, maxPage: number): number[] => {
    const pages: Set<number> = new Set();
    const parts = range.split(",").map((s) => s.trim());

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((s) => parseInt(s.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPage, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const page = parseInt(part, 10);
        if (!isNaN(page) && page >= 1 && page <= maxPage) {
          pages.add(page);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const downloadAll = () => {
    resultUrls.forEach(({ name, url }) => {
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-green-400/10 to-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg">
                <Split className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Split PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Liberate pages from their PDF confines
            </p>
          </div>

          {/* Usage indicator */}
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
                  <Link
                    href="/pricing"
                    className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
                  >
                    Upgrade
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Main content */}
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

            {/* Split options */}
            {pageCount > 0 && !isProcessing && resultUrls.length === 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 space-y-5 shadow-glass animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
                    <FileText className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Your document has <strong className="text-foreground">{pageCount}</strong> page{pageCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === "all"}
                      onChange={() => setSplitMode("all")}
                      className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-sm font-medium">Split into individual pages</span>
                      <p className="text-xs text-[var(--muted-foreground)]">Each page becomes its own PDF</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === "extract"}
                      onChange={() => setSplitMode("extract")}
                      className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-sm font-medium">Extract specific pages as one PDF</span>
                      <p className="text-xs text-[var(--muted-foreground)]">Combine selected pages into a single file</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === "range"}
                      onChange={() => setSplitMode("range")}
                      className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-sm font-medium">Extract specific pages as separate PDFs</span>
                      <p className="text-xs text-[var(--muted-foreground)]">Each selected page becomes its own file</p>
                    </div>
                  </label>
                </div>

                {(splitMode === "range" || splitMode === "extract") && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium mb-2">
                      Page range
                    </label>
                    <input
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g., 1-3, 5, 7-9"
                      className="w-full rounded-2xl border bg-[var(--background)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                      Use commas to separate pages, dashes for ranges
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <ProgressBar progress={progress} status={status} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 text-sm text-red-500 dark:text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            {/* Results */}
            {resultUrls.length > 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 space-y-4 shadow-glass animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
                      <FileText className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span className="font-medium">{resultUrls.length} file{resultUrls.length > 1 ? "s" : ""} ready</span>
                  </div>
                  {resultUrls.length > 1 && (
                    <button
                      onClick={downloadAll}
                      className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
                    >
                      Download all
                    </button>
                  )}
                </div>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {resultUrls.map(({ name, url }, index) => (
                    <li
                      key={name}
                      className="flex items-center justify-between rounded-2xl border bg-[var(--background)] p-3 hover:shadow-glass transition-all animate-scale-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      <a
                        href={url}
                        download={name}
                        className="rounded-xl p-2 hover:bg-[var(--muted)] transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {resultUrls.length === 0 ? (
                <button
                  onClick={splitPDF}
                  disabled={files.length === 0 || isProcessing || ((splitMode === "range" || splitMode === "extract") && !pageRange)}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Split className="h-5 w-5" />
                  Split PDF
                </button>
              ) : (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrls([]);
                    setProgress(0);
                    setPageCount(0);
                    setPageRange("");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Split Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
