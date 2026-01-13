"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { TemplateManager } from "@/components/TemplateManager";
import { Download, Droplets, Sparkles, Type, Image as ImageIcon, Crown, Lock, Package, Check, Loader2, X } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import {
  WatermarkTemplate,
  getWatermarkTemplates,
  saveWatermarkTemplate,
  deleteWatermarkTemplate,
  initializeDefaultWatermarkTemplates,
} from "@/lib/templates";
import Link from "next/link";

type WatermarkType = "text" | "image";
type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "tiled";

interface ProcessedFile {
  name: string;
  blob: Blob;
  url: string;
}

export default function WatermarkPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Watermark options
  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-45);
  const [position, setPosition] = useState<Position>("center");
  const [color, setColor] = useState("#6b7280");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(0.5);
  const [applyToAll, setApplyToAll] = useState(true);
  const [specificPages, setSpecificPages] = useState("");

  // Templates
  const [templates, setTemplates] = useState<WatermarkTemplate[]>([]);

  // Initialize default templates on mount
  useEffect(() => {
    initializeDefaultWatermarkTemplates();
    setTemplates(getWatermarkTemplates());
  }, []);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  // Pro users can batch process up to 100 files
  const maxFiles = isPro ? 100 : 1;

  const handleSelectTemplate = (template: WatermarkTemplate) => {
    setWatermarkType(template.type);
    if (template.text) setWatermarkText(template.text);
    if (template.fontSize) setFontSize(template.fontSize);
    if (template.color) setColor(template.color);
    if (template.opacity) setOpacity(template.opacity);
    if (template.rotation) setRotation(template.rotation);
    if (template.position) {
      const posMap: Record<string, Position> = {
        center: "center",
        "top-left": "top-left",
        "top-right": "top-right",
        "bottom-left": "bottom-left",
        "bottom-right": "bottom-right",
        diagonal: "center",
      };
      setPosition(posMap[template.position] || "center");
    }
  };

  const handleSaveTemplate = (name: string) => {
    saveWatermarkTemplate({
      name,
      type: watermarkType,
      text: watermarkText,
      fontSize,
      color,
      opacity,
      rotation,
      position: position === "tiled" ? "center" : position,
    });
    setTemplates(getWatermarkTemplates());
  };

  const handleDeleteTemplate = (id: string) => {
    deleteWatermarkTemplate(id);
    setTemplates(getWatermarkTemplates());
  };

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles(prev => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, maxFiles);
      });
      setProcessedFiles([]);
      setError(null);
    }
  }, [maxFiles]);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setProcessedFiles([]);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setWatermarkImage(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const clearWatermarkImage = () => {
    setWatermarkImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0.5, g: 0.5, b: 0.5 };
  };

  const watermarkSinglePDF = async (file: File): Promise<ProcessedFile> => {
    const fileBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();

    // Determine which pages to watermark
    let pageIndices: number[] = [];
    if (applyToAll) {
      pageIndices = pages.map((_, i) => i);
    } else {
      const ranges = specificPages.split(",").map((s) => s.trim());
      for (const range of ranges) {
        if (range.includes("-")) {
          const [start, end] = range.split("-").map((n) => parseInt(n) - 1);
          for (let i = start; i <= end && i < pages.length; i++) {
            if (i >= 0) pageIndices.push(i);
          }
        } else {
          const pageNum = parseInt(range) - 1;
          if (pageNum >= 0 && pageNum < pages.length) {
            pageIndices.push(pageNum);
          }
        }
      }
    }

    const rgbColor = hexToRgb(color);

    if (watermarkType === "text") {
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      for (const pageIndex of pageIndices) {
        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        if (position === "tiled") {
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
          const spacingX = textWidth + 100;
          const spacingY = fontSize + 100;

          for (let x = 0; x < width + spacingX; x += spacingX) {
            for (let y = 0; y < height + spacingY; y += spacingY) {
              page.drawText(watermarkText, {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
                opacity,
                rotate: degrees(rotation),
              });
            }
          }
        } else {
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
          let x = 0, y = 0;

          switch (position) {
            case "center":
              x = (width - textWidth) / 2;
              y = height / 2;
              break;
            case "top-left":
              x = 50;
              y = height - 50 - fontSize;
              break;
            case "top-right":
              x = width - textWidth - 50;
              y = height - 50 - fontSize;
              break;
            case "bottom-left":
              x = 50;
              y = 50;
              break;
            case "bottom-right":
              x = width - textWidth - 50;
              y = 50;
              break;
          }

          page.drawText(watermarkText, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
            opacity,
            rotate: degrees(rotation),
          });
        }
      }
    } else if (watermarkType === "image" && watermarkImage) {
      const imageBuffer = await watermarkImage.arrayBuffer();
      let image;
      if (watermarkImage.type === "image/png") {
        image = await pdfDoc.embedPng(imageBuffer);
      } else {
        image = await pdfDoc.embedJpg(imageBuffer);
      }

      const imgDims = image.scale(imageScale);

      for (const pageIndex of pageIndices) {
        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        if (position === "tiled") {
          for (let tx = 0; tx < width; tx += imgDims.width + 50) {
            for (let ty = 0; ty < height; ty += imgDims.height + 50) {
              page.drawImage(image, {
                x: tx,
                y: ty,
                width: imgDims.width,
                height: imgDims.height,
                opacity,
                rotate: degrees(rotation),
              });
            }
          }
        } else {
          let x = 0, y = 0;

          switch (position) {
            case "center":
              x = (width - imgDims.width) / 2;
              y = (height - imgDims.height) / 2;
              break;
            case "top-left":
              x = 50;
              y = height - imgDims.height - 50;
              break;
            case "top-right":
              x = width - imgDims.width - 50;
              y = height - imgDims.height - 50;
              break;
            case "bottom-left":
              x = 50;
              y = 50;
              break;
            case "bottom-right":
              x = width - imgDims.width - 50;
              y = 50;
              break;
          }

          page.drawImage(image, {
            x,
            y,
            width: imgDims.width,
            height: imgDims.height,
            opacity,
            rotate: degrees(rotation),
          });
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return { name: file.name, blob, url };
  };

  const addWatermark = async () => {
    if (files.length === 0) {
      setError("Please select at least one PDF file");
      return;
    }

    if (watermarkType === "text" && !watermarkText.trim()) {
      setError("Please enter watermark text");
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      setError("Please upload a watermark image");
      return;
    }

    if (watermarkType === "image" && !isPro) {
      setError("Image watermarks are a Pro feature. Upgrade to access.");
      return;
    }

    if (!canProcess) {
      setError("Daily limit reached. Upgrade to Pro for unlimited processing.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setProcessedFiles([]);
    setCurrentFileIndex(0);

    const results: ProcessedFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i);
        setStatus(`Adding watermark to ${files[i].name} (${i + 1}/${files.length})...`);

        const baseProgress = (i / files.length) * 100;
        setProgress(baseProgress + 10);

        try {
          const result = await watermarkSinglePDF(files[i]);
          results.push(result);
          setProgress(baseProgress + 90);
        } catch (err) {
          console.error(`Error watermarking ${files[i].name}:`, err);
        }
      }

      setProcessedFiles(results);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Watermark error:", err);
      setError("Failed to add watermark. Please ensure all files are valid PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingleFile = (processed: ProcessedFile) => {
    const link = document.createElement("a");
    link.href = processed.url;
    link.download = `watermarked_${processed.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (processedFiles.length === 0) return;

    const zip = new JSZip();

    for (const file of processedFiles) {
      zip.file(`watermarked_${file.name}`, file.blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "watermarked_pdfs.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFiles([]);
    setProcessedFiles([]);
    setProgress(0);
    setError(null);
    setCurrentFileIndex(0);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-400 shadow-lg">
                <Droplets className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Add Watermark
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Protect your documents with custom watermarks
            </p>
          </div>

          {/* Usage indicator */}
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
              {isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <span className="text-sm text-amber-500 font-medium">
                    Batch + Image watermarks
                  </span>
                </>
              )}
              {!isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <Link href="/pricing" className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity">
                    Upgrade for image watermarks
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="mt-12 space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <FileDropzone
              onFilesSelected={handleFilesSelected}
              accept=".pdf,application/pdf"
              multiple={isPro}
              maxSize={maxFileSize}
              maxFiles={maxFiles}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={isProcessing}
            />

            {/* Batch indicator for Pro users */}
            {isPro && files.length > 1 && !isProcessing && processedFiles.length === 0 && (
              <div className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-500">Batch Processing Mode</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {files.length} files will be watermarked with the same settings
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Watermark Options */}
            {files.length > 0 && !isProcessing && processedFiles.length === 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in space-y-6">
                {/* Templates */}
                <div className="flex items-center justify-between">
                  <TemplateManager
                    templates={templates}
                    onSelect={handleSelectTemplate}
                    onSave={handleSaveTemplate}
                    onDelete={handleDeleteTemplate}
                    label="Watermark Templates"
                    renderPreview={(template) => (
                      <div className="flex items-center gap-2 text-xs">
                        {template.type === "text" && (
                          <>
                            <span
                              className="px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${template.color}20`,
                                color: template.color,
                              }}
                            >
                              {template.text}
                            </span>
                            <span className="text-[var(--text-muted)]">
                              {template.fontSize}px, {Math.round((template.opacity || 0.3) * 100)}%
                            </span>
                          </>
                        )}
                        {template.type === "image" && (
                          <span className="text-[var(--text-muted)]">Image watermark</span>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Watermark Type</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setWatermarkType("text")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                        watermarkType === "text"
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : "border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <Type className="h-4 w-4" />
                      Text
                    </button>
                    <button
                      onClick={() => isPro && setWatermarkType("image")}
                      disabled={!isPro}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all relative ${
                        watermarkType === "image"
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : !isPro
                          ? "border-[var(--border)] opacity-60 cursor-not-allowed"
                          : "border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <ImageIcon className="h-4 w-4" />
                      Image
                      {!isPro && (
                        <Lock className="h-3 w-3 absolute top-2 right-2 text-[var(--muted-foreground)]" />
                      )}
                    </button>
                  </div>
                  {!isPro && (
                    <p className="mt-2 text-xs text-amber-500">
                      Image watermarks are a Pro feature
                    </p>
                  )}
                </div>

                {/* Text Options */}
                {watermarkType === "text" && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Watermark Text</label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter watermark text"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Font Size: {fontSize}px</label>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Color</label>
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-full h-10 rounded-xl cursor-pointer"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Image Upload (Pro only) */}
                {watermarkType === "image" && isPro && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Upload Image</label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleImageUpload}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500/10 file:text-purple-400"
                      />
                    </div>

                    {/* Image Preview */}
                    {imagePreviewUrl && (
                      <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreviewUrl}
                          alt="Watermark preview"
                          className="max-h-32 rounded-lg border"
                          style={{ opacity }}
                        />
                        <button
                          onClick={clearWatermarkImage}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                          {watermarkImage?.name}
                        </p>
                      </div>
                    )}

                    {/* Image Scale */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Image Size: {Math.round(imageScale * 100)}%</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.5"
                        step="0.05"
                        value={imageScale}
                        onChange={(e) => setImageScale(Number(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Common Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Opacity: {Math.round(opacity * 100)}%</label>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rotation: {rotation}°</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["top-left", "center", "top-right", "bottom-left", "tiled", "bottom-right"] as Position[]).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPosition(pos)}
                        className={`py-2 px-3 rounded-xl text-xs border transition-all ${
                          position === pos
                            ? "bg-purple-500/10 border-purple-500 text-purple-400"
                            : "border-[var(--border)] hover:bg-[var(--muted)]"
                        }`}
                      >
                        {pos.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Apply to Pages</label>
                  <div className="flex gap-3 mb-2">
                    <button
                      onClick={() => setApplyToAll(true)}
                      className={`flex-1 py-2 rounded-xl border transition-all ${
                        applyToAll
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : "border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      All Pages
                    </button>
                    <button
                      onClick={() => setApplyToAll(false)}
                      className={`flex-1 py-2 rounded-xl border transition-all ${
                        !applyToAll
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : "border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      Specific Pages
                    </button>
                  </div>
                  {!applyToAll && (
                    <input
                      type="text"
                      value={specificPages}
                      onChange={(e) => setSpecificPages(e.target.value)}
                      placeholder="e.g., 1, 3, 5-7"
                      className="w-full px-4 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <ProgressBar progress={progress} status={status} />
                {files.length > 1 && (
                  <p className="mt-3 text-sm text-center text-[var(--muted-foreground)]">
                    Processing file {currentFileIndex + 1} of {files.length}
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 text-sm text-red-500 animate-fade-in">
                {error}
              </div>
            )}

            {/* Results */}
            {processedFiles.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                {/* Summary */}
                <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {processedFiles.length} PDF{processedFiles.length > 1 ? "s" : ""} watermarked
                    </span>
                  </div>
                </div>

                {/* Individual files table */}
                {processedFiles.length > 1 && (
                  <div className="rounded-3xl border bg-[var(--card)] overflow-hidden shadow-glass">
                    <div className="p-4 border-b border-[var(--border)]">
                      <h3 className="font-semibold">Processed Files</h3>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {processedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 hover:bg-[var(--muted)]/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Check className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadSingleFile(file)}
                            className="flex-shrink-0 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4 text-[var(--muted-foreground)]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {processedFiles.length === 0 ? (
                <button
                  onClick={addWatermark}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 px-8 py-4 font-medium text-white shadow-lg shadow-purple-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Droplets className="h-5 w-5" />
                  )}
                  {files.length > 1 ? `Watermark ${files.length} PDFs` : "Add Watermark"}
                </button>
              ) : (
                <>
                  {processedFiles.length === 1 ? (
                    <button
                      onClick={() => downloadSingleFile(processedFiles[0])}
                      className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all"
                    >
                      <Download className="h-5 w-5" />
                      Download Watermarked PDF
                    </button>
                  ) : (
                    <button
                      onClick={downloadAllAsZip}
                      className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all"
                    >
                      <Package className="h-5 w-5" />
                      Download All as ZIP ({processedFiles.length} files)
                    </button>
                  )}
                </>
              )}

              {processedFiles.length > 0 && (
                <button
                  onClick={resetAll}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Watermark More PDFs
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
