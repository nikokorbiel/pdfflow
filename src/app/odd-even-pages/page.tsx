"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, SplitSquareVertical, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

type ExtractMode = "odd" | "even";

export default function OddEvenPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ExtractMode>("odd");
  const [totalPages, setTotalPages] = useState(0);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);

      try {
        const fileBuffer = await newFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);
        setTotalPages(pdfDoc.getPageCount());
      } catch {
        setError("Failed to read PDF");
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setTotalPages(0);
  }, []);

  const extractPages = async () => {
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

    try {
      setStatus("Loading PDF...");
      setProgress(20);

      const fileBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pageCount = pdfDoc.getPageCount();

      setStatus(`Extracting ${mode} pages...`);
      setProgress(50);

      const newPdf = await PDFDocument.create();
      const pageIndices: number[] = [];

      for (let i = 0; i < pageCount; i++) {
        const pageNumber = i + 1;
        if (mode === "odd" && pageNumber % 2 === 1) {
          pageIndices.push(i);
        } else if (mode === "even" && pageNumber % 2 === 0) {
          pageIndices.push(i);
        }
      }

      if (pageIndices.length === 0) {
        setError(`No ${mode} pages found in this document`);
        setIsProcessing(false);
        return;
      }

      const pages = await newPdf.copyPages(pdfDoc, pageIndices);
      pages.forEach(page => newPdf.addPage(page));

      setStatus("Saving PDF...");
      setProgress(80);

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to extract pages. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_${mode}_pages.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const oddCount = Math.ceil(totalPages / 2);
  const evenCount = Math.floor(totalPages / 2);

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-indigo-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg">
                <SplitSquareVertical className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Odd/Even Pages</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Extract only odd or even pages from your PDF</p>
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
              multiple={false}
              maxSize={maxFileSize}
              maxFiles={1}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={isProcessing}
            />

            {files.length > 0 && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Extract Pages</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode("odd")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      mode === "odd"
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                    }`}
                  >
                    <div className="text-2xl font-bold">Odd</div>
                    <div className="text-sm text-[var(--muted-foreground)]">Pages 1, 3, 5...</div>
                    {totalPages > 0 && (
                      <div className="text-xs text-[var(--muted-foreground)] mt-1">{oddCount} pages</div>
                    )}
                  </button>
                  <button
                    onClick={() => setMode("even")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      mode === "even"
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                    }`}
                  >
                    <div className="text-2xl font-bold">Even</div>
                    <div className="text-sm text-[var(--muted-foreground)]">Pages 2, 4, 6...</div>
                    {totalPages > 0 && (
                      <div className="text-xs text-[var(--muted-foreground)] mt-1">{evenCount} pages</div>
                    )}
                  </button>
                </div>
                {totalPages > 0 && (
                  <p className="mt-3 text-sm text-[var(--muted-foreground)] text-center">
                    Total pages in document: {totalPages}
                  </p>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <ProgressBar progress={progress} status={status} />
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

            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 mb-4">
                  <SplitSquareVertical className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Pages Extracted!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {mode === "odd" ? oddCount : evenCount} {mode} pages extracted
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={extractPages}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <SplitSquareVertical className="h-5 w-5" />
                  Extract {mode.charAt(0).toUpperCase() + mode.slice(1)} Pages
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
              )}
              {resultUrl && (
                <button onClick={() => { setFiles([]); setResultUrl(null); setTotalPages(0); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
                  Process Another
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
