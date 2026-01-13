"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Expand, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

export default function PosterPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posterSize, setPosterSize] = useState<"2x2" | "3x3" | "4x4">("2x2");

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

  const createPoster = async () => {
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

      const gridSize = parseInt(posterSize.split("x")[0]);
      const newPdf = await PDFDocument.create();

      // Only process first page for poster
      const page = await pdf.getPage(1);
      const baseScale = 2;
      const viewport = page.getViewport({ scale: baseScale * gridSize });

      setStatus("Rendering high-resolution page...");
      setProgress(30);

      // Render full page at high resolution
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise;

      setStatus("Creating poster pages...");
      setProgress(50);

      // Split into grid
      const tileWidth = viewport.width / gridSize;
      const tileHeight = viewport.height / gridSize;
      const outputPageWidth = 612; // Letter width in points
      const outputPageHeight = 792; // Letter height in points

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          setProgress(50 + (((row * gridSize + col) / (gridSize * gridSize)) * 40));

          const tileCanvas = document.createElement("canvas");
          const tileContext = tileCanvas.getContext("2d")!;
          tileCanvas.width = tileWidth;
          tileCanvas.height = tileHeight;

          // Extract tile (in correct reading order: top-left to bottom-right)
          tileContext.drawImage(
            canvas,
            col * tileWidth,
            row * tileHeight,
            tileWidth,
            tileHeight,
            0,
            0,
            tileWidth,
            tileHeight
          );

          const imageDataUrl = tileCanvas.toDataURL("image/jpeg", 0.95);
          const imageBytes = await fetch(imageDataUrl).then(res => res.arrayBuffer());
          const image = await newPdf.embedJpg(imageBytes);

          const newPage = newPdf.addPage([outputPageWidth, outputPageHeight]);
          newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: outputPageWidth,
            height: outputPageHeight,
          });
        }
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
      console.error("Poster error:", err);
      setError("Failed to create poster. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_poster_${posterSize}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sizeOptions = [
    { value: "2x2" as const, label: "2×2 (4 pages)", desc: "Good for A3 posters" },
    { value: "3x3" as const, label: "3×3 (9 pages)", desc: "Good for A2 posters" },
    { value: "4x4" as const, label: "4×4 (16 pages)", desc: "Good for A1 posters" },
  ];

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-sky-500/20 to-blue-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-blue-500 shadow-lg">
                <Expand className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Create Poster</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Split a page across multiple sheets for large prints</p>
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
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Poster Size</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPosterSize(option.value)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        posterSize === option.value
                          ? "bg-sky-500 text-white"
                          : "bg-[var(--muted)] hover:bg-[var(--border)]"
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className={`text-sm ${posterSize === option.value ? "text-sky-100" : "text-[var(--muted-foreground)]"}`}>
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-[var(--muted-foreground)] text-center mt-4">
                  Print all pages and tape them together to create your poster
                </p>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 mb-4">
                  <Expand className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Poster Created!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {parseInt(posterSize.split("x")[0]) ** 2} pages ready for printing
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={createPoster}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Expand className="h-5 w-5" />
                  Create Poster
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
