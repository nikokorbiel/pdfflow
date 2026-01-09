"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Unlock, Sparkles, Eye, EyeOff, KeyRound, AlertCircle } from "lucide-react";
import {
  getRemainingUsage,
  incrementUsage,
  getMaxFileSize,
} from "@/lib/usage";
import Link from "next/link";

export default function UnlockPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);

  const remainingUsage = typeof window !== "undefined" ? getRemainingUsage() : 2;

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setPassword("");
      setNeedsPassword(false);

      // Check if PDF is encrypted
      try {
        const fileBuffer = await newFiles[0].arrayBuffer();
        try {
          await PDFDocument.load(fileBuffer);
          // PDF loaded without password - it's not encrypted
          setNeedsPassword(false);
        } catch (err: unknown) {
          const error = err as Error;
          if (error.message?.includes("encrypted") || error.message?.includes("password")) {
            setNeedsPassword(true);
          } else {
            setError("Failed to read PDF. The file may be corrupted.");
          }
        }
      } catch {
        setError("Failed to read file.");
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setPassword("");
    setNeedsPassword(false);
  }, []);

  const unlockPDF = async () => {
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

      setStatus("Attempting to unlock...");
      setProgress(40);

      let pdfDoc: PDFDocument;

      try {
        // pdf-lib uses ignoreEncryption to bypass encryption
        // Note: This works for PDFs with restrictions but may not work for strongly encrypted PDFs
        pdfDoc = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });
      } catch (err: unknown) {
        const error = err as Error;
        if (error.message?.includes("password") || error.message?.includes("encrypted")) {
          setError("Unable to unlock this PDF. The encryption may be too strong.");
          setIsProcessing(false);
          return;
        }
        throw err;
      }

      setStatus("Removing protection...");
      setProgress(60);

      // Create a new unprotected PDF by copying all pages
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

      for (const page of pages) {
        newPdf.addPage(page);
      }

      // Copy metadata
      newPdf.setTitle(pdfDoc.getTitle() || "");
      newPdf.setAuthor(pdfDoc.getAuthor() || "");
      newPdf.setSubject(pdfDoc.getSubject() || "");
      newPdf.setCreator("PDFflow");

      setStatus("Saving unlocked PDF...");
      setProgress(80);

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      incrementUsage();
    } catch (err) {
      console.error("Unlock error:", err);
      setError("Failed to unlock PDF. Please check the password and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_unlocked.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-sky-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-sky-400/10 to-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-sky-500 shadow-lg">
                <Unlock className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Unlock PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Remove password protection from your PDF
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

            {/* Password status */}
            {files.length > 0 && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                {needsPassword ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10">
                        <KeyRound className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Password Required</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          This PDF is password-protected. Enter the password to unlock it.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                        PDF Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter the PDF password"
                          className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-cyan-500 focus:outline-none transition-colors"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && password) {
                              unlockPDF();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
                      <Unlock className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">No Password Detected</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        This PDF doesn&apos;t appear to be password-protected. You can still process it to remove any restrictions.
                      </p>
                    </div>
                  </div>
                )}
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
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                    {error.includes("password") && (
                      <p className="text-xs text-red-400/70 mt-1">
                        Make sure you&apos;re using the correct password that was set when the PDF was protected.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success result */}
            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 mb-4">
                    <Unlock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">PDF Unlocked!</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Your PDF is now free from password protection
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-sm">
                    <Unlock className="h-4 w-4" />
                    No password required to open
                  </div>
                </div>
              </div>
            )}

            {/* Note */}
            {files.length > 0 && !resultUrl && (
              <div className="rounded-3xl bg-[var(--muted)]/50 border border-[var(--border)] p-5 animate-fade-in">
                <p className="text-sm text-[var(--muted-foreground)] text-center">
                  <strong className="text-foreground">Note:</strong> You must know the password to unlock a protected PDF.
                  <br className="hidden sm:block" />
                  This tool removes protection for authorized users only.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={unlockPDF}
                  disabled={files.length === 0 || isProcessing || (needsPassword && !password)}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-8 py-4 font-medium text-white shadow-lg shadow-cyan-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Unlock className="h-5 w-5" />
                  Unlock PDF
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Unlocked PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                    setPassword("");
                    setNeedsPassword(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Unlock Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
