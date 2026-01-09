"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Table, Sparkles } from "lucide-react";
import {
  getRemainingUsage,
  incrementUsage,
  getMaxFileSize,
} from "@/lib/usage";
import Link from "next/link";

// Dynamic import for pdfjs-dist to avoid SSR issues
const loadPdfJs = async () => {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  return pdfjsLib;
};

export default function PDFToExcel() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const convertToExcel = async () => {
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

      const pdfjsLib = await loadPdfJs();
      const fileBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
      const totalPages = pdf.numPages;

      let csvContent = "";

      setStatus("Extracting text...");

      for (let i = 1; i <= totalPages; i++) {
        setProgress(10 + (i / totalPages) * 70);
        setStatus(`Processing page ${i} of ${totalPages}...`);

        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items by their y-position to create rows
        const rows: Map<number, string[]> = new Map();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        textContent.items.forEach((item: any) => {
          if (item.str && item.str.trim()) {
            const y = Math.round(item.transform[5]);
            if (!rows.has(y)) {
              rows.set(y, []);
            }
            rows.get(y)!.push(item.str.trim());
          }
        });

        // Sort rows by y-position (top to bottom)
        const sortedRows = Array.from(rows.entries())
          .sort((a, b) => b[0] - a[0])
          .map((entry) => entry[1]);

        // Add page marker
        if (i > 1) {
          csvContent += "\n";
        }
        csvContent += `--- Page ${i} ---\n`;

        // Convert to CSV format
        sortedRows.forEach(row => {
          const escapedCells = row.map(cell => {
            if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          });
          csvContent += escapedCells.join(",") + "\n";
        });
      }

      setStatus("Creating CSV file...");
      setProgress(90);

      // Create CSV blob
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
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

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = files[0]?.name.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/20 to-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-400/10 to-green-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg">
                <Table className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              PDF to Excel
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Extract tables and data from PDFs to spreadsheets
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-sm text-[var(--muted-foreground)]">
                  {remainingUsage} of 2 free uses today
                </span>
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <Link href="/pricing" className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity">
                Upgrade
              </Link>
            </div>
          </div>

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

            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10">
                    <Table className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">CSV file ready</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Open in Excel, Google Sheets, or any spreadsheet app</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-[var(--muted)]/50 border border-[var(--border)] p-5 animate-fade-in">
              <p className="text-sm text-[var(--muted-foreground)] text-center">
                <strong className="text-foreground">Note:</strong> This tool extracts text in CSV format.
                <br className="hidden sm:block" />
                <span className="text-[var(--accent)]"> Upgrade to Pro</span> for advanced table detection and native Excel (.xlsx) export.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={convertToExcel}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 px-8 py-4 font-medium text-white shadow-lg shadow-green-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Table className="h-5 w-5" />
                  Convert to Excel
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download CSV
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
