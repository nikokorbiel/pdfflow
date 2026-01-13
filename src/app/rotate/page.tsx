"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import JSZip from "jszip";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, RotateCw, Sparkles, RotateCcw, Crown, Package, Check, Loader2 } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import { trackFileProcessed } from "@/lib/analytics";
import { addFreeTierBranding } from "@/lib/branding";

type RotationAngle = 90 | 180 | 270;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDFLib = any;

interface ProcessedFile {
  name: string;
  blob: Blob;
  url: string;
  pageCount: number;
}

export default function RotatePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<RotationAngle>(90);
  const [rotateAll, setRotateAll] = useState(true);
  const [selectedPages, setSelectedPages] = useState<string>("");
  const [previews, setPreviews] = useState<string[]>([]);
  const pdfjsRef = useRef<PDFLib | null>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  // Pro users have unlimited batch processing
  const maxFiles = isPro ? Infinity : 1;

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
      setFiles(prev => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, maxFiles);
      });
      setProcessedFiles([]);
      setError(null);
      setPreviews([]);

      // Only show previews for single file mode
      if (newFiles.length === 1 && files.length === 0) {
        try {
          const buffer = await newFiles[0].arrayBuffer();
          const pdf = await PDFDocument.load(buffer);
          setPageCount(pdf.getPageCount());
          generatePreviews(newFiles[0]);
        } catch {
          setError("Could not read PDF file");
        }
      } else {
        setPageCount(0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxFiles, files.length]);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        setPageCount(0);
        setPreviews([]);
      }
      return newFiles;
    });
    setProcessedFiles([]);
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

  const rotateSinglePDF = async (file: File): Promise<ProcessedFile> => {
    const fileBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBuffer);
    const pages = pdf.getPages();

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

    const pdfBytes = await pdf.save();

    // Add branding for free users
    const blob = await addFreeTierBranding(new Uint8Array(pdfBytes), isPro);
    const url = URL.createObjectURL(blob);

    // Track analytics
    trackFileProcessed("rotate", file.size);

    return {
      name: file.name,
      blob,
      url,
      pageCount: pages.length,
    };
  };

  const rotatePDFs = async () => {
    if (files.length === 0) {
      setError("Please select at least one PDF file");
      return;
    }

    if (!canProcess) {
      setError("Daily limit reached. Upgrade to Pro for unlimited processing.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setProcessedFiles([]);
    setCurrentFileIndex(0);

    const results: ProcessedFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i);
        setStatus(`Rotating ${files[i].name} (${i + 1}/${files.length})...`);

        const baseProgress = (i / files.length) * 100;
        setProgress(baseProgress + 10);

        try {
          const result = await rotateSinglePDF(files[i]);
          results.push(result);
          setProgress(baseProgress + 90);
        } catch (err) {
          console.error(`Error rotating ${files[i].name}:`, err);
        }
      }

      setProcessedFiles(results);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Batch rotate error:", err);
      setError("Failed to rotate PDFs. Please ensure all files are valid PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingleFile = (processed: ProcessedFile) => {
    const link = document.createElement("a");
    link.href = processed.url;
    link.download = `rotated_${processed.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (processedFiles.length === 0) return;

    const zip = new JSZip();

    for (const file of processedFiles) {
      zip.file(`rotated_${file.name}`, file.blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "rotated_pdfs.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFiles([]);
    setProcessedFiles([]);
    setProgress(0);
    setError(null);
    setCurrentFileIndex(0);
    setPageCount(0);
    setPreviews([]);
    setSelectedPages("");
  };

  const isBatchMode = files.length > 1;

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
              {isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <span className="text-sm text-amber-500 font-medium">
                    Batch: up to {maxFiles} files
                  </span>
                </>
              )}
              {!isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <Link
                    href="/pricing"
                    className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
                  >
                    Upgrade for batch processing
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
              multiple={isPro}
              maxSize={maxFileSize}
              maxFiles={maxFiles}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={isProcessing}
            />

            {/* Batch indicator for Pro users */}
            {isPro && isBatchMode && !isProcessing && processedFiles.length === 0 && (
              <div className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-500">Batch Processing Mode</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {files.length} files will be rotated with the same settings
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rotation options */}
            {files.length > 0 && !isProcessing && processedFiles.length === 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 space-y-6 shadow-glass animate-fade-in">
                {/* Page previews - only for single file */}
                {!isBatchMode && previews.length > 0 && (
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

                {/* Page selection - only for single file */}
                {!isBatchMode && pageCount > 0 && (
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
                )}

                {/* Batch mode note */}
                {isBatchMode && (
                  <div className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)]/50 rounded-2xl p-4">
                    <strong>Note:</strong> In batch mode, all pages in each PDF will be rotated.
                  </div>
                )}
              </div>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <ProgressBar progress={progress} status={status} />
                {files.length > 1 && (
                  <p className="mt-3 text-sm text-center text-[var(--muted-foreground)]">
                    Processing file {currentFileIndex + 1} of {files.length}
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 text-sm text-red-500 dark:text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            {/* Results */}
            {processedFiles.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                {/* Summary */}
                <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {processedFiles.length} PDF{processedFiles.length > 1 ? "s" : ""} rotated {rotation}°
                    </span>
                  </div>
                </div>

                {/* Individual files table */}
                {processedFiles.length > 1 && (
                  <div className="rounded-3xl border bg-[var(--card)] overflow-hidden shadow-glass">
                    <div className="p-4 border-b border-[var(--border)]">
                      <h3 className="font-semibold">Processed Files</h3>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {processedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 hover:bg-[var(--muted)]/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Check className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                {file.pageCount} pages rotated
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadSingleFile(file)}
                            className="flex-shrink-0 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4 text-[var(--muted-foreground)]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {processedFiles.length === 0 ? (
                <button
                  onClick={rotatePDFs}
                  disabled={files.length === 0 || isProcessing || (!isBatchMode && !rotateAll && !selectedPages)}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 px-8 py-4 font-medium text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <RotateCw className="h-5 w-5" />
                  )}
                  {files.length > 1 ? `Rotate ${files.length} PDFs` : "Rotate PDF"}
                </button>
              ) : (
                <>
                  {processedFiles.length === 1 ? (
                    <button
                      onClick={() => downloadSingleFile(processedFiles[0])}
                      className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                    >
                      <Download className="h-5 w-5" />
                      Download Rotated PDF
                    </button>
                  ) : (
                    <button
                      onClick={downloadAllAsZip}
                      className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                    >
                      <Package className="h-5 w-5" />
                      Download All as ZIP ({processedFiles.length} files)
                    </button>
                  )}
                </>
              )}

              {processedFiles.length > 0 && (
                <button
                  onClick={resetAll}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Rotate More PDFs
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
