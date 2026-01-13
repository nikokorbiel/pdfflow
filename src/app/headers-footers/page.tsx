"use client";

import { useState, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Type, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

type Position = "header" | "footer";
type Alignment = "left" | "center" | "right";

export default function HeadersFooters() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [headerAlign, setHeaderAlign] = useState<Alignment>("center");
  const [footerAlign, setFooterAlign] = useState<Alignment>("center");
  const [fontSize, setFontSize] = useState(10);
  const [includePageNumbers, setIncludePageNumbers] = useState(false);
  const [pageNumberPosition, setPageNumberPosition] = useState<Position>("footer");

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

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

  const addHeadersFooters = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
      return;
    }

    if (!headerText && !footerText && !includePageNumbers) {
      setError("Please enter header text, footer text, or enable page numbers");
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
      setProgress(20);

      const fileBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      setStatus("Adding headers and footers...");

      for (let i = 0; i < totalPages; i++) {
        setProgress(20 + (i / totalPages) * 70);
        const page = pages[i];
        const { width, height } = page.getSize();
        const margin = 40;

        // Add header
        if (headerText) {
          let headerX = margin;
          const headerTextWidth = font.widthOfTextAtSize(headerText, fontSize);

          if (headerAlign === "center") {
            headerX = (width - headerTextWidth) / 2;
          } else if (headerAlign === "right") {
            headerX = width - margin - headerTextWidth;
          }

          page.drawText(headerText, {
            x: headerX,
            y: height - margin,
            size: fontSize,
            font,
            color: rgb(0.2, 0.2, 0.2),
          });
        }

        // Add footer
        if (footerText) {
          let footerX = margin;
          const footerTextWidth = font.widthOfTextAtSize(footerText, fontSize);

          if (footerAlign === "center") {
            footerX = (width - footerTextWidth) / 2;
          } else if (footerAlign === "right") {
            footerX = width - margin - footerTextWidth;
          }

          page.drawText(footerText, {
            x: footerX,
            y: margin,
            size: fontSize,
            font,
            color: rgb(0.2, 0.2, 0.2),
          });
        }

        // Add page numbers
        if (includePageNumbers) {
          const pageNumText = `${i + 1} / ${totalPages}`;
          const pageNumWidth = font.widthOfTextAtSize(pageNumText, fontSize);
          const pageNumX = (width - pageNumWidth) / 2;
          const pageNumY = pageNumberPosition === "header" ? height - margin - 15 : margin - 15;

          page.drawText(pageNumText, {
            x: pageNumX,
            y: pageNumY,
            size: fontSize,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      }

      setStatus("Saving PDF...");
      setProgress(95);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Headers/footers error:", err);
      setError("Failed to add headers and footers. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_with_headers.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-rose-400/10 to-pink-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                <Type className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Headers &amp; Footers
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Add custom headers and footers to your PDF
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                {isPro ? (
                  <Crown className="h-4 w-4 text-amber-500" />
                ) : (
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                )}
                <span className="text-sm text-[var(--muted-foreground)]">
                  {usageDisplay}
                </span>
              </div>
              {!isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <Link
                    href="/pricing"
                    className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
                  >
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

            {files.length > 0 && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in space-y-6">
                {/* Header settings */}
                <div>
                  <h3 className="font-semibold mb-3">Header</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="Header text (e.g., Document Title)"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-pink-500 focus:outline-none transition-colors"
                    />
                    <select
                      value={headerAlign}
                      onChange={(e) => setHeaderAlign(e.target.value as Alignment)}
                      className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-pink-500 focus:outline-none transition-colors"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                {/* Footer settings */}
                <div>
                  <h3 className="font-semibold mb-3">Footer</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="Footer text (e.g., Confidential)"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-pink-500 focus:outline-none transition-colors"
                    />
                    <select
                      value={footerAlign}
                      onChange={(e) => setFooterAlign(e.target.value as Alignment)}
                      className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-pink-500 focus:outline-none transition-colors"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                {/* Additional options */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      Font Size
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-pink-500 focus:outline-none transition-colors"
                    >
                      <option value={8}>8pt</option>
                      <option value={10}>10pt</option>
                      <option value={12}>12pt</option>
                      <option value={14}>14pt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      Page Numbers
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includePageNumbers}
                          onChange={(e) => setIncludePageNumbers(e.target.checked)}
                          className="w-4 h-4 rounded border-[var(--border)] text-pink-500 focus:ring-pink-500"
                        />
                        <span className="text-sm">Add page numbers</span>
                      </label>
                      {includePageNumbers && (
                        <select
                          value={pageNumberPosition}
                          onChange={(e) => setPageNumberPosition(e.target.value as Position)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--muted)]"
                        >
                          <option value="header">In header</option>
                          <option value="footer">In footer</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <ProgressBar progress={progress} status={status} />
              </div>
            )}

            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 mb-4">
                    <Type className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Headers &amp; Footers Added!</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Your PDF now has custom headers and footers
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={addHeadersFooters}
                  disabled={files.length === 0 || isProcessing || (!headerText && !footerText && !includePageNumbers)}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 font-medium text-white shadow-lg shadow-pink-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Type className="h-5 w-5" />
                  Add Headers &amp; Footers
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
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
                  Edit Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
