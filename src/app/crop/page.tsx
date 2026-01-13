"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Crop, Sparkles, RotateCcw, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

// Dynamic import for pdfjs-dist to avoid SSR issues
const loadPdfJs = async () => {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  return pdfjsLib;
};

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CropPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [applyToAll, setApplyToAll] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);

      try {
        const pdfjsLib = await loadPdfJs();
        const buffer = await newFiles[0].arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        setPageCount(pdf.numPages);

        // Render first page preview
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });

        const scale = Math.min(600 / viewport.width, 800 / viewport.height);
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        // @ts-expect-error - pdfjs-dist types mismatch
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        setPreviewUrl(canvas.toDataURL());
        setCropArea({ x: 10, y: 10, width: 80, height: 80 }); // Default crop area
      } catch {
        setError("Could not read PDF file");
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setPreviewUrl(null);
    setPageCount(0);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setCropArea({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cropPDF = async () => {
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
      const pdf = await PDFDocument.load(fileBuffer);
      const pages = pdf.getPages();

      setStatus("Applying crop...");

      for (let i = 0; i < pages.length; i++) {
        if (!applyToAll && i > 0) break;

        setProgress(20 + ((i + 1) / pages.length) * 60);
        const page = pages[i];
        const { width, height } = page.getSize();

        // Convert percentage crop area to actual coordinates
        const cropX = (cropArea.x / 100) * width;
        const cropY = height - ((cropArea.y + cropArea.height) / 100) * height;
        const cropWidth = (cropArea.width / 100) * width;
        const cropHeight = (cropArea.height / 100) * height;

        // Set the crop box
        page.setCropBox(cropX, cropY, cropWidth, cropHeight);
      }

      setStatus("Saving cropped PDF...");
      setProgress(90);

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Crop error:", err);
      setError("Failed to crop PDF. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `cropped_${files[0]?.name || "document.pdf"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetCrop = () => {
    setCropArea({ x: 10, y: 10, width: 80, height: 80 });
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-500/20 to-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-orange-400/10 to-rose-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-pink-400 shadow-lg">
                <Crop className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Crop PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Trim and resize your PDF pages
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

            {/* Crop Preview */}
            {previewUrl && !isProcessing && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Select crop area</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">Click and drag to define the crop region</p>
                  </div>
                  <button
                    onClick={resetCrop}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-[var(--muted)] transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>

                <div
                  ref={containerRef}
                  className="relative mx-auto cursor-crosshair select-none"
                  style={{ maxWidth: "600px" }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img src={previewUrl} alt="PDF Preview" className="w-full rounded-xl" draggable={false} />

                  {/* Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Dark overlay outside crop area */}
                    <div
                      className="absolute inset-0 bg-black/50"
                      style={{
                        clipPath: `polygon(
                          0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                          ${cropArea.x}% ${cropArea.y}%,
                          ${cropArea.x}% ${cropArea.y + cropArea.height}%,
                          ${cropArea.x + cropArea.width}% ${cropArea.y + cropArea.height}%,
                          ${cropArea.x + cropArea.width}% ${cropArea.y}%,
                          ${cropArea.x}% ${cropArea.y}%
                        )`,
                      }}
                    />

                    {/* Crop area border */}
                    <div
                      className="absolute border-2 border-rose-500 border-dashed"
                      style={{
                        left: `${cropArea.x}%`,
                        top: `${cropArea.y}%`,
                        width: `${cropArea.width}%`,
                        height: `${cropArea.height}%`,
                      }}
                    >
                      {/* Corner handles */}
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-rose-500 rounded-full" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-rose-500 rounded-full" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-rose-500 rounded-full" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-rose-500 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-6 text-sm text-[var(--muted-foreground)]">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={applyToAll}
                      onChange={(e) => setApplyToAll(e.target.checked)}
                      className="rounded"
                    />
                    Apply to all {pageCount} pages
                  </label>
                </div>
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
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10">
                    <Crop className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-medium">PDF cropped successfully</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Your cropped PDF is ready to download</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={cropPDF}
                  disabled={files.length === 0 || isProcessing || cropArea.width < 5 || cropArea.height < 5}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-400 px-8 py-4 font-medium text-white shadow-lg shadow-rose-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Crop className="h-5 w-5" />
                  Crop PDF
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Cropped PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setPreviewUrl(null);
                    setProgress(0);
                    setPageCount(0);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Crop Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
