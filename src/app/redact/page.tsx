"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, EyeOff, Sparkles, RotateCcw, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

// Dynamic import for pdfjs-dist to avoid SSR issues
const loadPdfJs = async () => {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  return pdfjsLib;
};

interface RedactionArea {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function RedactPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [redactions, setRedactions] = useState<RedactionArea[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPage = useCallback(async (pdf: any, pageNum: number) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });

    const scale = Math.min(600 / viewport.width, 800 / viewport.height);
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
    }).promise;

    setPreviewUrl(canvas.toDataURL());
  }, []);

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setRedactions([]);
      setCurrentPage(1);

      try {
        const pdfjsLib = await loadPdfJs();
        const buffer = await newFiles[0].arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        setPdfDoc(pdf);
        setPageCount(pdf.numPages);
        await renderPage(pdf, 1);
      } catch {
        setError("Could not read PDF file");
      }
    }
  }, [renderPage]);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setPreviewUrl(null);
    setPageCount(0);
    setRedactions([]);
    setPdfDoc(null);
  }, []);

  const changePage = async (newPage: number) => {
    if (!pdfDoc || newPage < 1 || newPage > pageCount) return;
    setCurrentPage(newPage);
    await renderPage(pdfDoc, newPage);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = () => {
    if (!isDragging || !containerRef.current) return;
    // Drawing preview handled by CSS
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const redaction: RedactionArea = {
      id: Math.random().toString(36).substr(2, 9),
      page: currentPage,
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y),
    };

    if (redaction.width > 1 && redaction.height > 1) {
      setRedactions([...redactions, redaction]);
    }

    setIsDragging(false);
  };

  const removeRedaction = (id: string) => {
    setRedactions(redactions.filter(r => r.id !== id));
  };

  const applyRedactions = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
      return;
    }

    if (redactions.length === 0) {
      setError("Please add at least one redaction area");
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

      setStatus("Applying redactions...");

      for (let i = 0; i < pages.length; i++) {
        setProgress(20 + ((i + 1) / pages.length) * 60);
        const page = pages[i];
        const { width, height } = page.getSize();

        // Get redactions for this page
        const pageRedactions = redactions.filter(r => r.page === i + 1);

        for (const redaction of pageRedactions) {
          // Convert percentage to actual coordinates
          const rectX = (redaction.x / 100) * width;
          const rectY = height - ((redaction.y + redaction.height) / 100) * height;
          const rectWidth = (redaction.width / 100) * width;
          const rectHeight = (redaction.height / 100) * height;

          // Draw black rectangle
          page.drawRectangle({
            x: rectX,
            y: rectY,
            width: rectWidth,
            height: rectHeight,
            color: rgb(0, 0, 0),
          });
        }
      }

      setStatus("Saving redacted PDF...");
      setProgress(90);

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Redaction error:", err);
      setError("Failed to redact PDF. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `redacted_${files[0]?.name || "document.pdf"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentPageRedactions = redactions.filter(r => r.page === currentPage);

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-slate-500/20 to-gray-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-zinc-400/10 to-slate-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-gray-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-600 to-gray-500 shadow-lg">
                <EyeOff className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Redact PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Permanently hide sensitive information
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

            {/* Redaction Editor */}
            {previewUrl && !isProcessing && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Draw redaction areas</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">Click and drag to mark areas to redact</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {redactions.length} redaction{redactions.length !== 1 ? "s" : ""}
                    </span>
                    {redactions.length > 0 && (
                      <button
                        onClick={() => setRedactions([])}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm hover:bg-[var(--muted)] transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Page navigation */}
                {pageCount > 1 && (
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="p-2 rounded-lg hover:bg-[var(--muted)] disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm">
                      Page {currentPage} of {pageCount}
                    </span>
                    <button
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage >= pageCount}
                      className="p-2 rounded-lg hover:bg-[var(--muted)] disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}

                <div
                  ref={containerRef}
                  className="relative mx-auto cursor-crosshair select-none"
                  style={{ maxWidth: "600px" }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  <img src={previewUrl} alt="PDF Preview" className="w-full rounded-xl" draggable={false} />

                  {/* Redaction areas */}
                  {currentPageRedactions.map((redaction) => (
                    <div
                      key={redaction.id}
                      className="absolute bg-black group cursor-pointer"
                      style={{
                        left: `${redaction.x}%`,
                        top: `${redaction.y}%`,
                        width: `${redaction.width}%`,
                        height: `${redaction.height}%`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRedaction(redaction.id);
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/80">
                        <span className="text-white text-xs">Click to remove</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs text-center text-[var(--muted-foreground)]">
                  Redactions are permanent and cannot be undone. The underlying content will be removed.
                </p>
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
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-500/10">
                    <EyeOff className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium">Redaction complete</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{redactions.length} area{redactions.length !== 1 ? "s" : ""} redacted permanently</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-5 animate-fade-in">
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                <strong>Warning:</strong> Redactions are permanent. This tool covers content with black rectangles.
                <br className="hidden sm:block" />
                <span className="text-[var(--accent)]"> Upgrade to Pro</span> for true content removal that sanitizes metadata.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={applyRedactions}
                  disabled={files.length === 0 || isProcessing || redactions.length === 0}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-slate-600 to-gray-500 px-8 py-4 font-medium text-white shadow-lg shadow-slate-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <EyeOff className="h-5 w-5" />
                  Apply Redactions
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Redacted PDF
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
                    setRedactions([]);
                    setPdfDoc(null);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Redact Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
