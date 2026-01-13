"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Maximize2, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

type PageSize = "A4" | "Letter" | "Legal" | "A3" | "A5" | "Custom";

const PAGE_SIZES: Record<PageSize, { width: number; height: number; label: string }> = {
  A4: { width: 595, height: 842, label: "A4 (210 × 297 mm)" },
  Letter: { width: 612, height: 792, label: "Letter (8.5 × 11 in)" },
  Legal: { width: 612, height: 1008, label: "Legal (8.5 × 14 in)" },
  A3: { width: 842, height: 1191, label: "A3 (297 × 420 mm)" },
  A5: { width: 420, height: 595, label: "A5 (148 × 210 mm)" },
  Custom: { width: 612, height: 792, label: "Custom" },
};

export default function ResizePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [customWidth, setCustomWidth] = useState(612);
  const [customHeight, setCustomHeight] = useState(792);

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
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
  }, []);

  const resizePDF = async () => {
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

      const targetWidth = pageSize === "Custom" ? customWidth : PAGE_SIZES[pageSize].width;
      const targetHeight = pageSize === "Custom" ? customHeight : PAGE_SIZES[pageSize].height;

      const newPdf = await PDFDocument.create();
      const scale = 2;

      for (let i = 1; i <= totalPages; i++) {
        setStatus(`Resizing page ${i} of ${totalPages}...`);
        setProgress(10 + (i / totalPages) * 80);

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

        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const imageBytes = await fetch(imageDataUrl).then(res => res.arrayBuffer());
        const image = await newPdf.embedJpg(imageBytes);

        const newPage = newPdf.addPage([targetWidth, targetHeight]);

        // Calculate scaling to fit content
        const scaleX = targetWidth / (viewport.width / scale);
        const scaleY = targetHeight / (viewport.height / scale);
        const fitScale = Math.min(scaleX, scaleY);

        const scaledWidth = (viewport.width / scale) * fitScale;
        const scaledHeight = (viewport.height / scale) * fitScale;

        // Center the content
        const x = (targetWidth - scaledWidth) / 2;
        const y = (targetHeight - scaledHeight) / 2;

        newPage.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

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
      console.error("Resize error:", err);
      setError("Failed to resize PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_resized.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                <Maximize2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Resize PDF</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Change PDF page size to standard or custom dimensions</p>
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
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Target Page Size</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(Object.keys(PAGE_SIZES) as PageSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setPageSize(size)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          pageSize === size
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                        }`}
                      >
                        <div className="font-medium text-sm">{size}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {size === "Custom" ? "Set dimensions" : PAGE_SIZES[size].label.split("(")[1]?.replace(")", "")}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {pageSize === "Custom" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Width (pts)</label>
                      <input
                        type="number"
                        min="72"
                        max="2000"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Math.max(72, parseInt(e.target.value) || 612))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Height (pts)</label>
                      <input
                        type="number"
                        min="72"
                        max="2000"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Math.max(72, parseInt(e.target.value) || 792))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-4">
                  <Maximize2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">PDF Resized!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Resized to {pageSize === "Custom" ? `${customWidth} × ${customHeight} pts` : PAGE_SIZES[pageSize].label}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={resizePDF}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Maximize2 className="h-5 w-5" />
                  Resize PDF
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
                <button onClick={() => { setFiles([]); setResultUrl(null); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
