"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, FlipVertical2, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import JSZip from "jszip";

type FlipDirection = "horizontal" | "vertical" | "both";

export default function FlipImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<FlipDirection>("horizontal");

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setResultUrl(null);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResultUrl(null);
  }, []);

  const flipImages = async () => {
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
        setStatus(`Flipping ${files[i].name}...`);
        setProgress((i / files.length) * 90);

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = URL.createObjectURL(files[i]);
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.save();

        if (direction === "horizontal" || direction === "both") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        if (direction === "vertical" || direction === "both") {
          ctx.translate(0, canvas.height);
          ctx.scale(1, -1);
        }

        ctx.drawImage(img, 0, 0);
        ctx.restore();

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png", 0.95);
        });

        const name = files[i].name.replace(/\.[^.]+$/, "") + "_flipped.png";
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
      console.error("Flip error:", err);
      setError("Failed to flip images. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "flipped_images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const directions = [
    { value: "horizontal" as const, label: "Horizontal", desc: "Mirror left-right" },
    { value: "vertical" as const, label: "Vertical", desc: "Mirror top-bottom" },
    { value: "both" as const, label: "Both", desc: "Mirror both axes" },
  ];

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-violet-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg">
                <FlipVertical2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Flip Images</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Mirror images horizontally or vertically</p>
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
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Flip Direction</label>
                <div className="grid grid-cols-3 gap-3">
                  {directions.map((dir) => (
                    <button
                      key={dir.value}
                      onClick={() => setDirection(dir.value)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        direction === dir.value
                          ? "bg-indigo-500 text-white"
                          : "bg-[var(--muted)] hover:bg-[var(--border)]"
                      }`}
                    >
                      <div className="font-medium">{dir.label}</div>
                      <div className={`text-sm ${direction === dir.value ? "text-indigo-100" : "text-[var(--muted-foreground)]"}`}>
                        {dir.desc}
                      </div>
                    </button>
                  ))}
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 mb-4">
                  <FlipVertical2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Flip Complete!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {files.length} image{files.length !== 1 ? "s" : ""} flipped {direction === "both" ? "both ways" : direction + "ly"}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={flipImages}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FlipVertical2 className="h-5 w-5" />
                  Flip Images
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
                <button onClick={() => { setFiles([]); setResultUrl(null); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
