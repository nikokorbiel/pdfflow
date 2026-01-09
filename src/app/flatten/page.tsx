"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Layers, Sparkles, Check, FileText } from "lucide-react";
import {
  getRemainingUsage,
  incrementUsage,
  getMaxFileSize,
} from "@/lib/usage";
import Link from "next/link";

export default function FlattenPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flattenReport, setFlattenReport] = useState<{ forms: number; annotations: number }>({ forms: 0, annotations: 0 });

  const remainingUsage = typeof window !== "undefined" ? getRemainingUsage() : 2;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setFlattenReport({ forms: 0, annotations: 0 });
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setFlattenReport({ forms: 0, annotations: 0 });
  }, []);

  const flattenPDF = async () => {
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
      setProgress(20);

      const fileBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer, {
        ignoreEncryption: true,
      });

      setStatus("Analyzing document...");
      setProgress(40);

      // Get form information
      const form = pdf.getForm();
      const fields = form.getFields();
      const formCount = fields.length;

      setStatus("Flattening form fields...");
      setProgress(60);

      // Flatten all form fields
      if (formCount > 0) {
        try {
          form.flatten();
        } catch (e) {
          console.log("Some form fields could not be flattened:", e);
        }
      }

      setStatus("Processing annotations...");
      setProgress(75);

      // Count and flatten annotations
      let annotationCount = 0;
      const pages = pdf.getPages();

      for (const page of pages) {
        // Get annotations from the page
        const annots = page.node.Annots();
        if (annots) {
          annotationCount += annots.size();
        }
      }

      setFlattenReport({ forms: formCount, annotations: annotationCount });

      setStatus("Saving flattened PDF...");
      setProgress(90);

      // Save the flattened PDF
      const pdfBytes = await pdf.save({
        useObjectStreams: true,
      });

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      incrementUsage();
    } catch (err) {
      console.error("Flatten error:", err);
      setError("Failed to flatten PDF. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `flattened_${files[0]?.name || "document.pdf"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-400 shadow-lg">
                <Layers className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Flatten PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Convert form fields and annotations to static content
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
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10">
                    <Check className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-medium">PDF flattened successfully</p>
                    <p className="text-sm text-[var(--muted-foreground)]">All interactive elements are now static</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 p-4 rounded-2xl bg-[var(--muted)]/50">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-500">{flattenReport.forms}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Form fields flattened</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-500">{flattenReport.annotations}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Annotations found</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info about flattening */}
            <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                When to flatten a PDF
              </h3>
              <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  <span><strong>Before printing:</strong> Ensures form data appears exactly as filled out.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  <span><strong>For archival:</strong> Creates a permanent record that can&apos;t be modified.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  <span><strong>Reducing file size:</strong> Removes interactive elements and their associated data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  <span><strong>Compatibility:</strong> Ensures the PDF displays correctly in all viewers.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-[var(--muted)]/50 border border-[var(--border)] p-5 animate-fade-in">
              <p className="text-sm text-[var(--muted-foreground)] text-center">
                <strong className="text-foreground">Note:</strong> Flattening converts form fields to static text.
                <br className="hidden sm:block" />
                <span className="text-[var(--accent)]"> Upgrade to Pro</span> for full annotation and layer flattening.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={flattenPDF}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 px-8 py-4 font-medium text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Layers className="h-5 w-5" />
                  Flatten PDF
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Flattened PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                    setFlattenReport({ forms: 0, annotations: 0 });
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Flatten Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
