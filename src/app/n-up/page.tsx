"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Grid, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

type NUpLayout = "2" | "4" | "6" | "9";

export default function NUpPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<NUpLayout>("2");

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

  const getLayoutConfig = (layout: NUpLayout) => {
    switch (layout) {
      case "2": return { cols: 2, rows: 1 };
      case "4": return { cols: 2, rows: 2 };
      case "6": return { cols: 3, rows: 2 };
      case "9": return { cols: 3, rows: 3 };
    }
  };

  const processNUp = async () => {
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

      const { cols, rows } = getLayoutConfig(layout);
      const pagesPerSheet = cols * rows;
      const scale = 1.5;

      const newPdf = await PDFDocument.create();
      const outputWidth = 612; // Letter width
      const outputHeight = 792; // Letter height

      const cellWidth = outputWidth / cols;
      const cellHeight = outputHeight / rows;

      for (let sheetStart = 0; sheetStart < totalPages; sheetStart += pagesPerSheet) {
        setStatus(`Creating sheet ${Math.floor(sheetStart / pagesPerSheet) + 1}...`);
        setProgress(10 + ((sheetStart / totalPages) * 80));

        // Create canvas for the combined page
        const canvas = document.createElement("canvas");
        canvas.width = outputWidth * scale;
        canvas.height = outputHeight * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < pagesPerSheet; i++) {
          const pageNum = sheetStart + i + 1;
          if (pageNum > totalPages) break;

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });

          // Calculate position in grid
          const col = i % cols;
          const row = Math.floor(i / cols);

          // Calculate scale to fit in cell
          const scaleX = (cellWidth * scale) / viewport.width;
          const scaleY = (cellHeight * scale) / viewport.height;
          const fitScale = Math.min(scaleX, scaleY) * 0.95;

          // Create temp canvas for this page
          const tempCanvas = document.createElement("canvas");
          const scaledViewport = page.getViewport({ scale: fitScale });
          tempCanvas.width = scaledViewport.width;
          tempCanvas.height = scaledViewport.height;
          const tempCtx = tempCanvas.getContext("2d")!;
          tempCtx.fillStyle = "white";
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

          await page.render({
            canvasContext: tempCtx,
            viewport: scaledViewport,
            canvas: tempCanvas,
          }).promise;

          // Calculate centered position in cell
          const cellX = col * cellWidth * scale;
          const cellY = row * cellHeight * scale;
          const offsetX = (cellWidth * scale - tempCanvas.width) / 2;
          const offsetY = (cellHeight * scale - tempCanvas.height) / 2;

          ctx.drawImage(tempCanvas, cellX + offsetX, cellY + offsetY);
        }

        // Add to PDF
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const imageBytes = await fetch(imageDataUrl).then(res => res.arrayBuffer());
        const image = await newPdf.embedJpg(imageBytes);

        const newPage = newPdf.addPage([outputWidth, outputHeight]);
        newPage.drawImage(image, {
          x: 0,
          y: 0,
          width: outputWidth,
          height: outputHeight,
        });
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
      console.error("N-Up error:", err);
      setError("Failed to create N-Up layout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_${layout}up.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <Grid className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">N-Up Layout</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Combine multiple pages on a single sheet</p>
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
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Pages per sheet</label>
                <div className="grid grid-cols-4 gap-3">
                  {(["2", "4", "6", "9"] as NUpLayout[]).map((n) => (
                    <button
                      key={n}
                      onClick={() => setLayout(n)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        layout === n
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                      }`}
                    >
                      <div className="text-2xl font-bold">{n}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">per page</div>
                    </button>
                  ))}
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-4">
                  <Grid className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Layout Complete!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{layout} pages combined per sheet</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={processNUp}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Grid className="h-5 w-5" />
                  Create N-Up Layout
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
