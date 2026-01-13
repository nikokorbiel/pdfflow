"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Crop, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import JSZip from "jszip";

export default function CropImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cropPercent, setCropPercent] = useState(10);
  const [cropSide, setCropSide] = useState<"all" | "top" | "bottom" | "left" | "right">("all");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setResultUrl(null);
    setError(null);

    // Show preview of first image
    if (newFiles.length > 0) {
      const url = URL.createObjectURL(newFiles[0]);
      setPreviewUrl(url);
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length > 0) {
        setPreviewUrl(URL.createObjectURL(newFiles[0]));
      } else {
        setPreviewUrl(null);
      }
      return newFiles;
    });
    setResultUrl(null);
  }, []);

  // Update preview when crop settings change
  useEffect(() => {
    if (!previewUrl || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      const cropPx = {
        top: cropSide === "all" || cropSide === "top" ? (img.height * cropPercent) / 100 : 0,
        bottom: cropSide === "all" || cropSide === "bottom" ? (img.height * cropPercent) / 100 : 0,
        left: cropSide === "all" || cropSide === "left" ? (img.width * cropPercent) / 100 : 0,
        right: cropSide === "all" || cropSide === "right" ? (img.width * cropPercent) / 100 : 0,
      };

      const newWidth = img.width - cropPx.left - cropPx.right;
      const newHeight = img.height - cropPx.top - cropPx.bottom;

      // Scale for preview
      const scale = Math.min(300 / newWidth, 200 / newHeight, 1);
      canvas.width = newWidth * scale;
      canvas.height = newHeight * scale;

      ctx.drawImage(
        img,
        cropPx.left,
        cropPx.top,
        newWidth,
        newHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };
    img.src = previewUrl;
  }, [previewUrl, cropPercent, cropSide]);

  const cropImages = async () => {
    if (files.length === 0) {
      setError("Please select image files");
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
      const zip = new JSZip();

      for (let i = 0; i < files.length; i++) {
        setStatus(`Cropping ${files[i].name}...`);
        setProgress((i / files.length) * 90);

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = URL.createObjectURL(files[i]);
        });

        const cropPx = {
          top: cropSide === "all" || cropSide === "top" ? (img.height * cropPercent) / 100 : 0,
          bottom: cropSide === "all" || cropSide === "bottom" ? (img.height * cropPercent) / 100 : 0,
          left: cropSide === "all" || cropSide === "left" ? (img.width * cropPercent) / 100 : 0,
          right: cropSide === "all" || cropSide === "right" ? (img.width * cropPercent) / 100 : 0,
        };

        const newWidth = img.width - cropPx.left - cropPx.right;
        const newHeight = img.height - cropPx.top - cropPx.bottom;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.drawImage(
          img,
          cropPx.left,
          cropPx.top,
          newWidth,
          newHeight,
          0,
          0,
          newWidth,
          newHeight
        );

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png", 0.95);
        });

        const name = files[i].name.replace(/\.[^.]+$/, "") + "_cropped.png";
        zip.file(name, blob);

        URL.revokeObjectURL(img.src);
      }

      setStatus("Creating ZIP...");
      setProgress(95);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Crop error:", err);
      setError("Failed to crop images. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "cropped_images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sides = [
    { value: "all" as const, label: "All Sides" },
    { value: "top" as const, label: "Top" },
    { value: "bottom" as const, label: "Bottom" },
    { value: "left" as const, label: "Left" },
    { value: "right" as const, label: "Right" },
  ];

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                <Crop className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Crop Images</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Batch crop images by percentage</p>
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
              accept="image/*"
              multiple={true}
              maxSize={maxFileSize}
              maxFiles={50}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={isProcessing}
            />

            {files.length > 0 && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Crop Side</label>
                      <div className="grid grid-cols-3 gap-2">
                        {sides.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => setCropSide(s.value)}
                            className={`p-2 rounded-lg text-sm transition-all ${
                              cropSide === s.value
                                ? "bg-pink-500 text-white"
                                : "bg-[var(--muted)] hover:bg-[var(--border)]"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">Crop Amount</label>
                        <span className="text-sm text-[var(--muted-foreground)]">{cropPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="40"
                        value={cropPercent}
                        onChange={(e) => setCropPercent(parseInt(e.target.value))}
                        className="w-full accent-pink-500"
                      />
                    </div>
                  </div>

                  {previewUrl && (
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm text-[var(--muted-foreground)] mb-2">Preview</p>
                        <canvas
                          ref={canvasRef}
                          className="border border-[var(--border)] rounded-lg max-w-full"
                        />
                      </div>
                    </div>
                  )}
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

            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 mb-4">
                  <Crop className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Crop Complete!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {files.length} image{files.length !== 1 ? "s" : ""} cropped
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={cropImages}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Crop className="h-5 w-5" />
                  Crop Images
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download ZIP
                </button>
              )}
              {resultUrl && (
                <button onClick={() => { setFiles([]); setResultUrl(null); setPreviewUrl(null); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
                  Process More
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
