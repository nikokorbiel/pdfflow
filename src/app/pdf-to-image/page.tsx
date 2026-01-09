"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Image as ImageIcon, Sparkles, Settings2 } from "lucide-react";
import {
  getRemainingUsage,
  incrementUsage,
  getMaxFileSize,
} from "@/lib/usage";
import Link from "next/link";

type ImageFormat = "png" | "jpeg";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDFLib = any;

export default function PDFToImage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrls, setResultUrls] = useState<{ name: string; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(2);
  const pdfjsRef = useRef<PDFLib | null>(null);

  const remainingUsage = typeof window !== "undefined" ? getRemainingUsage() : 2;

  // Load PDF.js dynamically on client side
  useEffect(() => {
    const loadPdfJs = async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      pdfjsRef.current = pdfjs;
    };
    loadPdfJs();
  }, []);

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrls([]);
      setError(null);

      if (!pdfjsRef.current) {
        setError("PDF library not loaded yet. Please try again.");
        return;
      }

      try {
        const buffer = await newFiles[0].arrayBuffer();
        const pdf = await pdfjsRef.current.getDocument({ data: buffer }).promise;
        setPageCount(pdf.numPages);
      } catch {
        setError("Could not read PDF file");
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrls([]);
    setPageCount(0);
  }, []);

  const convertToImages = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
      return;
    }

    if (!pdfjsRef.current) {
      setError("PDF library not loaded. Please refresh and try again.");
      return;
    }

    if (remainingUsage <= 0) {
      setError("Daily limit reached. Upgrade to Pro for unlimited processing.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResultUrls([]);

    try {
      setStatus("Loading PDF...");
      const buffer = await files[0].arrayBuffer();
      const pdf = await pdfjsRef.current.getDocument({ data: buffer }).promise;
      const results: { name: string; url: string }[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        setStatus(`Converting page ${i} of ${pdf.numPages}...`);
        setProgress((i / pdf.numPages) * 90);

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not create canvas context");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, format === "jpeg" ? quality : undefined);

        results.push({
          name: `page_${i}.${format}`,
          url: dataUrl,
        });
      }

      setResultUrls(results);
      setProgress(100);
      setStatus("Complete!");
      incrementUsage();
    } catch (err) {
      console.error("Conversion error:", err);
      setError("Failed to convert PDF. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = () => {
    resultUrls.forEach(({ name, url }) => {
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-violet-400/10 to-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-400 shadow-lg">
                <ImageIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              PDF to Image
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Transform pages into visual memories
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
            {pageCount > 0 && !isProcessing && resultUrls.length === 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 space-y-5 shadow-glass animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10">
                    <Settings2 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Conversion settings</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{pageCount} page{pageCount !== 1 ? "s" : ""} will be converted</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as ImageFormat)}
                      className="w-full rounded-2xl border bg-[var(--background)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    >
                      <option value="png">PNG</option>
                      <option value="jpeg">JPEG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Quality (DPI)</label>
                    <select
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="w-full rounded-2xl border bg-[var(--background)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    >
                      <option value={1}>Low (72 DPI)</option>
                      <option value={2}>Medium (144 DPI)</option>
                      <option value={3}>High (216 DPI)</option>
                    </select>
                  </div>

                  {format === "jpeg" && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-medium mb-2">
                        JPEG Quality: {Math.round(quality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full h-2 bg-[var(--muted)] rounded-full appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  )}
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

            {/* Results */}
            {resultUrls.length > 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 space-y-4 shadow-glass animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10">
                      <ImageIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    <span className="font-medium">{resultUrls.length} image{resultUrls.length > 1 ? "s" : ""} ready</span>
                  </div>
                  {resultUrls.length > 1 && (
                    <button
                      onClick={downloadAll}
                      className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
                    >
                      Download all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {resultUrls.map(({ name, url }, index) => (
                    <div
                      key={name}
                      className="relative group animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={name}
                        className="rounded-2xl border bg-white w-full aspect-[3/4] object-cover shadow-glass"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                        <a
                          href={url}
                          download={name}
                          className="rounded-xl bg-white p-3 hover:bg-gray-100 transition-colors shadow-lg"
                        >
                          <Download className="h-5 w-5 text-gray-800" />
                        </a>
                      </div>
                      <p className="mt-2 text-xs text-center text-[var(--muted-foreground)] truncate">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {resultUrls.length === 0 ? (
                <button
                  onClick={convertToImages}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 px-8 py-4 font-medium text-white shadow-lg shadow-purple-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <ImageIcon className="h-5 w-5" />
                  Convert to Images
                </button>
              ) : (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrls([]);
                    setProgress(0);
                    setPageCount(0);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Convert Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
