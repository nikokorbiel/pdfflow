"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, RotateCw, Sparkles, RotateCcw, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

type RotationAngle = 90 | 180 | 270;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDFLib = any;

export default function RotatePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<RotationAngle>(90);
  const [rotateAll, setRotateAll] = useState(true);
  const [selectedPages, setSelectedPages] = useState<string>("");
  const [previews, setPreviews] = useState<string[]>([]);
  const pdfjsRef = useRef<PDFLib | null>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  // Load PDF.js dynamically on client side
  useEffect(() => {
    const loadPdfJs = async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      pdfjsRef.current = pdfjs;
    };
    loadPdfJs();
  }, []);

  const generatePreviews = async (file: File) => {
    if (!pdfjsRef.current) return;

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsRef.current.getDocument({ data: buffer }).promise;
      const previewUrls: string[] = [];

      // Generate previews for first 6 pages max
      const pagesToPreview = Math.min(pdf.numPages, 6);

      for (let i = 1; i <= pagesToPreview; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        previewUrls.push(canvas.toDataURL("image/jpeg", 0.7));
      }

      setPreviews(previewUrls);
    } catch (err) {
      console.error("Preview generation error:", err);
    }
  };

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setPreviews([]);

      try {
        const buffer = await newFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        setPageCount(pdf.getPageCount());

        // Generate previews
        generatePreviews(newFiles[0]);
      } catch {
        setError("Could not read PDF file");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setPageCount(0);
    setPreviews([]);
  }, []);

  const parsePageSelection = (input: string, maxPage: number): number[] => {
    const pages: Set<number> = new Set();
    const parts = input.split(",").map((s) => s.trim());

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((s) => parseInt(s.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPage, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const page = parseInt(part, 10);
        if (!isNaN(page) && page >= 1 && page <= maxPage) {
          pages.add(page);
        }
      }
    }

    return Array.from(pages);
  };

  const rotatePDF = async () => {
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

      setStatus("Rotating pages...");
      setProgress(50);

      const pagesToRotate = rotateAll
        ? pages.map((_, i) => i + 1)
        : parsePageSelection(selectedPages, pages.length);

      for (const pageNum of pagesToRotate) {
        if (pageNum >= 1 && pageNum <= pages.length) {
          const page = pages[pageNum - 1];
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + rotation));
        }
      }

      setStatus("Saving PDF...");
      setProgress(80);

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Rotate error:", err);
      setError("Failed to rotate PDF. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `rotated_${files[0]?.name || "document.pdf"}`;
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
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-violet-400/10 to-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-400 shadow-lg">
                <RotateCw className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Rotate PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Turn your pages in the right direction
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
              multiple={false}
              maxSize={maxFileSize}
              maxFiles={1}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={isProcessing}
            />

            {/* Rotation options */}
            {pageCount > 0 && !isProcessing && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 space-y-6 shadow-glass animate-fade-in">
                {/* Page previews */}
                {previews.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-3">Page preview</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt={`Page ${index + 1}`}
                            className="h-24 w-auto rounded-lg border shadow-sm"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                      {pageCount > 6 && (
                        <div className="flex items-center justify-center h-24 px-4 text-sm text-[var(--muted-foreground)]">
                          +{pageCount - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rotation angle */}
                <div>
                  <p className="text-sm font-medium mb-3">Rotation angle</p>
                  <div className="flex gap-3">
                    {[
                      { value: 90, label: "90° Right", icon: RotateCw },
                      { value: 180, label: "180°", icon: RotateCw },
                      { value: 270, label: "90° Left", icon: RotateCcw },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setRotation(option.value as RotationAngle)}
                        className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                          rotation === option.value
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : "hover:bg-[var(--muted)]"
                        }`}
                      >
                        <option.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page selection */}
                <div>
                  <p className="text-sm font-medium mb-3">Pages to rotate</p>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 rounded-2xl border cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                      <input
                        type="radio"
                        checked={rotateAll}
                        onChange={() => setRotateAll(true)}
                        className="h-4 w-4 text-indigo-500 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="text-sm font-medium">All pages</span>
                        <p className="text-xs text-[var(--muted-foreground)]">Rotate all {pageCount} pages</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-2xl border cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                      <input
                        type="radio"
                        checked={!rotateAll}
                        onChange={() => setRotateAll(false)}
                        className="h-4 w-4 text-indigo-500 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">Specific pages</span>
                        <p className="text-xs text-[var(--muted-foreground)]">Choose which pages to rotate</p>
                      </div>
                    </label>

                    {!rotateAll && (
                      <div className="pl-7 animate-fade-in">
                        <input
                          type="text"
                          value={selectedPages}
                          onChange={(e) => setSelectedPages(e.target.value)}
                          placeholder="e.g., 1, 3, 5-7"
                          className="w-full rounded-2xl border bg-[var(--background)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                          Use commas to separate pages, dashes for ranges
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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
                  onClick={rotatePDF}
                  disabled={files.length === 0 || isProcessing || (!rotateAll && !selectedPages)}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 px-8 py-4 font-medium text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <RotateCw className="h-5 w-5" />
                  Rotate PDF
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Rotated PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                    setPageCount(0);
                    setPreviews([]);
                    setSelectedPages("");
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Rotate Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
