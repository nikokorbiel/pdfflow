"use client";

import { useState, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Hash, Sparkles } from "lucide-react";
import {
  getRemainingUsage,
  incrementUsage,
  getMaxFileSize,
} from "@/lib/usage";
import Link from "next/link";

type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type NumberFormat = "number" | "page-n" | "n-of-total" | "page-n-of-total";

export default function PageNumbers() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Options
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState<NumberFormat>("number");
  const [fontSize, setFontSize] = useState(12);
  const [startNumber, setStartNumber] = useState(1);
  const [margin, setMargin] = useState(30);

  const remainingUsage = typeof window !== "undefined" ? getRemainingUsage() : 2;

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
      default:
        return `${pageNum}`;
    }
  };

  const addPageNumbers = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
      return;
    }

    if (remainingUsage <= 0) {
      setError("Daily limit reached. Upgrade to Pro for unlimited processing.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setStatus("Loading PDF...");
      setProgress(10);

      const fileBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.Helvetica);

      const pages = pdf.getPages();
      const totalPages = pages.length;

      setStatus("Adding page numbers...");

      for (let i = 0; i < totalPages; i++) {
        setProgress(10 + ((i + 1) / totalPages) * 80);
        setStatus(`Processing page ${i + 1} of ${totalPages}...`);

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
          color: rgb(0.3, 0.3, 0.3),
        });
      }

      setStatus("Saving PDF...");
      setProgress(95);

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      incrementUsage();
    } catch (err) {
      console.error("Page numbers error:", err);
      setError("Failed to add page numbers. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_numbered.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const positions: { value: Position; label: string }[] = [
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  const formats: { value: NumberFormat; label: string; example: string }[] = [
    { value: "number", label: "Number only", example: "1, 2, 3..." },
    { value: "page-n", label: "Page N", example: "Page 1, Page 2..." },
    { value: "n-of-total", label: "N of Total", example: "1 of 10, 2 of 10..." },
    { value: "page-n-of-total", label: "Page N of Total", example: "Page 1 of 10..." },
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
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-sm text-[var(--muted-foreground)]">
                  {remainingUsage} of 2 free uses today
                </span>
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <Link
                href="/pricing"
                className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
              >
                Upgrade
              </Link>
            </div>
          </div>

          {/* Main content */}
          <div className="mt-12 space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <FileDropzone
              onFilesSelected={handleFilesSelected}
              accept=".pdf,application/pdf"
              multiple={false}
              maxSize={getMaxFileSize()}
              maxFiles={1}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={isProcessing}
            />

            {/* Options */}
            {files.length > 0 && !resultUrl && (
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
                    {formats.map((fmt) => (
                      <button
                        key={fmt.value}
                        onClick={() => setFormat(fmt.value)}
                        className={`px-4 py-3 text-sm rounded-xl border transition-all text-left ${
                          format === fmt.value
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-[var(--border)] hover:border-violet-500/50 hover:bg-[var(--muted)]"
                        }`}
                      >
                        <span className={format === fmt.value ? "text-violet-400" : ""}>{fmt.label}</span>
                        <span className="block text-xs text-[var(--muted-foreground)] mt-0.5">{fmt.example}</span>
                      </button>
                    ))}
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

            {/* Success result */}
            {resultUrl && (
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={addPageNumbers}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-8 py-4 font-medium text-white shadow-lg shadow-violet-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Hash className="h-5 w-5" />
                  Add Page Numbers
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Numbered PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Number Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
