"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Layers3, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

export default function OverlayPDFs() {
  const [baseFiles, setBaseFiles] = useState<File[]>([]);
  const [overlayFiles, setOverlayFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleBaseFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setBaseFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
    }
  }, []);

  const handleOverlayFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setOverlayFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
    }
  }, []);

  const overlayPDFs = async () => {
    if (baseFiles.length === 0 || overlayFiles.length === 0) {
      setError("Please select both base and overlay PDF files");
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
      setStatus("Loading PDFs...");
      setProgress(20);

      const [baseBuffer, overlayBuffer] = await Promise.all([
        baseFiles[0].arrayBuffer(),
        overlayFiles[0].arrayBuffer(),
      ]);

      const basePdf = await PDFDocument.load(baseBuffer);
      const overlayPdf = await PDFDocument.load(overlayBuffer);

      setStatus("Creating overlay...");
      setProgress(50);

      const basePages = basePdf.getPages();
      const overlayPages = overlayPdf.getPages();

      for (let i = 0; i < basePages.length; i++) {
        setProgress(50 + ((i / basePages.length) * 40));

        const overlayIndex = i % overlayPages.length;

        // Embed the overlay page as a form XObject
        const [embeddedPage] = await basePdf.embedPdf(overlayPdf, [overlayIndex]);

        const basePage = basePages[i];
        const { width: baseWidth, height: baseHeight } = basePage.getSize();

        // Draw the overlay centered on the base page
        basePage.drawPage(embeddedPage, {
          x: 0,
          y: 0,
          width: baseWidth,
          height: baseHeight,
          opacity: 0.5,
        });
      }

      setStatus("Saving PDF...");
      setProgress(95);

      const pdfBytes = await basePdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Overlay error:", err);
      setError("Failed to overlay PDFs. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = baseFiles[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_overlay.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-fuchsia-500/20 to-pink-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-lg">
                <Layers3 className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Overlay PDFs</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Layer one PDF on top of another</p>
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
            {!resultUrl && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">Base PDF (Background)</h3>
                  <FileDropzone
                    onFilesSelected={handleBaseFilesSelected}
                    accept=".pdf,application/pdf"
                    multiple={false}
                    maxSize={maxFileSize}
                    maxFiles={1}
                    files={baseFiles}
                    onRemoveFile={() => setBaseFiles([])}
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">Overlay PDF (On Top)</h3>
                  <FileDropzone
                    onFilesSelected={handleOverlayFilesSelected}
                    accept=".pdf,application/pdf"
                    multiple={false}
                    maxSize={maxFileSize}
                    maxFiles={1}
                    files={overlayFiles}
                    onRemoveFile={() => setOverlayFiles([])}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            )}

            {baseFiles.length > 0 && overlayFiles.length > 0 && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-fuchsia-500/10">
                    <Layers3 className="h-5 w-5 text-fuchsia-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Ready to Overlay</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      The overlay PDF will be placed on top of each page with 50% opacity
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 mb-4">
                  <Layers3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">PDFs Overlaid!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">The overlay has been applied to all pages</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={overlayPDFs}
                  disabled={baseFiles.length === 0 || overlayFiles.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Layers3 className="h-5 w-5" />
                  Overlay PDFs
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
                <button onClick={() => { setBaseFiles([]); setOverlayFiles([]); setResultUrl(null); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
