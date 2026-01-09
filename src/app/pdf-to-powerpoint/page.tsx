"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Presentation, Sparkles, Image as ImageIcon } from "lucide-react";
import {
  getRemainingUsage,
  incrementUsage,
  getMaxFileSize,
} from "@/lib/usage";
import Link from "next/link";
import JSZip from "jszip";

// Dynamic import for pdfjs-dist to avoid SSR issues
const loadPdfJs = async () => {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  return pdfjsLib;
};

export default function PDFToPowerPoint() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slideCount, setSlideCount] = useState(0);

  const remainingUsage = typeof window !== "undefined" ? getRemainingUsage() : 2;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setSlideCount(0);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setSlideCount(0);
  }, []);

  const convertToPowerPoint = async () => {
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

      const zip = new JSZip();
      const images: string[] = [];

      // Convert each page to an image
      for (let i = 1; i <= totalPages; i++) {
        setProgress(10 + (i / totalPages) * 70);
        setStatus(`Converting page ${i} of ${totalPages}...`);

        const page = await pdf.getPage(i);
        const scale = 2; // Higher quality
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // @ts-expect-error - pdfjs-dist types mismatch
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageData = canvas.toDataURL("image/png").split(",")[1];
        images.push(imageData);
        zip.file(`slide_${i}.png`, imageData, { base64: true });
      }

      setStatus("Creating ZIP archive...");
      setProgress(90);

      // Create a simple HTML file that can be opened as a presentation
      let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>PDF Slides</title>
  <style>
    body { margin: 0; padding: 0; background: #000; }
    .slide { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; page-break-after: always; }
    .slide img { max-width: 100%; max-height: 100%; object-fit: contain; }
    @media print { .slide { page-break-after: always; } }
  </style>
</head>
<body>
`;

      for (let i = 1; i <= totalPages; i++) {
        htmlContent += `  <div class="slide"><img src="slide_${i}.png" alt="Slide ${i}"></div>\n`;
      }

      htmlContent += `</body>
</html>`;

      zip.file("presentation.html", htmlContent);
      zip.file("README.txt", `PDF to PowerPoint Conversion
=============================

Your PDF has been converted to ${totalPages} slide image(s).

To use these slides:
1. Open PowerPoint and create a new presentation
2. For each slide, insert the corresponding PNG image
3. Alternatively, open presentation.html in a browser for a quick slideshow

For native .pptx export, upgrade to PDFflow Pro.
`);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setSlideCount(totalPages);
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
    const baseName = files[0]?.name.replace(/\.pdf$/i, "") || "presentation";
    link.download = `${baseName}_slides.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-amber-400/10 to-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-400 shadow-lg">
                <Presentation className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              PDF to PowerPoint
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Transform your PDFs into presentation slides
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
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10">
                    <ImageIcon className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">{slideCount} slide images ready</p>
                    <p className="text-sm text-[var(--muted-foreground)]">ZIP contains PNG images and HTML slideshow</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-[var(--muted)]/50 border border-[var(--border)] p-5 animate-fade-in">
              <p className="text-sm text-[var(--muted-foreground)] text-center">
                <strong className="text-foreground">Note:</strong> This creates high-quality slide images you can import into PowerPoint.
                <br className="hidden sm:block" />
                <span className="text-[var(--accent)]"> Upgrade to Pro</span> for native .pptx export with editable text.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={convertToPowerPoint}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-red-400 px-8 py-4 font-medium text-white shadow-lg shadow-orange-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Presentation className="h-5 w-5" />
                  Convert to PowerPoint
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Slides
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                    setSlideCount(0);
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
