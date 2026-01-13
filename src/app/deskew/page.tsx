"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, RotateCw, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

export default function DeskewPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correctedPages, setCorrectedPages] = useState(0);

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
      setCorrectedPages(0);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setCorrectedPages(0);
  }, []);

  // Detect skew angle using edge detection heuristic
  const detectSkewAngle = (imageData: ImageData): number => {
    const { data, width, height } = imageData;

    // Convert to grayscale and detect edges
    const edges: { x: number; y: number }[] = [];
    const threshold = 50;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

        // Check horizontal gradient
        const leftIdx = (y * width + (x - 1)) * 4;
        const rightIdx = (y * width + (x + 1)) * 4;
        const left = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
        const right = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

        if (Math.abs(right - left) > threshold && current < 200) {
          edges.push({ x, y });
        }
      }
    }

    if (edges.length < 100) return 0;

    // Simple line detection using random sampling
    let bestAngle = 0;
    let bestScore = 0;

    for (let angle = -15; angle <= 15; angle += 0.5) {
      const rad = (angle * Math.PI) / 180;
      let score = 0;

      // Count edges that align with this angle
      const bins: Map<number, number> = new Map();

      for (const edge of edges) {
        const rotatedY = Math.round(edge.y * Math.cos(rad) - edge.x * Math.sin(rad));
        bins.set(rotatedY, (bins.get(rotatedY) || 0) + 1);
      }

      // Score is the max count in any bin
      bins.forEach((count) => {
        if (count > score) score = count;
      });

      if (score > bestScore) {
        bestScore = score;
        bestAngle = angle;
      }
    }

    return -bestAngle; // Return correction angle
  };

  const deskewPDF = async () => {
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
      const scale = 1.5;
      let corrected = 0;

      for (let i = 1; i <= totalPages; i++) {
        setStatus(`Analyzing page ${i} of ${totalPages}...`);
        setProgress(10 + ((i / totalPages) * 70));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        // Render page to canvas for analysis
        const analysisCanvas = document.createElement("canvas");
        const analysisContext = analysisCanvas.getContext("2d")!;
        analysisCanvas.width = viewport.width;
        analysisCanvas.height = viewport.height;

        await page.render({
          canvasContext: analysisContext,
          viewport: viewport,
          canvas: analysisCanvas,
        }).promise;

        const imageData = analysisContext.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
        const skewAngle = detectSkewAngle(imageData);

        // Create output canvas (possibly larger to accommodate rotation)
        const outputScale = 2;
        const outputViewport = page.getViewport({ scale: outputScale });
        const outputCanvas = document.createElement("canvas");
        const outputContext = outputCanvas.getContext("2d")!;

        if (Math.abs(skewAngle) > 0.5) {
          // Skew detected, apply correction
          corrected++;

          const rad = (skewAngle * Math.PI) / 180;
          const cos = Math.abs(Math.cos(rad));
          const sin = Math.abs(Math.sin(rad));

          // Calculate new dimensions
          const newWidth = outputViewport.width * cos + outputViewport.height * sin;
          const newHeight = outputViewport.width * sin + outputViewport.height * cos;

          outputCanvas.width = newWidth;
          outputCanvas.height = newHeight;

          // Fill with white
          outputContext.fillStyle = "white";
          outputContext.fillRect(0, 0, newWidth, newHeight);

          // Apply rotation
          outputContext.translate(newWidth / 2, newHeight / 2);
          outputContext.rotate(rad);
          outputContext.translate(-outputViewport.width / 2, -outputViewport.height / 2);

          await page.render({
            canvasContext: outputContext,
            viewport: outputViewport,
            canvas: outputCanvas,
          }).promise;
        } else {
          // No significant skew
          outputCanvas.width = outputViewport.width;
          outputCanvas.height = outputViewport.height;

          await page.render({
            canvasContext: outputContext,
            viewport: outputViewport,
            canvas: outputCanvas,
          }).promise;
        }

        // Embed in new PDF
        const imageDataUrl = outputCanvas.toDataURL("image/jpeg", 0.92);
        const imageBytes = await fetch(imageDataUrl).then(res => res.arrayBuffer());
        const image = await newPdf.embedJpg(imageBytes);

        const newPage = newPdf.addPage([outputCanvas.width / (outputScale / scale), outputCanvas.height / (outputScale / scale)]);
        newPage.drawImage(image, {
          x: 0,
          y: 0,
          width: newPage.getWidth(),
          height: newPage.getHeight(),
        });
      }

      setCorrectedPages(corrected);

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
      console.error("Deskew error:", err);
      setError("Failed to deskew PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_deskewed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-teal-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-500 shadow-lg">
                <RotateCw className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Deskew PDF</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Automatically straighten scanned pages</p>
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
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <div className="flex items-start gap-3">
                  <RotateCw className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">How It Works</h3>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Analyzes each page to detect skew angle from scanned documents and automatically straightens them for better readability.
                    </p>
                  </div>
                </div>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 mb-4">
                  <RotateCw className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Deskew Complete!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {correctedPages > 0
                    ? `Corrected ${correctedPages} page${correctedPages !== 1 ? "s" : ""}`
                    : "No significant skew detected"}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={deskewPDF}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <RotateCw className="h-5 w-5" />
                  Deskew PDF
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
                <button onClick={() => { setFiles([]); setResultUrl(null); setCorrectedPages(0); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
