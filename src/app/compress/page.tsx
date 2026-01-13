"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, FileDown, ArrowRight, Sparkles, TrendingDown, Crown, Package, Check, Loader2, Settings2, Lock } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

type CompressionLevel = "low" | "medium" | "high" | "extreme";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDFLib = any;

interface ProcessedFile {
  name: string;
  originalSize: number;
  compressedSize: number;
  blob: Blob;
  url: string;
}

const compressionLevels = [
  { value: "low", label: "Low", description: "Minimal compression, best quality", reduction: "5-15%", proOnly: false },
  { value: "medium", label: "Medium", description: "Balanced quality and size", reduction: "15-30%", proOnly: false },
  { value: "high", label: "High", description: "Smaller files, good quality", reduction: "30-50%", proOnly: true },
  { value: "extreme", label: "Extreme", description: "Maximum compression", reduction: "50-70%", proOnly: true },
];

export default function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("medium");
  const pdfjsRef = useRef<PDFLib | null>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  // Pro users can batch process up to 20 files
  const maxFiles = isPro ? 20 : 1;

  // Load PDF.js dynamically for advanced compression
  useEffect(() => {
    const loadPdfJs = async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      pdfjsRef.current = pdfjs;
    };
    loadPdfJs();
  }, []);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles(prev => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, maxFiles);
      });
      setProcessedFiles([]);
      setError(null);
    }
  }, [maxFiles]);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setProcessedFiles([]);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Get compression settings based on level
  const getCompressionSettings = (level: CompressionLevel) => {
    switch (level) {
      case "low":
        return { scale: 2, quality: 0.95, useCanvas: false };
      case "medium":
        return { scale: 1.5, quality: 0.85, useCanvas: false };
      case "high":
        return { scale: 1.2, quality: 0.7, useCanvas: true };
      case "extreme":
        return { scale: 1, quality: 0.5, useCanvas: true };
    }
  };

  const compressSinglePDF = async (file: File): Promise<ProcessedFile> => {
    const fileBuffer = await file.arrayBuffer();
    const settings = getCompressionSettings(compressionLevel);

    // For high/extreme compression with canvas rendering
    if (settings.useCanvas && pdfjsRef.current) {
      try {
        const sourcePdf = await pdfjsRef.current.getDocument({ data: fileBuffer }).promise;
        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= sourcePdf.numPages; i++) {
          const page = await sourcePdf.getPage(i);
          const viewport = page.getViewport({ scale: settings.scale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Could not create canvas context");

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          // Convert to JPEG for better compression
          const imageData = canvas.toDataURL("image/jpeg", settings.quality);
          const imageBytes = await fetch(imageData).then(r => r.arrayBuffer());

          const image = await newPdf.embedJpg(new Uint8Array(imageBytes));
          const newPage = newPdf.addPage([viewport.width, viewport.height]);
          newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
          });
        }

        // Remove metadata
        newPdf.setTitle("");
        newPdf.setAuthor("");
        newPdf.setSubject("");
        newPdf.setKeywords([]);
        newPdf.setProducer("");
        newPdf.setCreator("");

        const compressedBytes = await newPdf.save({
          useObjectStreams: true,
        });

        const blob = new Blob([new Uint8Array(compressedBytes)], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        return {
          name: file.name,
          originalSize: file.size,
          compressedSize: compressedBytes.length,
          blob,
          url,
        };
      } catch (err) {
        console.warn("Canvas compression failed, falling back to standard:", err);
        // Fall through to standard compression
      }
    }

    // Standard compression (low/medium or fallback)
    const pdf = await PDFDocument.load(fileBuffer, {
      ignoreEncryption: true,
    });

    // Remove metadata
    pdf.setTitle("");
    pdf.setAuthor("");
    pdf.setSubject("");
    pdf.setKeywords([]);
    pdf.setProducer("");
    pdf.setCreator("");

    const compressedBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const blob = new Blob([new Uint8Array(compressedBytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      name: file.name,
      originalSize: file.size,
      compressedSize: compressedBytes.length,
      blob,
      url,
    };
  };

  const compressPDFs = async () => {
    if (files.length === 0) {
      setError("Please select at least one PDF file");
      return;
    }

    if (!canProcess) {
      setError("Daily limit reached. Upgrade to Pro for unlimited processing.");
      return;
    }

    // Check if trying to use Pro-only compression level
    const selectedLevel = compressionLevels.find(l => l.value === compressionLevel);
    if (selectedLevel?.proOnly && !isPro) {
      setError("High and Extreme compression levels require Pro. Upgrade to access.");
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
        setStatus(`Compressing ${files[i].name} (${i + 1}/${files.length})...`);

        const baseProgress = (i / files.length) * 100;
        setProgress(baseProgress + 10);

        try {
          const result = await compressSinglePDF(files[i]);
          results.push(result);
          setProgress(baseProgress + 90);
        } catch (err) {
          console.error(`Error compressing ${files[i].name}:`, err);
        }
      }

      setProcessedFiles(results);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Batch compress error:", err);
      setError("Failed to compress PDFs. Please ensure all files are valid PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingleFile = (processed: ProcessedFile) => {
    const link = document.createElement("a");
    link.href = processed.url;
    link.download = `compressed_${processed.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (processedFiles.length === 0) return;

    const zip = new JSZip();

    for (const file of processedFiles) {
      zip.file(`compressed_${file.name}`, file.blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "compressed_pdfs.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalOriginalSize = processedFiles.reduce((sum, f) => sum + f.originalSize, 0);
  const totalCompressedSize = processedFiles.reduce((sum, f) => sum + f.compressedSize, 0);
  const totalReduction = totalOriginalSize > 0
    ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1)
    : "0";

  const resetAll = () => {
    setFiles([]);
    setProcessedFiles([]);
    setProgress(0);
    setError(null);
    setCurrentFileIndex(0);
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-amber-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg">
                <FileDown className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Compress PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Lighter files, same beautiful content
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
                    Upgrade for batch + advanced compression
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

            {/* Compression Options */}
            {files.length > 0 && !isProcessing && processedFiles.length === 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 space-y-5 shadow-glass animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10">
                    <Settings2 className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Compression Level</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Choose how much to compress your PDF{files.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {compressionLevels.map((level) => {
                    const isLocked = level.proOnly && !isPro;
                    return (
                      <button
                        key={level.value}
                        onClick={() => !isLocked && setCompressionLevel(level.value as CompressionLevel)}
                        disabled={isLocked}
                        className={`relative p-4 rounded-2xl border text-left transition-all ${
                          compressionLevel === level.value && !isLocked
                            ? "border-orange-500 bg-orange-500/10"
                            : isLocked
                            ? "border-[var(--border)] bg-[var(--muted)]/50 opacity-60 cursor-not-allowed"
                            : "border-[var(--border)] hover:border-orange-500/50 hover:bg-[var(--muted)]/50"
                        }`}
                      >
                        {isLocked && (
                          <div className="absolute top-2 right-2">
                            <Lock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                          </div>
                        )}
                        <p className={`text-sm font-medium ${compressionLevel === level.value && !isLocked ? "text-orange-500" : ""}`}>
                          {level.label}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {level.description}
                        </p>
                        <p className={`text-xs mt-2 font-medium ${compressionLevel === level.value && !isLocked ? "text-orange-500" : "text-[var(--muted-foreground)]"}`}>
                          ~{level.reduction}
                        </p>
                        {isLocked && (
                          <p className="text-xs text-amber-500 mt-1 font-medium">Pro only</p>
                        )}
                      </button>
                    );
                  })}
                </div>

                {(compressionLevel === "high" || compressionLevel === "extreme") && isPro && (
                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 animate-fade-in">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      <strong>Note:</strong> {compressionLevel === "extreme" ? "Extreme" : "High"} compression converts pages to images for maximum reduction. Text may not be selectable in the output.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Batch indicator for Pro users */}
            {isPro && files.length > 1 && !isProcessing && processedFiles.length === 0 && (
              <div className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-500">Batch Processing Mode</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {files.length} files will be compressed and packaged into a ZIP
                    </p>
                  </div>
                </div>
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
                <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-[var(--muted-foreground)] mb-1">Total Original</p>
                      <p className="text-2xl font-semibold">{formatFileSize(totalOriginalSize)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-[var(--muted-foreground)]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[var(--muted-foreground)] mb-1">Total Compressed</p>
                      <p className="text-2xl font-semibold text-orange-500">{formatFileSize(totalCompressedSize)}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-center">
                    {Number(totalReduction) > 0 ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm font-medium">Total reduced by {totalReduction}%</span>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Files are already optimized
                      </p>
                    )}
                  </div>
                </div>

                {/* Individual files table */}
                {processedFiles.length > 1 && (
                  <div className="rounded-3xl border bg-[var(--card)] overflow-hidden shadow-glass">
                    <div className="p-4 border-b border-[var(--border)]">
                      <h3 className="font-semibold">Processed Files</h3>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {processedFiles.map((file, index) => {
                        const reduction = ((file.originalSize - file.compressedSize) / file.originalSize * 100).toFixed(1);
                        return (
                          <div key={index} className="flex items-center justify-between p-4 hover:bg-[var(--muted)]/50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Check className="h-4 w-4 text-emerald-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-[var(--muted-foreground)]">
                                  {formatFileSize(file.originalSize)} → {formatFileSize(file.compressedSize)}
                                  <span className="text-orange-500 ml-2">(-{reduction}%)</span>
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
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {processedFiles.length === 0 ? (
                <button
                  onClick={compressPDFs}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-8 py-4 font-medium text-white shadow-lg shadow-orange-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <FileDown className="h-5 w-5" />
                  )}
                  {files.length > 1 ? `Compress ${files.length} PDFs` : "Compress PDF"}
                </button>
              ) : (
                <>
                  {processedFiles.length === 1 ? (
                    <button
                      onClick={() => downloadSingleFile(processedFiles[0])}
                      className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                    >
                      <Download className="h-5 w-5" />
                      Download Compressed PDF
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
                  Compress More PDFs
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
