"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Combine, ArrowUpDown, GripVertical, Sparkles, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import { trackFileProcessed } from "@/lib/analytics";

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setResultUrl(null);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResultUrl(null);
  }, []);

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const [removed] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, removed);
      return newFiles;
    });
  }, []);

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError("Please select at least 2 PDF files to merge");
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
      setStatus("Creating merged document...");
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        setStatus(`Processing file ${i + 1} of ${files.length}...`);
        setProgress(((i + 1) / (files.length + 1)) * 80);

        const fileBuffer = await files[i].arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      setStatus("Finalizing...");
      setProgress(90);

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Track analytics - track total size of all files merged
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      trackFileProcessed("merge", totalSize);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Merge error:", err);
      setError("Failed to merge PDFs. Please ensure all files are valid PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "merged.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                <Combine className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Merge PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Unite your documents into one seamless flow
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
              multiple={true}
              maxSize={maxFileSize}
              maxFiles={10}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={isProcessing}
            />

            {/* File reordering */}
            {files.length > 1 && !isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--muted)]">
                    <ArrowUpDown className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">Arrange your documents</span>
                    <p className="text-xs text-[var(--muted-foreground)]">Drag to set the order</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border bg-[var(--background)] p-4 hover:shadow-glass transition-all animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <GripVertical className="h-5 w-5 text-[var(--muted-foreground)] cursor-grab" />
                      <span className="flex-1 text-sm font-medium truncate">{file.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveFile(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                          className="rounded-xl p-2 hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveFile(index, Math.min(files.length - 1, index + 1))}
                          disabled={index === files.length - 1}
                          className="rounded-xl p-2 hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={mergePDFs}
                  disabled={files.length < 2 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-4 font-medium text-white shadow-lg shadow-blue-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Combine className="h-5 w-5" />
                  Merge {files.length} PDF{files.length !== 1 ? "s" : ""}
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Merged PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Merge More Files
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
