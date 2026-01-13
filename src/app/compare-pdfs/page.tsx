"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { GitCompare, Sparkles, AlertCircle, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

export default function ComparePDFs() {
  const [files1, setFiles1] = useState<File[]>([]);
  const [files2, setFiles2] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<{
    pages1: string[];
    pages2: string[];
    differences: boolean[];
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const loadPdfJs = async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    return pdfjsLib;
  };

  const handleFiles1Selected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles1([newFiles[0]]);
      setComparison(null);
      setError(null);
    }
  }, []);

  const handleFiles2Selected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles2([newFiles[0]]);
      setComparison(null);
      setError(null);
    }
  }, []);

  const comparePDFs = async () => {
    if (files1.length === 0 || files2.length === 0) {
      setError("Please select two PDF files to compare");
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
      setStatus("Loading PDFs...");
      setProgress(10);

      const pdfjsLib = await loadPdfJs();

      const [buffer1, buffer2] = await Promise.all([
        files1[0].arrayBuffer(),
        files2[0].arrayBuffer(),
      ]);

      const [pdf1, pdf2] = await Promise.all([
        pdfjsLib.getDocument({ data: buffer1 }).promise as Promise<PDFDocumentProxy>,
        pdfjsLib.getDocument({ data: buffer2 }).promise as Promise<PDFDocumentProxy>,
      ]);

      const maxPages = Math.max(pdf1.numPages, pdf2.numPages);
      const pages1: string[] = [];
      const pages2: string[] = [];
      const differences: boolean[] = [];

      const scale = 1.5;

      for (let i = 1; i <= maxPages; i++) {
        setStatus(`Comparing page ${i} of ${maxPages}...`);
        setProgress(10 + (i / maxPages) * 80);

        let image1 = "";
        let image2 = "";

        if (i <= pdf1.numPages) {
          const page = await pdf1.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
            canvas,
          }).promise;

          image1 = canvas.toDataURL("image/jpeg", 0.8);
        }

        if (i <= pdf2.numPages) {
          const page = await pdf2.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
            canvas,
          }).promise;

          image2 = canvas.toDataURL("image/jpeg", 0.8);
        }

        pages1.push(image1);
        pages2.push(image2);

        // Simple visual difference check
        differences.push(image1 !== image2);
      }

      setComparison({ pages1, pages2, differences });
      setCurrentPage(0);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Compare error:", err);
      setError("Failed to compare PDFs. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = comparison ? Math.max(comparison.pages1.length, comparison.pages2.length) : 0;
  const differentPages = comparison ? comparison.differences.filter(Boolean).length : 0;

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-violet-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-violet-500 shadow-lg">
                <GitCompare className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Compare PDFs</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Visually compare two PDF files side by side</p>
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
            {!comparison && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">First PDF</h3>
                  <FileDropzone
                    onFilesSelected={handleFiles1Selected}
                    accept=".pdf,application/pdf"
                    multiple={false}
                    maxSize={maxFileSize}
                    maxFiles={1}
                    files={files1}
                    onRemoveFile={() => setFiles1([])}
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">Second PDF</h3>
                  <FileDropzone
                    onFilesSelected={handleFiles2Selected}
                    accept=".pdf,application/pdf"
                    multiple={false}
                    maxSize={maxFileSize}
                    maxFiles={1}
                    files={files2}
                    onRemoveFile={() => setFiles2([])}
                    disabled={isProcessing}
                  />
                </div>
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

            {comparison && (
              <div className="space-y-4">
                <div className="rounded-3xl border bg-[var(--card)] p-4 shadow-glass">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Page {currentPage + 1}</span> of {totalPages}
                      {comparison.differences[currentPage] && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs">Different</span>
                      )}
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">
                      {differentPages} of {totalPages} pages differ
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-xl overflow-hidden bg-white">
                      <div className="bg-[var(--muted)] px-3 py-1.5 text-xs font-medium border-b">
                        {files1[0]?.name || "First PDF"}
                      </div>
                      {comparison.pages1[currentPage] ? (
                        <img
                          src={comparison.pages1[currentPage]}
                          alt={`Page ${currentPage + 1} of first PDF`}
                          className="w-full h-auto"
                        />
                      ) : (
                        <div className="p-8 text-center text-[var(--muted-foreground)]">
                          No page
                        </div>
                      )}
                    </div>
                    <div className="border rounded-xl overflow-hidden bg-white">
                      <div className="bg-[var(--muted)] px-3 py-1.5 text-xs font-medium border-b">
                        {files2[0]?.name || "Second PDF"}
                      </div>
                      {comparison.pages2[currentPage] ? (
                        <img
                          src={comparison.pages2[currentPage]}
                          alt={`Page ${currentPage + 1} of second PDF`}
                          className="w-full h-auto"
                        />
                      ) : (
                        <div className="p-8 text-center text-[var(--muted-foreground)]">
                          No page
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex gap-1 flex-wrap justify-center max-w-xs">
                      {comparison.differences.slice(0, 20).map((isDiff, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentPage
                              ? "bg-purple-500"
                              : isDiff
                              ? "bg-red-400"
                              : "bg-[var(--border)]"
                          }`}
                        />
                      ))}
                      {comparison.differences.length > 20 && (
                        <span className="text-xs text-[var(--muted-foreground)]">+{comparison.differences.length - 20}</span>
                      )}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!comparison ? (
                <button
                  onClick={comparePDFs}
                  disabled={files1.length === 0 || files2.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <GitCompare className="h-5 w-5" />
                  Compare PDFs
                </button>
              ) : (
                <button
                  onClick={() => { setFiles1([]); setFiles2([]); setComparison(null); }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Compare Different PDFs
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
