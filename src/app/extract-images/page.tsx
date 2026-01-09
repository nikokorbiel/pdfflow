"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, ImageIcon, Sparkles } from "lucide-react";
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

interface ExtractedImage {
  data: string;
  width: number;
  height: number;
  page: number;
  index: number;
}

export default function ExtractImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);

  const remainingUsage = typeof window !== "undefined" ? getRemainingUsage() : 2;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setExtractedImages([]);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setExtractedImages([]);
  }, []);

  const extractImages = async () => {
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
    setExtractedImages([]);

    try {
      setStatus("Loading PDF...");
      setProgress(10);

      const pdfjsLib = await loadPdfJs();
      const fileBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
      const totalPages = pdf.numPages;

      const images: ExtractedImage[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProgress(10 + (pageNum / totalPages) * 70);
        setStatus(`Scanning page ${pageNum} of ${totalPages}...`);

        const page = await pdf.getPage(pageNum);
        const operatorList = await page.getOperatorList();

        // Look for image operators
        let imageIndex = 0;
        for (let i = 0; i < operatorList.fnArray.length; i++) {
          const fn = operatorList.fnArray[i];

          // OPS.paintImageXObject = 85, OPS.paintImageXObjectRepeat = 88
          if (fn === 85 || fn === 88) {
            try {
              const imgName = operatorList.argsArray[i][0];
              const objs = await page.objs.get(imgName);

              if (objs && objs.width && objs.height && objs.data) {
                // Create canvas to draw image
                const canvas = document.createElement("canvas");
                canvas.width = objs.width;
                canvas.height = objs.height;
                const ctx = canvas.getContext("2d")!;

                // Create ImageData
                const imageData = new ImageData(
                  new Uint8ClampedArray(objs.data.buffer || objs.data),
                  objs.width,
                  objs.height
                );
                ctx.putImageData(imageData, 0, 0);

                images.push({
                  data: canvas.toDataURL("image/png"),
                  width: objs.width,
                  height: objs.height,
                  page: pageNum,
                  index: ++imageIndex,
                });
              }
            } catch (e) {
              // Skip images that can't be extracted
              console.log("Could not extract image:", e);
            }
          }
        }
      }

      if (images.length === 0) {
        setError("No extractable images found in this PDF. The PDF may contain vector graphics or images in an unsupported format.");
        setIsProcessing(false);
        return;
      }

      setExtractedImages(images);

      setStatus("Creating ZIP archive...");
      setProgress(90);

      // Create ZIP with all images
      const zip = new JSZip();
      images.forEach((img) => {
        const base64Data = img.data.split(",")[1];
        zip.file(`image_page${img.page}_${img.index}.png`, base64Data, { base64: true });
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      incrementUsage();
    } catch (err) {
      console.error("Extract error:", err);
      setError("Failed to extract images. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = files[0]?.name.replace(/\.pdf$/i, "") || "images";
    link.download = `${baseName}_images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSingleImage = (img: ExtractedImage) => {
    const link = document.createElement("a");
    link.href = img.data;
    link.download = `image_page${img.page}_${img.index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-400/10 to-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-400 shadow-lg">
                <ImageIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Extract Images
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Pull all images from your PDF documents
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

            {/* Extracted Images Preview */}
            {extractedImages.length > 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10">
                      <ImageIcon className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="font-medium">{extractedImages.length} images found</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Click to download individual images</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-2">
                  {extractedImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => downloadSingleImage(img)}
                      className="relative rounded-xl border overflow-hidden hover:ring-2 hover:ring-cyan-500 transition-all group"
                    >
                      <img src={img.data} alt={`Image ${index + 1}`} className="w-full aspect-square object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Download className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 text-center py-1 text-xs font-medium bg-[var(--muted)]">
                        p.{img.page}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-[var(--muted)]/50 border border-[var(--border)] p-5 animate-fade-in">
              <p className="text-sm text-[var(--muted-foreground)] text-center">
                <strong className="text-foreground">Note:</strong> Extracts embedded raster images from PDFs.
                <br className="hidden sm:block" />
                <span className="text-[var(--accent)]"> Upgrade to Pro</span> for vector graphic extraction and higher quality exports.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={extractImages}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 px-8 py-4 font-medium text-white shadow-lg shadow-cyan-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <ImageIcon className="h-5 w-5" />
                  Extract Images
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download All ({extractedImages.length} images)
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                    setExtractedImages([]);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Extract From Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
