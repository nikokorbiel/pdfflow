"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, FileText, Sparkles, AlertCircle, Crown, Copy, Check } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

export default function ExtractText() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const loadPdfJs = async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    return pdfjsLib;
  };

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setExtractedText("");
      setError(null);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setExtractedText("");
  }, []);

  const extractText = async () => {
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
      setProgress(10);

      const pdfjsLib = await loadPdfJs();
      const fileBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise as PDFDocumentProxy;
      const totalPages = pdf.numPages;

      let fullText = "";

      for (let i = 1; i <= totalPages; i++) {
        setStatus(`Extracting text from page ${i} of ${totalPages}...`);
        setProgress(10 + (i / totalPages) * 85);

        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => {
            if ("str" in item) {
              return item.str;
            }
            return "";
          })
          .join(" ");

        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }

      setExtractedText(fullText.trim());
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Extract error:", err);
      setError("Failed to extract text. The PDF may be scanned or image-based.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_text.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Extract Text
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Extract all text content from your PDF
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

            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <ProgressBar progress={progress} status={status} />
              </div>
            )}

            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                    {error.includes("scanned") && (
                      <p className="text-xs text-red-400/70 mt-1">
                        Try our OCR tool for scanned PDFs.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {extractedText && (
              <div className="rounded-3xl border bg-[var(--card)] shadow-glass animate-fade-in">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-500" />
                    Extracted Text
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-[var(--muted)] hover:bg-[var(--border)] transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap font-mono">
                    {extractedText}
                  </pre>
                </div>
                <div className="p-4 border-t border-[var(--border)] text-sm text-[var(--muted-foreground)]">
                  {extractedText.length.toLocaleString()} characters extracted
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!extractedText ? (
                <button
                  onClick={extractText}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-4 font-medium text-white shadow-lg shadow-teal-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <FileText className="h-5 w-5" />
                  Extract Text
                </button>
              ) : (
                <button
                  onClick={downloadText}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download as TXT
                </button>
              )}

              {extractedText && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setExtractedText("");
                    setProgress(0);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Extract from Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
