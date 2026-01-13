"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Shuffle, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

export default function InterleavePDFs() {
  const [files1, setFiles1] = useState<File[]>([]);
  const [files2, setFiles2] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pages1, setPages1] = useState(0);
  const [pages2, setPages2] = useState(0);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFiles1Selected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles1([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      try {
        const fileBuffer = await newFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);
        setPages1(pdfDoc.getPageCount());
      } catch {
        setError("Failed to read first PDF");
      }
    }
  }, []);

  const handleFiles2Selected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles2([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      try {
        const fileBuffer = await newFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);
        setPages2(pdfDoc.getPageCount());
      } catch {
        setError("Failed to read second PDF");
      }
    }
  }, []);

  const interleavePDFs = async () => {
    if (files1.length === 0 || files2.length === 0) {
      setError("Please select two PDF files");
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

      const [buffer1, buffer2] = await Promise.all([
        files1[0].arrayBuffer(),
        files2[0].arrayBuffer(),
      ]);

      const [pdf1, pdf2] = await Promise.all([
        PDFDocument.load(buffer1),
        PDFDocument.load(buffer2),
      ]);

      setStatus("Interleaving pages...");
      setProgress(50);

      const newPdf = await PDFDocument.create();
      const maxPages = Math.max(pdf1.getPageCount(), pdf2.getPageCount());

      for (let i = 0; i < maxPages; i++) {
        setProgress(50 + ((i / maxPages) * 40));

        // Add page from first PDF
        if (i < pdf1.getPageCount()) {
          const [page] = await newPdf.copyPages(pdf1, [i]);
          newPdf.addPage(page);
        }

        // Add page from second PDF
        if (i < pdf2.getPageCount()) {
          const [page] = await newPdf.copyPages(pdf2, [i]);
          newPdf.addPage(page);
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
      console.error("Interleave error:", err);
      setError("Failed to interleave PDFs. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "interleaved.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg">
                <Shuffle className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Interleave PDFs</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Alternate pages from two PDFs (A1, B1, A2, B2...)</p>
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
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
                    First PDF {pages1 > 0 && <span className="text-xs">({pages1} pages)</span>}
                  </h3>
                  <FileDropzone
                    onFilesSelected={handleFiles1Selected}
                    accept=".pdf,application/pdf"
                    multiple={false}
                    maxSize={maxFileSize}
                    maxFiles={1}
                    files={files1}
                    onRemoveFile={() => { setFiles1([]); setPages1(0); }}
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
                    Second PDF {pages2 > 0 && <span className="text-xs">({pages2} pages)</span>}
                  </h3>
                  <FileDropzone
                    onFilesSelected={handleFiles2Selected}
                    accept=".pdf,application/pdf"
                    multiple={false}
                    maxSize={maxFileSize}
                    maxFiles={1}
                    files={files2}
                    onRemoveFile={() => { setFiles2([]); setPages2(0); }}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            )}

            {files1.length > 0 && files2.length > 0 && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500/10">
                    <Shuffle className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Ready to Interleave</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Result will have {pages1 + pages2} pages (alternating from both PDFs)
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 mb-4">
                  <Shuffle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">PDFs Interleaved!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {pages1 + pages2} pages combined in alternating order
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={interleavePDFs}
                  disabled={files1.length === 0 || files2.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Shuffle className="h-5 w-5" />
                  Interleave PDFs
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
                <button onClick={() => { setFiles1([]); setFiles2([]); setResultUrl(null); setPages1(0); setPages2(0); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
