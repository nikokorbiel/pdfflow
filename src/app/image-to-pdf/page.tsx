"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, FileImage, GripVertical, Sparkles, Settings2 } from "lucide-react";
import {
  getRemainingUsage,
  incrementUsage,
  getMaxFileSize,
} from "@/lib/usage";
import Link from "next/link";

type PageSize = "fit" | "a4" | "letter";

export default function ImageToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>("fit");
  const [previews, setPreviews] = useState<string[]>([]);

  const remainingUsage = typeof window !== "undefined" ? getRemainingUsage() : 2;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setResultUrl(null);
    setError(null);

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setResultUrl(null);
  }, []);

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const [removed] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, removed);
      return newFiles;
    });
    setPreviews((prev) => {
      const newPreviews = [...prev];
      const [removed] = newPreviews.splice(fromIndex, 1);
      newPreviews.splice(toIndex, 0, removed);
      return newPreviews;
    });
  }, []);

  const convertToPDF = async () => {
    if (files.length === 0) {
      setError("Please select at least one image");
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
      setStatus("Creating PDF...");
      const pdf = await PDFDocument.create();

      // Page dimensions
      const pageSizes = {
        a4: { width: 595.28, height: 841.89 },
        letter: { width: 612, height: 792 },
      };

      for (let i = 0; i < files.length; i++) {
        setStatus(`Processing image ${i + 1} of ${files.length}...`);
        setProgress(((i + 1) / (files.length + 1)) * 90);

        const file = files[i];
        const imageBytes = await file.arrayBuffer();

        let image;
        if (file.type === "image/png") {
          image = await pdf.embedPng(imageBytes);
        } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
          image = await pdf.embedJpg(imageBytes);
        } else {
          // For other formats, try to convert via canvas
          const dataUrl = await convertToJpeg(file);
          const base64 = dataUrl.split(",")[1];
          const jpegBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          image = await pdf.embedJpg(jpegBytes);
        }

        let pageWidth: number;
        let pageHeight: number;
        let imageX = 0;
        let imageY = 0;
        let imageWidth = image.width;
        let imageHeight = image.height;

        if (pageSize === "fit") {
          // Page fits image
          pageWidth = image.width;
          pageHeight = image.height;
        } else {
          // Fixed page size, scale image to fit
          const size = pageSizes[pageSize];
          pageWidth = size.width;
          pageHeight = size.height;

          const scaleX = pageWidth / image.width;
          const scaleY = pageHeight / image.height;
          const scale = Math.min(scaleX, scaleY);

          imageWidth = image.width * scale;
          imageHeight = image.height * scale;
          imageX = (pageWidth - imageWidth) / 2;
          imageY = (pageHeight - imageHeight) / 2;
        }

        const page = pdf.addPage([pageWidth, pageHeight]);
        page.drawImage(image, {
          x: imageX,
          y: imageY,
          width: imageWidth,
          height: imageHeight,
        });
      }

      setStatus("Saving PDF...");
      setProgress(95);

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      incrementUsage();
    } catch (err) {
      console.error("Conversion error:", err);
      setError("Failed to convert images. Please ensure all files are valid images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToJpeg = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not create canvas context"));
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "images.pdf";
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
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-500/20 to-red-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/10 to-rose-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-red-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-red-400 shadow-lg">
                <FileImage className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Image to PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Weave images into document poetry
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
              accept="image/*,.png,.jpg,.jpeg,.webp"
              multiple={true}
              maxSize={getMaxFileSize()}
              maxFiles={20}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={isProcessing}
            />

            {/* Options */}
            {files.length > 0 && !isProcessing && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 space-y-5 shadow-glass animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10">
                    <Settings2 className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Page settings</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Choose how images fit on pages</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Page Size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as PageSize)}
                    className="w-full sm:w-auto rounded-2xl border bg-[var(--background)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                  >
                    <option value="fit">Fit to Image</option>
                    <option value="a4">A4</option>
                    <option value="letter">US Letter</option>
                  </select>
                </div>
              </div>
            )}

            {/* Image reordering */}
            {files.length > 1 && !isProcessing && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--muted)]">
                    <GripVertical className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">Arrange your images</span>
                    <p className="text-xs text-[var(--muted-foreground)]">First image becomes first page</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group animate-scale-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`Image ${index + 1}`}
                        className="rounded-2xl border w-full aspect-square object-cover shadow-glass"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg font-medium">
                        {index + 1}
                      </div>
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveFile(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                          className="bg-black/70 text-white p-1.5 rounded-lg disabled:opacity-30 hover:bg-black/90 transition-colors"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveFile(index, Math.min(files.length - 1, index + 1))}
                          disabled={index === files.length - 1}
                          className="bg-black/70 text-white p-1.5 rounded-lg disabled:opacity-30 hover:bg-black/90 transition-colors"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 text-sm text-red-500 dark:text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={convertToPDF}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-red-400 px-8 py-4 font-medium text-white shadow-lg shadow-rose-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <FileImage className="h-5 w-5" />
                  Convert {files.length} Image{files.length !== 1 ? "s" : ""} to PDF
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
                    setPreviews([]);
                    setResultUrl(null);
                    setProgress(0);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Convert More Images
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
