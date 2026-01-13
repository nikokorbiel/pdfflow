"use client";

import { useState, useCallback } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, ImagePlus, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

type BackgroundType = "color" | "image";

export default function AddBackground() {
  const [files, setFiles] = useState<File[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("color");
  const [backgroundColor, setBackgroundColor] = useState("#f5f5f5");
  const [opacity, setOpacity] = useState(100);

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

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBackgroundImage(e.target.files[0]);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : { r: 1, g: 1, b: 1 };
  };

  const addBackground = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
      return;
    }

    if (backgroundType === "image" && !backgroundImage) {
      setError("Please select a background image");
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
      const pages = pdfDoc.getPages();

      let bgImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;

      if (backgroundType === "image" && backgroundImage) {
        setStatus("Loading background image...");
        setProgress(30);
        const imageBuffer = await backgroundImage.arrayBuffer();
        const imageType = backgroundImage.type;

        if (imageType.includes("png")) {
          bgImage = await pdfDoc.embedPng(imageBuffer);
        } else {
          bgImage = await pdfDoc.embedJpg(imageBuffer);
        }
      }

      setStatus("Adding background...");

      for (let i = 0; i < pages.length; i++) {
        setProgress(30 + ((i / pages.length) * 60));
        const page = pages[i];
        const { width, height } = page.getSize();

        if (backgroundType === "color") {
          const { r, g, b } = hexToRgb(backgroundColor);
          // Draw colored rectangle behind content
          page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: rgb(r, g, b),
            opacity: opacity / 100,
          });
          // Move rectangle to back by recreating content order
        } else if (bgImage) {
          const imgDims = bgImage.scale(1);
          const scaleX = width / imgDims.width;
          const scaleY = height / imgDims.height;
          const scale = Math.max(scaleX, scaleY);

          page.drawImage(bgImage, {
            x: (width - imgDims.width * scale) / 2,
            y: (height - imgDims.height * scale) / 2,
            width: imgDims.width * scale,
            height: imgDims.height * scale,
            opacity: opacity / 100,
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
      console.error("Background error:", err);
      setError("Failed to add background. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_with_background.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <ImagePlus className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Add Background</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Add a color or image background to your PDF</p>
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

            {files.length > 0 && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Background Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setBackgroundType("color")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        backgroundType === "color"
                          ? "border-pink-500 bg-pink-500/10"
                          : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                      }`}
                    >
                      <div className="font-semibold">Solid Color</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Choose a background color</div>
                    </button>
                    <button
                      onClick={() => setBackgroundType("image")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        backgroundType === "image"
                          ? "border-pink-500 bg-pink-500/10"
                          : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                      }`}
                    >
                      <div className="font-semibold">Image</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Upload a background image</div>
                    </button>
                  </div>
                </div>

                {backgroundType === "color" && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-12 rounded-lg border border-[var(--border)] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {backgroundType === "image" && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Background Image</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleBackgroundImageChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-pink-500 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-pink-500/10 file:text-pink-500 file:font-medium"
                    />
                    {backgroundImage && (
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">Selected: {backgroundImage.name}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                    Opacity: {opacity}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                    className="w-full accent-pink-500"
                  />
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
                  <ImagePlus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Background Added!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Your PDF now has a custom background</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={addBackground}
                  disabled={files.length === 0 || isProcessing || (backgroundType === "image" && !backgroundImage)}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ImagePlus className="h-5 w-5" />
                  Add Background
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
                <button onClick={() => { setFiles([]); setResultUrl(null); setBackgroundImage(null); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
