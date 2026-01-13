"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, FileX, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

export default function RemoveBlankPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removedCount, setRemovedCount] = useState(0);
  const [threshold, setThreshold] = useState(99);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const loadPdfJs = async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    return pdfjsLib;
  };

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setRemovedCount(0);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setRemovedCount(0);
  }, []);

  const isPageBlank = (imageData: ImageData, whiteThreshold: number): boolean => {
    const data = imageData.data;
    let whitePixels = 0;
    const totalPixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Check if pixel is near-white
      if (r > 250 && g > 250 && b > 250) {
        whitePixels++;
      }
    }

    const whitePercentage = (whitePixels / totalPixels) * 100;
    return whitePercentage >= whiteThreshold;
  };

  const removeBlankPages = async () => {
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

      const nonBlankPageIndices: number[] = [];
      const scale = 0.5; // Lower scale for faster processing

      setStatus("Analyzing pages...");

      for (let i = 1; i <= totalPages; i++) {
        setProgress(10 + ((i / totalPages) * 60));
        setStatus(`Checking page ${i} of ${totalPages}...`);

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        if (!isPageBlank(imageData, threshold)) {
          nonBlankPageIndices.push(i - 1); // 0-indexed for pdf-lib
        }
      }

      const removed = totalPages - nonBlankPageIndices.length;
      setRemovedCount(removed);

      if (nonBlankPageIndices.length === 0) {
        setError("All pages appear to be blank!");
        setIsProcessing(false);
        return;
      }

      if (removed === 0) {
        setError("No blank pages found.");
        setIsProcessing(false);
        return;
      }

      setStatus("Creating new PDF...");
      setProgress(80);

      const pdfDoc = await PDFDocument.load(fileBuffer);
      const newPdf = await PDFDocument.create();

      const pages = await newPdf.copyPages(pdfDoc, nonBlankPageIndices);
      pages.forEach(page => newPdf.addPage(page));

      setStatus("Saving PDF...");
      setProgress(95);

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Remove blank pages error:", err);
      setError("Failed to process PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_no_blanks.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-500/20 to-pink-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg">
                <FileX className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Remove Blank Pages</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Automatically detect and remove blank pages</p>
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
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Blank Detection Sensitivity</label>
                    <span className="text-sm text-[var(--muted-foreground)]">{threshold}% white</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="100"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                    <span>More aggressive</span>
                    <span>Strict (only pure white)</span>
                  </div>
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

            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 mb-4">
                  <FileX className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Blank Pages Removed!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Removed {removedCount} blank page{removedCount !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={removeBlankPages}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FileX className="h-5 w-5" />
                  Remove Blank Pages
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
                <button onClick={() => { setFiles([]); setResultUrl(null); setRemovedCount(0); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
