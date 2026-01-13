"use client";

import { useState, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Hash, Sparkles, Crown, Lock, FileArchive } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import JSZip from "jszip";
import { trackFileProcessed } from "@/lib/analytics";

type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type NumberFormat = "number" | "page-n" | "n-of-total" | "page-n-of-total" | "roman" | "roman-page";
type FontOption = "Helvetica" | "TimesRoman" | "Courier";

interface ProcessedFile {
  name: string;
  url: string;
  blob: Blob;
}

export default function PageNumbers() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Options
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState<NumberFormat>("number");
  const [fontSize, setFontSize] = useState(12);
  const [startNumber, setStartNumber] = useState(1);
  const [margin, setMargin] = useState(30);

  // Pro options
  const [fontOption, setFontOption] = useState<FontOption>("Helvetica");
  const [textColor, setTextColor] = useState("#4d4d4d"); // Default gray

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const maxFiles = isPro ? 20 : 1;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      const filesToAdd = newFiles.slice(0, maxFiles);
      setFiles((prev) => {
        const combined = [...prev, ...filesToAdd];
        return combined.slice(0, maxFiles);
      });
      setResultUrl(null);
      setProcessedFiles([]);
      setError(null);
    }
  }, [maxFiles]);

  const handleRemoveFile = useCallback((index?: number) => {
    if (index !== undefined) {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setFiles([]);
    }
    setResultUrl(null);
    setProcessedFiles([]);
  }, []);

  // Convert to Roman numerals
  const toRoman = (num: number): string => {
    const romanNumerals: [number, string][] = [
      [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
      [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
    ];
    let result = "";
    for (const [value, symbol] of romanNumerals) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  };

  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0.3, g: 0.3, b: 0.3 };
  };

  const formatPageNumber = (pageNum: number, totalPages: number): string => {
    switch (format) {
      case "number":
        return `${pageNum}`;
      case "page-n":
        return `Page ${pageNum}`;
      case "n-of-total":
        return `${pageNum} of ${totalPages}`;
      case "page-n-of-total":
        return `Page ${pageNum} of ${totalPages}`;
      case "roman":
        return toRoman(pageNum);
      case "roman-page":
        return `Page ${toRoman(pageNum)}`;
      default:
        return `${pageNum}`;
    }
  };

  // Get the correct StandardFont
  const getFont = (option: FontOption) => {
    switch (option) {
      case "TimesRoman":
        return StandardFonts.TimesRoman;
      case "Courier":
        return StandardFonts.Courier;
      default:
        return StandardFonts.Helvetica;
    }
  };

  const processFile = async (
    file: File,
    fileIndex: number,
    totalFiles: number
  ): Promise<ProcessedFile> => {
    const baseProgress = (fileIndex / totalFiles) * 100;
    const progressPerFile = 100 / totalFiles;

    setStatus(`Processing ${file.name}...`);
    setProgress(baseProgress + progressPerFile * 0.1);

    const fileBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    const font = await pdf.embedFont(getFont(fontOption));
    const color = hexToRgb(textColor);

    const pages = pdf.getPages();
    const totalPages = pages.length;

    for (let i = 0; i < totalPages; i++) {
      setProgress(baseProgress + progressPerFile * (0.1 + ((i + 1) / totalPages) * 0.8));
      setStatus(`${file.name}: Page ${i + 1} of ${totalPages}`);

      const page = pages[i];
      const { width, height } = page.getSize();
      const pageNumber = startNumber + i;
      const text = formatPageNumber(pageNumber, totalPages + startNumber - 1);
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      let x: number;
      let y: number;

      // Calculate X position
      if (position.includes("left")) {
        x = margin;
      } else if (position.includes("right")) {
        x = width - textWidth - margin;
      } else {
        x = (width - textWidth) / 2;
      }

      // Calculate Y position
      if (position.includes("top")) {
        y = height - margin - fontSize;
      } else {
        y = margin;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
      });
    }

    setProgress(baseProgress + progressPerFile * 0.95);

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Track analytics
    trackFileProcessed("page-numbers", file.size);

    const originalName = file.name.replace(/\.pdf$/i, "");
    return {
      name: `${originalName}_numbered.pdf`,
      url,
      blob,
    };
  };

  const addPageNumbers = async () => {
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
    setProcessedFiles([]);

    try {
      const results: ProcessedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const result = await processFile(files[i], i, files.length);
        results.push(result);
      }

      setProcessedFiles(results);

      // For single file, set resultUrl for backward compatibility
      if (results.length === 1) {
        setResultUrl(results[0].url);
      }

      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Page numbers error:", err);
      setError("Failed to add page numbers. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = (url?: string, filename?: string) => {
    const downloadUrl = url || resultUrl;
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || `${files[0]?.name?.replace(/\.pdf$/i, "") || "document"}_numbered.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (processedFiles.length === 0) return;

    setStatus("Creating ZIP archive...");
    const zip = new JSZip();

    for (const file of processedFiles) {
      zip.file(file.name, file.blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "numbered_pdfs.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const positions: { value: Position; label: string }[] = [
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  const formats: { value: NumberFormat; label: string; example: string; proOnly?: boolean }[] = [
    { value: "number", label: "Number only", example: "1, 2, 3..." },
    { value: "page-n", label: "Page N", example: "Page 1, Page 2..." },
    { value: "n-of-total", label: "N of Total", example: "1 of 10, 2 of 10..." },
    { value: "page-n-of-total", label: "Page N of Total", example: "Page 1 of 10..." },
    { value: "roman", label: "Roman Numerals", example: "I, II, III...", proOnly: true },
    { value: "roman-page", label: "Page Roman", example: "Page I, Page II...", proOnly: true },
  ];

  const fontOptions: { value: FontOption; label: string; proOnly?: boolean }[] = [
    { value: "Helvetica", label: "Helvetica" },
    { value: "TimesRoman", label: "Times Roman", proOnly: true },
    { value: "Courier", label: "Courier", proOnly: true },
  ];

  const colorPresets = [
    { value: "#4d4d4d", label: "Gray" },
    { value: "#000000", label: "Black" },
    { value: "#1e40af", label: "Blue" },
    { value: "#b91c1c", label: "Red" },
    { value: "#15803d", label: "Green" },
  ];

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
                <Hash className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Page Numbers
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Add professional page numbering to your PDF
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

          {/* Batch mode indicator */}
          {isPro && (
            <div className="mt-6 flex justify-center animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20">
                <FileArchive className="h-4 w-4 text-violet-400" />
                <span className="text-sm text-violet-400">Batch mode: Process up to 20 PDFs at once</span>
              </div>
            </div>
          )}

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

            {/* Options */}
            {files.length > 0 && !resultUrl && processedFiles.length === 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in space-y-6">
                <h3 className="text-lg font-semibold">Numbering Options</h3>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">
                    Position
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {positions.map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => setPosition(pos.value)}
                        className={`px-4 py-2.5 text-sm rounded-xl border transition-all ${
                          position === pos.value
                            ? "border-violet-500 bg-violet-500/10 text-violet-400"
                            : "border-[var(--border)] hover:border-violet-500/50 hover:bg-[var(--muted)]"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">
                    Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {formats.map((fmt) => {
                      const isLocked = fmt.proOnly && !isPro;
                      return (
                        <button
                          key={fmt.value}
                          onClick={() => !isLocked && setFormat(fmt.value)}
                          disabled={isLocked}
                          className={`relative px-4 py-3 text-sm rounded-xl border transition-all text-left ${
                            format === fmt.value
                              ? "border-violet-500 bg-violet-500/10"
                              : isLocked
                              ? "border-[var(--border)] opacity-60 cursor-not-allowed"
                              : "border-[var(--border)] hover:border-violet-500/50 hover:bg-[var(--muted)]"
                          }`}
                        >
                          {isLocked && <Lock className="h-3 w-3 absolute top-2 right-2 text-[var(--muted-foreground)]" />}
                          <span className={format === fmt.value ? "text-violet-400" : ""}>{fmt.label}</span>
                          <span className="block text-xs text-[var(--muted-foreground)] mt-0.5">{fmt.example}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Size and Start Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      Font Size: {fontSize}pt
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      Start from
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={startNumber}
                      onChange={(e) => setStartNumber(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-violet-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Margin */}
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                    Margin from edge: {margin}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>

                {/* Pro Options Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border)]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="flex items-center gap-2 px-3 bg-[var(--card)] text-sm text-[var(--muted-foreground)]">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Pro Styling Options
                    </span>
                  </div>
                </div>

                {/* Font Selection (Pro) */}
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">
                    Font
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {fontOptions.map((font) => {
                      const isLocked = font.proOnly && !isPro;
                      return (
                        <button
                          key={font.value}
                          onClick={() => !isLocked && setFontOption(font.value)}
                          disabled={isLocked}
                          className={`relative px-4 py-2.5 text-sm rounded-xl border transition-all ${
                            fontOption === font.value
                              ? "border-violet-500 bg-violet-500/10 text-violet-400"
                              : isLocked
                              ? "border-[var(--border)] opacity-60 cursor-not-allowed"
                              : "border-[var(--border)] hover:border-violet-500/50 hover:bg-[var(--muted)]"
                          }`}
                        >
                          {isLocked && <Lock className="h-3 w-3 absolute top-1 right-1 text-[var(--muted-foreground)]" />}
                          <span style={{ fontFamily: font.value === "TimesRoman" ? "Times New Roman, serif" : font.value === "Courier" ? "Courier New, monospace" : "Helvetica, sans-serif" }}>
                            {font.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selection (Pro) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] mb-3">
                    Text Color
                    {!isPro && <Lock className="h-3 w-3" />}
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => isPro && setTextColor(color.value)}
                        disabled={!isPro}
                        className={`relative w-10 h-10 rounded-xl border-2 transition-all ${
                          textColor === color.value
                            ? "border-violet-500 scale-110"
                            : !isPro
                            ? "border-[var(--border)] opacity-60 cursor-not-allowed"
                            : "border-[var(--border)] hover:border-violet-500/50"
                        }`}
                        title={color.label}
                      >
                        <div
                          className="absolute inset-1 rounded-lg"
                          style={{ backgroundColor: color.value }}
                        />
                      </button>
                    ))}
                    {isPro && (
                      <label className="relative cursor-pointer">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center hover:border-violet-500/50 transition-colors">
                          <span className="text-xs">+</span>
                        </div>
                      </label>
                    )}
                    <div
                      className="ml-2 px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: textColor, color: textColor === "#000000" ? "#fff" : "#fff" }}
                    >
                      Preview
                    </div>
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

            {/* Success result - Single file */}
            {resultUrl && processedFiles.length === 1 && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 mb-4">
                    <Hash className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Page Numbers Added!</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Your numbered PDF is ready to download
                  </p>
                </div>
              </div>
            )}

            {/* Success result - Multiple files (Batch) */}
            {processedFiles.length > 1 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 mb-4">
                    <Hash className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {processedFiles.length} PDFs Numbered!
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Download individually or all at once
                  </p>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {processedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)]/80 transition-colors"
                    >
                      <span className="text-sm truncate flex-1 mr-4">{file.name}</span>
                      <button
                        onClick={() => downloadResult(file.url, file.name)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-sm hover:bg-violet-500/20 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {processedFiles.length === 0 ? (
                <button
                  onClick={addPageNumbers}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-8 py-4 font-medium text-white shadow-lg shadow-violet-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Hash className="h-5 w-5" />
                  Add Page Numbers
                </button>
              ) : processedFiles.length === 1 ? (
                <button
                  onClick={() => downloadResult()}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Numbered PDF
                </button>
              ) : (
                <button
                  onClick={downloadAllAsZip}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <FileArchive className="h-5 w-5" />
                  Download All as ZIP
                </button>
              )}

              {processedFiles.length > 0 && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProcessedFiles([]);
                    setProgress(0);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Number More PDFs
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
