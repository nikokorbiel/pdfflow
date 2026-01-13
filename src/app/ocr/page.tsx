"use client";

import { useState, useCallback } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, ScanLine, Sparkles, AlertCircle, Crown, Copy, Check } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

export default function OCRPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<"pdf" | "text">("pdf");
  const [copied, setCopied] = useState(false);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const loadPdfJs = async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    return pdfjsLib;
  };

  const loadTesseract = async () => {
    const Tesseract = await import("tesseract.js");
    return Tesseract;
  };

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setExtractedText("");
      setError(null);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setExtractedText("");
  }, []);

  const performOCR = async () => {
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
      setStatus("Loading libraries...");
      setProgress(5);

      const [pdfjsLib, Tesseract] = await Promise.all([loadPdfJs(), loadTesseract()]);

      setStatus("Loading PDF...");
      setProgress(10);

      const fileBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise as PDFDocumentProxy;
      const totalPages = pdf.numPages;
      const scale = 2;

      const worker = await Tesseract.createWorker("eng");
      let fullText = "";
      const pageTexts: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setStatus(`Processing page ${i} of ${totalPages}...`);
        setProgress(10 + ((i / totalPages) * 80));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        const result = await worker.recognize(canvas);
        const pageText = result.data.text;
        pageTexts.push(pageText);
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }

      await worker.terminate();

      if (outputType === "text") {
        setExtractedText(fullText.trim());
      } else {
        setStatus("Creating searchable PDF...");
        setProgress(92);

        // Create a new PDF with embedded text
        const newPdf = await PDFDocument.create();
        const font = await newPdf.embedFont(StandardFonts.Helvetica);

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });

          // Render page to canvas
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.width = viewport.width * scale;
          canvas.height = viewport.height * scale;

          await page.render({
            canvasContext: context,
            viewport: page.getViewport({ scale }),
            canvas: canvas,
          }).promise;

          const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
          const imageBytes = await fetch(imageDataUrl).then(res => res.arrayBuffer());
          const image = await newPdf.embedJpg(imageBytes);

          const newPage = newPdf.addPage([viewport.width, viewport.height]);
          newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
          });

          // Add invisible text layer for searchability
          const pageText = pageTexts[i - 1] || "";
          if (pageText.trim()) {
            newPage.drawText(pageText.substring(0, 1000), {
              x: 5,
              y: 5,
              size: 1,
              font: font,
              color: rgb(1, 1, 1), // White (invisible)
              opacity: 0,
            });
          }
        }

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
      }

      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("OCR error:", err);
      setError("Failed to perform OCR. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadResult = () => {
    if (outputType === "text") {
      const blob = new Blob([extractedText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
      link.download = `${originalName}_ocr.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
      link.download = `${originalName}_ocr.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const hasResult = resultUrl || extractedText;

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                <ScanLine className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">OCR PDF</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Extract text from scanned PDFs and images</p>
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

            {files.length > 0 && !hasResult && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Output format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOutputType("pdf")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      outputType === "pdf"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                    }`}
                  >
                    <div className="font-semibold">Searchable PDF</div>
                    <div className="text-xs text-[var(--muted-foreground)]">PDF with text layer</div>
                  </button>
                  <button
                    onClick={() => setOutputType("text")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      outputType === "text"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                    }`}
                  >
                    <div className="font-semibold">Plain Text</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Extract text only</div>
                  </button>
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

            {extractedText && (
              <div className="rounded-3xl border bg-[var(--card)] shadow-glass">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ScanLine className="h-5 w-5 text-blue-500" />
                    Extracted Text
                  </h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-[var(--muted)] hover:bg-[var(--border)] transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap font-mono">
                    {extractedText}
                  </pre>
                </div>
              </div>
            )}

            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 mb-4">
                  <ScanLine className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">OCR Complete!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Your searchable PDF is ready</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!hasResult ? (
                <button
                  onClick={performOCR}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ScanLine className="h-5 w-5" />
                  Start OCR
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download {outputType === "pdf" ? "PDF" : "Text"}
                </button>
              )}
              {hasResult && (
                <button onClick={() => { setFiles([]); setResultUrl(null); setExtractedText(""); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
