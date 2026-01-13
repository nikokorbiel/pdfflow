"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Frame, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import JSZip from "jszip";

export default function AddFrame() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frameWidth, setFrameWidth] = useState(20);
  const [frameColor, setFrameColor] = useState("#000000");
  const [frameStyle, setFrameStyle] = useState<"solid" | "double" | "rounded">("solid");

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

  const addFrames = async () => {
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
        setStatus(`Adding frame to ${files[i].name}...`);
        setProgress((i / files.length) * 90);

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = URL.createObjectURL(files[i]);
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        const totalFrameWidth = frameStyle === "double" ? frameWidth * 2 : frameWidth;
        canvas.width = img.width + totalFrameWidth * 2;
        canvas.height = img.height + totalFrameWidth * 2;

        // Fill with frame color
        ctx.fillStyle = frameColor;

        if (frameStyle === "rounded") {
          const radius = 20;
          ctx.beginPath();
          ctx.roundRect(0, 0, canvas.width, canvas.height, radius);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (frameStyle === "double") {
          // Inner white border
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(frameWidth, frameWidth, canvas.width - frameWidth * 2, canvas.height - frameWidth * 2);
          // Inner colored border
          ctx.fillStyle = frameColor;
          ctx.fillRect(frameWidth + 5, frameWidth + 5, canvas.width - frameWidth * 2 - 10, canvas.height - frameWidth * 2 - 10);
        }

        // Draw image in center
        if (frameStyle === "rounded") {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(totalFrameWidth, totalFrameWidth, img.width, img.height, 10);
          ctx.clip();
          ctx.drawImage(img, totalFrameWidth, totalFrameWidth);
          ctx.restore();
        } else {
          ctx.drawImage(img, totalFrameWidth, totalFrameWidth);
        }

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png", 0.95);
        });

        const name = files[i].name.replace(/\.[^.]+$/, "") + "_framed.png";
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
      console.error("Frame error:", err);
      setError("Failed to add frames. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "framed_images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const styles = [
    { value: "solid" as const, label: "Solid" },
    { value: "double" as const, label: "Double" },
    { value: "rounded" as const, label: "Rounded" },
  ];

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-emerald-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
                <Frame className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Add Frame</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Add decorative frames to images</p>
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
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Frame Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {styles.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setFrameStyle(s.value)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          frameStyle === s.value
                            ? "bg-teal-500 text-white"
                            : "bg-[var(--muted)] hover:bg-[var(--border)]"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">Frame Width</label>
                      <span className="text-sm text-[var(--muted-foreground)]">{frameWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={frameWidth}
                      onChange={(e) => setFrameWidth(parseInt(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Frame Color</label>
                    <input
                      type="color"
                      value={frameColor}
                      onChange={(e) => setFrameColor(e.target.value)}
                      className="w-full h-10 rounded-xl cursor-pointer"
                    />
                  </div>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 mb-4">
                  <Frame className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Frames Added!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {files.length} image{files.length !== 1 ? "s" : ""} framed
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={addFrames}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Frame className="h-5 w-5" />
                  Add Frames
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
