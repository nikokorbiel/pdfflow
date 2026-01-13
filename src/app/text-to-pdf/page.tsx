"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, FileText, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

export default function TextToPDF() {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState<"Helvetica" | "TimesRoman" | "Courier">("Helvetica");

  const { isPro, canProcess, recordUsage, usageDisplay } = useToolUsage();

  const createPDF = async () => {
    if (!text.trim()) {
      setError("Please enter some text");
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
      setStatus("Creating PDF...");
      setProgress(20);

      const pdfDoc = await PDFDocument.create();

      let font;
      switch (fontFamily) {
        case "TimesRoman":
          font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
          break;
        case "Courier":
          font = await pdfDoc.embedFont(StandardFonts.Courier);
          break;
        default:
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      const pageWidth = 612;
      const pageHeight = 792;
      const margin = 50;
      const lineHeight = fontSize * 1.4;
      const maxWidth = pageWidth - margin * 2;

      const lines: string[] = [];
      const paragraphs = text.split("\n");

      setProgress(40);
      setStatus("Processing text...");

      for (const paragraph of paragraphs) {
        if (paragraph.trim() === "") {
          lines.push("");
          continue;
        }

        const words = paragraph.split(" ");
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, fontSize);

          if (width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }
      }

      setProgress(60);
      setStatus("Creating pages...");

      const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);
      const totalPages = Math.ceil(lines.length / linesPerPage);

      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const startLine = pageNum * linesPerPage;
        const endLine = Math.min(startLine + linesPerPage, lines.length);

        for (let i = startLine; i < endLine; i++) {
          const y = pageHeight - margin - (i - startLine) * lineHeight;
          page.drawText(lines[i], {
            x: margin,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
      }

      setStatus("Saving PDF...");
      setProgress(90);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to create PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "text_document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-orange-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Text to PDF</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Convert plain text into a PDF document</p>
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
            <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                  Enter your text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => { setText(e.target.value); setResultUrl(null); }}
                  placeholder="Type or paste your text here..."
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-amber-500 focus:outline-none resize-none font-mono text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as "Helvetica" | "TimesRoman" | "Courier")}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Helvetica">Helvetica (Sans-serif)</option>
                    <option value="TimesRoman">Times Roman (Serif)</option>
                    <option value="Courier">Courier (Monospace)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Font Size</label>
                  <input
                    type="number"
                    min="8"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Math.max(8, Math.min(24, parseInt(e.target.value) || 12)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">PDF Created!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Your text has been converted to PDF</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={createPDF}
                  disabled={!text.trim() || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FileText className="h-5 w-5" />
                  Create PDF
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
                <button onClick={() => { setText(""); setResultUrl(null); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
                  Create Another
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
