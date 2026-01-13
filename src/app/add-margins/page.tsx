"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Square, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

export default function AddMargins() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [marginTop, setMarginTop] = useState(36);
  const [marginRight, setMarginRight] = useState(36);
  const [marginBottom, setMarginBottom] = useState(36);
  const [marginLeft, setMarginLeft] = useState(36);
  const [uniformMargin, setUniformMargin] = useState(true);

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

  const handleUniformMarginChange = (value: number) => {
    setMarginTop(value);
    setMarginRight(value);
    setMarginBottom(value);
    setMarginLeft(value);
  };

  const addMargins = async () => {
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

      const newPdf = await PDFDocument.create();
      const scale = 2;

      for (let i = 1; i <= totalPages; i++) {
        setStatus(`Processing page ${i} of ${totalPages}...`);
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

        const originalWidth = viewport.width / scale;
        const originalHeight = viewport.height / scale;
        const newWidth = originalWidth + marginLeft + marginRight;
        const newHeight = originalHeight + marginTop + marginBottom;

        const newPage = newPdf.addPage([newWidth, newHeight]);

        newPage.drawImage(image, {
          x: marginLeft,
          y: marginBottom,
          width: originalWidth,
          height: originalHeight,
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
      console.error("Margin error:", err);
      setError("Failed to add margins. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_with_margins.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-green-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
                <Square className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Add Margins</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Add extra space around your PDF pages</p>
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
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="uniformMargin"
                    checked={uniformMargin}
                    onChange={(e) => setUniformMargin(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <label htmlFor="uniformMargin" className="text-sm font-medium">
                    Use uniform margins
                  </label>
                </div>

                {uniformMargin ? (
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      Margin (points) - 72pt = 1 inch
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="144"
                      value={marginTop}
                      onChange={(e) => handleUniformMarginChange(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {Math.round(marginTop / 72 * 100) / 100} inch / {Math.round(marginTop / 72 * 25.4 * 100) / 100} mm
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Top</label>
                      <input
                        type="number"
                        min="0"
                        max="144"
                        value={marginTop}
                        onChange={(e) => setMarginTop(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Right</label>
                      <input
                        type="number"
                        min="0"
                        max="144"
                        value={marginRight}
                        onChange={(e) => setMarginRight(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Bottom</label>
                      <input
                        type="number"
                        min="0"
                        max="144"
                        value={marginBottom}
                        onChange={(e) => setMarginBottom(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Left</label>
                      <input
                        type="number"
                        min="0"
                        max="144"
                        value={marginLeft}
                        onChange={(e) => setMarginLeft(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-emerald-500 focus:outline-none"
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 mb-4">
                  <Square className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Margins Added!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Your PDF now has extra margins</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={addMargins}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Square className="h-5 w-5" />
                  Add Margins
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
