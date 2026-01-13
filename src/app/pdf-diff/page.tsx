"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { GitCompareArrows, Sparkles, AlertCircle, Crown, Check, X } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

interface DiffResult {
  page: number;
  text1: string;
  text2: string;
  hasDifferences: boolean;
}

export default function PDFDiff() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<DiffResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ total: number; different: number; same: number } | null>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const loadPdfJs = async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    return pdfjsLib;
  };

  const handleFile1Selected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFile1(newFiles[0]);
      setResults([]);
      setError(null);
      setSummary(null);
    }
  }, []);

  const handleFile2Selected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFile2(newFiles[0]);
      setResults([]);
      setError(null);
      setSummary(null);
    }
  }, []);

  const extractPageText = async (pdf: PDFDocumentProxy, pageNum: number): Promise<string> => {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    return textContent.items
      .filter((item): item is TextItem => "str" in item)
      .map(item => item.str)
      .join(" ")
      .trim();
  };

  const comparePDFs = async () => {
    if (!file1 || !file2) {
      setError("Please select both PDF files");
      return;
    }

    if (!canProcess) {
      setError("Daily limit reached. Upgrade to Pro for unlimited processing.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      setStatus("Loading PDFs...");
      setProgress(10);

      const pdfjsLib = await loadPdfJs();
      const [buffer1, buffer2] = await Promise.all([
        file1.arrayBuffer(),
        file2.arrayBuffer(),
      ]);

      const [pdf1, pdf2] = await Promise.all([
        pdfjsLib.getDocument({ data: buffer1 }).promise as Promise<PDFDocumentProxy>,
        pdfjsLib.getDocument({ data: buffer2 }).promise as Promise<PDFDocumentProxy>,
      ]);

      const maxPages = Math.max(pdf1.numPages, pdf2.numPages);
      const diffResults: DiffResult[] = [];
      let differentCount = 0;

      for (let i = 1; i <= maxPages; i++) {
        setStatus(`Comparing page ${i} of ${maxPages}...`);
        setProgress(10 + ((i / maxPages) * 80));

        const text1 = i <= pdf1.numPages ? await extractPageText(pdf1, i) : "";
        const text2 = i <= pdf2.numPages ? await extractPageText(pdf2, i) : "";

        const hasDifferences = text1 !== text2;
        if (hasDifferences) differentCount++;

        diffResults.push({
          page: i,
          text1: text1.slice(0, 500) + (text1.length > 500 ? "..." : ""),
          text2: text2.slice(0, 500) + (text2.length > 500 ? "..." : ""),
          hasDifferences,
        });
      }

      setResults(diffResults);
      setSummary({
        total: maxPages,
        different: differentCount,
        same: maxPages - differentCount,
      });

      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Comparison error:", err);
      setError("Failed to compare PDFs. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                <GitCompareArrows className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">PDF Diff</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Compare text content between two PDFs</p>
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
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">First PDF</label>
                <FileDropzone
                  onFilesSelected={handleFile1Selected}
                  accept=".pdf,application/pdf"
                  multiple={false}
                  maxSize={maxFileSize}
                  maxFiles={1}
                  files={file1 ? [file1] : []}
                  onRemoveFile={() => setFile1(null)}
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Second PDF</label>
                <FileDropzone
                  onFilesSelected={handleFile2Selected}
                  accept=".pdf,application/pdf"
                  multiple={false}
                  maxSize={maxFileSize}
                  maxFiles={1}
                  files={file2 ? [file2] : []}
                  onRemoveFile={() => setFile2(null)}
                  disabled={isProcessing}
                />
              </div>
            </div>

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

            {summary && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <h3 className="font-semibold mb-4">Comparison Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-[var(--muted)]">
                    <p className="text-2xl font-bold">{summary.total}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Total Pages</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-2xl font-bold text-emerald-500">{summary.same}</p>
                    <p className="text-sm text-emerald-500">Identical</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-2xl font-bold text-red-500">{summary.different}</p>
                    <p className="text-sm text-red-500">Different</p>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass space-y-4">
                <h3 className="font-semibold">Page Details</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.map((result) => (
                    <div
                      key={result.page}
                      className={`p-4 rounded-xl ${
                        result.hasDifferences
                          ? "bg-red-500/10 border border-red-500/20"
                          : "bg-emerald-500/10 border border-emerald-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {result.hasDifferences ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : (
                          <Check className="h-4 w-4 text-emerald-500" />
                        )}
                        <span className="font-medium">
                          Page {result.page}
                        </span>
                        <span className={`text-sm ${result.hasDifferences ? "text-red-500" : "text-emerald-500"}`}>
                          {result.hasDifferences ? "Different" : "Identical"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!results.length && (
              <button
                onClick={comparePDFs}
                disabled={!file1 || !file2 || isProcessing}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <GitCompareArrows className="h-5 w-5" />
                Compare PDFs
              </button>
            )}

            {results.length > 0 && (
              <button
                onClick={() => { setFile1(null); setFile2(null); setResults([]); setSummary(null); }}
                className="w-full flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
              >
                Compare Different Files
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
