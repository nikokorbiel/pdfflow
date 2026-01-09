"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { TemplateManager } from "@/components/TemplateManager";
import { Download, Droplets, Sparkles, Type, Image as ImageIcon } from "lucide-react";
import { getRemainingUsage, incrementUsage, getMaxFileSize } from "@/lib/usage";
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

export default function WatermarkPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
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
  const [applyToAll, setApplyToAll] = useState(true);
  const [specificPages, setSpecificPages] = useState("");

  // Templates
  const [templates, setTemplates] = useState<WatermarkTemplate[]>([]);

  // Initialize default templates on mount
  useEffect(() => {
    initializeDefaultWatermarkTemplates();
    setTemplates(getWatermarkTemplates());
  }, []);

  const remainingUsage = typeof window !== "undefined" ? getRemainingUsage() : 2;

  const handleSelectTemplate = (template: WatermarkTemplate) => {
    setWatermarkType(template.type);
    if (template.text) setWatermarkText(template.text);
    if (template.fontSize) setFontSize(template.fontSize);
    if (template.color) setColor(template.color);
    if (template.opacity) setOpacity(template.opacity);
    if (template.rotation) setRotation(template.rotation);
    if (template.position) {
      // Map template position to page position (handle "diagonal" -> "center")
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
    setFiles(newFiles.slice(0, 1)); // Only allow 1 file
    setResultUrl(null);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setWatermarkImage(file);
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

  const addWatermark = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
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

    if (remainingUsage <= 0) {
      setError("Daily limit reached. Upgrade to Pro for unlimited processing.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setStatus("Loading PDF...");
      const fileBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();

      setProgress(20);
      setStatus("Adding watermark...");

      // Determine which pages to watermark
      let pageIndices: number[] = [];
      if (applyToAll) {
        pageIndices = pages.map((_, i) => i);
      } else {
        // Parse specific pages (e.g., "1,3,5-7")
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

        for (let i = 0; i < pageIndices.length; i++) {
          const pageIndex = pageIndices[i];
          const page = pages[pageIndex];
          const { width, height } = page.getSize();

          setProgress(20 + ((i + 1) / pageIndices.length) * 60);

          if (position === "tiled") {
            // Tiled watermark
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
            // Single position watermark
            const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
            let x = 0,
              y = 0;

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
        // Image watermark
        const imageBuffer = await watermarkImage.arrayBuffer();
        let image;
        if (watermarkImage.type === "image/png") {
          image = await pdfDoc.embedPng(imageBuffer);
        } else {
          image = await pdfDoc.embedJpg(imageBuffer);
        }

        const imgDims = image.scale(0.5);

        for (let i = 0; i < pageIndices.length; i++) {
          const pageIndex = pageIndices[i];
          const page = pages[pageIndex];
          const { width, height } = page.getSize();

          setProgress(20 + ((i + 1) / pageIndices.length) * 60);

          let x = 0,
            y = 0;

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
            case "tiled":
              // For tiled, draw multiple
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
              continue;
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

      setStatus("Finalizing...");
      setProgress(90);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      incrementUsage();
    } catch (err) {
      console.error("Watermark error:", err);
      setError("Failed to add watermark. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "watermarked.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

          {/* Main content */}
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

            {/* Watermark Options */}
            {files.length > 0 && !isProcessing && !resultUrl && (
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
                      onClick={() => setWatermarkType("image")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                        watermarkType === "image"
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : "border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </button>
                  </div>
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

                {/* Image Upload */}
                {watermarkType === "image" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Upload Image</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500/10 file:text-purple-400"
                    />
                    {watermarkImage && (
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        Selected: {watermarkImage.name}
                      </p>
                    )}
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
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 text-sm text-red-500 animate-fade-in">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={addWatermark}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 px-8 py-4 font-medium text-white shadow-lg shadow-purple-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Droplets className="h-5 w-5" />
                  Add Watermark
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download Watermarked PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Watermark Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
