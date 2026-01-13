"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, HardDrive, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import JSZip from "jszip";

export default function SplitBySize() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maxSizeMB, setMaxSizeMB] = useState(5);
  const [resultCount, setResultCount] = useState(0);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setResultCount(0);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setResultCount(0);
  }, []);

  const splitBySize = async () => {
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

      const fileBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const totalPages = pdfDoc.getPageCount();
      const maxBytes = maxSizeMB * 1024 * 1024;

      const splitPdfs: Uint8Array[] = [];
      let currentPdf = await PDFDocument.create();
      let currentPageIndex = 0;

      setStatus("Splitting by size...");

      while (currentPageIndex < totalPages) {
        setProgress(10 + ((currentPageIndex / totalPages) * 70));

        // Add page to current PDF
        const [page] = await currentPdf.copyPages(pdfDoc, [currentPageIndex]);
        currentPdf.addPage(page);

        // Check size
        const currentBytes = await currentPdf.save();

        if (currentBytes.length > maxBytes && currentPdf.getPageCount() > 1) {
          // Remove the last page and save
          const finalPdf = await PDFDocument.create();
          const pageCount = currentPdf.getPageCount() - 1;

          for (let i = 0; i < pageCount; i++) {
            const [p] = await finalPdf.copyPages(currentPdf, [i]);
            finalPdf.addPage(p);
          }

          splitPdfs.push(await finalPdf.save());

          // Start new PDF with the page that exceeded the limit
          currentPdf = await PDFDocument.create();
          const [newPage] = await currentPdf.copyPages(pdfDoc, [currentPageIndex]);
          currentPdf.addPage(newPage);
        }

        currentPageIndex++;
      }

      // Save remaining pages
      if (currentPdf.getPageCount() > 0) {
        splitPdfs.push(await currentPdf.save());
      }

      setResultCount(splitPdfs.length);

      setStatus("Creating ZIP...");
      setProgress(90);

      const zip = new JSZip();
      const baseName = files[0].name.replace(/\.pdf$/i, "");

      splitPdfs.forEach((pdfBytes, index) => {
        zip.file(`${baseName}_part${index + 1}.pdf`, pdfBytes);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Split error:", err);
      setError("Failed to split PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_split_by_size.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presets = [1, 2, 5, 10, 20, 50];

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
                <HardDrive className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Split by Size</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Split PDF into smaller files by file size</p>
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
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Maximum File Size (MB)</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {presets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setMaxSizeMB(preset)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          maxSizeMB === preset
                            ? "bg-sky-500 text-white"
                            : "bg-[var(--muted)] hover:bg-[var(--border)]"
                        }`}
                      >
                        {preset} MB
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={maxSizeMB}
                      onChange={(e) => setMaxSizeMB(parseInt(e.target.value))}
                      className="flex-1 accent-sky-500"
                    />
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={maxSizeMB}
                        onChange={(e) => setMaxSizeMB(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-center focus:border-sky-500 focus:outline-none"
                      />
                    </div>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 mb-4">
                  <HardDrive className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">PDF Split!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Created {resultCount} file{resultCount > 1 ? "s" : ""} (max {maxSizeMB}MB each)
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={splitBySize}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <HardDrive className="h-5 w-5" />
                  Split by Size
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download ZIP
                </button>
              )}
              {resultUrl && (
                <button onClick={() => { setFiles([]); setResultUrl(null); setResultCount(0); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
