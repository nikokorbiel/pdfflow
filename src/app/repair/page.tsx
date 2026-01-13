"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Wrench, Sparkles, Check, AlertTriangle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

export default function RepairPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repairReport, setRepairReport] = useState<string[]>([]);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setRepairReport([]);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setRepairReport([]);
  }, []);

  const repairPDF = async () => {
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
    setRepairReport([]);

    const report: string[] = [];

    try {
      setStatus("Loading PDF...");
      setProgress(20);

      const fileBuffer = await files[0].arrayBuffer();

      // Try to load with ignoreEncryption to handle some corrupted files
      let pdf: PDFDocument;
      try {
        pdf = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
          updateMetadata: false,
        });
        report.push("Successfully parsed PDF structure");
      } catch {
        // Try with throwOnInvalidObject disabled
        try {
          pdf = await PDFDocument.load(fileBuffer, {
            ignoreEncryption: true,
            updateMetadata: false,
            throwOnInvalidObject: false,
          });
          report.push("Recovered PDF with some invalid objects ignored");
        } catch {
          throw new Error("PDF is too corrupted to repair with client-side tools");
        }
      }

      setStatus("Analyzing document...");
      setProgress(40);

      const pageCount = pdf.getPageCount();
      report.push(`Found ${pageCount} page(s)`);

      // Check each page
      setStatus("Checking pages...");
      for (let i = 0; i < pageCount; i++) {
        setProgress(40 + (i / pageCount) * 30);
        try {
          const page = pdf.getPage(i);
          const { width, height } = page.getSize();
          if (width <= 0 || height <= 0) {
            // Fix invalid page dimensions
            page.setSize(612, 792); // Letter size
            report.push(`Fixed invalid dimensions on page ${i + 1}`);
          }
        } catch {
          report.push(`Warning: Page ${i + 1} may have issues`);
        }
      }

      setStatus("Rebuilding PDF structure...");
      setProgress(75);

      // Remove corrupted metadata by creating clean metadata
      pdf.setTitle(pdf.getTitle() || "");
      pdf.setAuthor(pdf.getAuthor() || "");
      pdf.setSubject(pdf.getSubject() || "");
      pdf.setCreator("PDFflow Repair Tool");
      pdf.setProducer("PDFflow");
      report.push("Cleaned document metadata");

      setStatus("Saving repaired PDF...");
      setProgress(90);

      // Save with object streams for better structure
      const pdfBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      report.push("PDF successfully rebuilt");
      setRepairReport(report);
      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Repair error:", err);
      report.push(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      setRepairReport(report);
      setError("Could not fully repair this PDF. The file may be severely corrupted. Pro users have access to advanced repair tools that can handle more complex corruption.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `repaired_${files[0]?.name || "document.pdf"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-orange-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-400 shadow-lg">
                <Wrench className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Repair PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Fix corrupted or damaged PDF files
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                {isPro ? (
                  <>
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Unlimited
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {usageDisplay}
                    </span>
                  </>
                )}
              </div>
              {!isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <Link href="/pricing" className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity">
                    Upgrade
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
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

            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <ProgressBar progress={progress} status={status} />
              </div>
            )}

            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 text-sm text-red-500 dark:text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            {/* Repair Report */}
            {repairReport.length > 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-amber-500" />
                  Repair Report
                </h3>
                <ul className="space-y-2">
                  {repairReport.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      {item.toLowerCase().includes("error") || item.toLowerCase().includes("warning") ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={item.toLowerCase().includes("error") ? "text-red-500" : "text-[var(--muted-foreground)]"}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
                    <Check className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">PDF repaired successfully</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Your repaired PDF is ready to download</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-[var(--muted)]/50 border border-[var(--border)] p-5 animate-fade-in">
              <p className="text-sm text-[var(--muted-foreground)] text-center">
                <strong className="text-foreground">Note:</strong> This tool rebuilds PDF structure and cleans metadata.
                <br className="hidden sm:block" />
                <span className="text-[var(--accent)]"> Upgrade to Pro</span> for advanced repair including content recovery.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={repairPDF}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-8 py-4 font-medium text-white shadow-lg shadow-amber-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Wrench className="h-5 w-5" />
                  Repair PDF
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Repaired PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                    setRepairReport([]);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Repair Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
