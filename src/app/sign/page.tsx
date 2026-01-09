"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, PenTool, Sparkles, Type, Pencil, Upload, Trash2, Check } from "lucide-react";
import {
  getRemainingUsage,
  incrementUsage,
  getMaxFileSize,
} from "@/lib/usage";
import Link from "next/link";

type SignatureMode = "draw" | "type" | "upload";

interface PlacedSignature {
  id: string;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
}

export default function SignPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Signature creation
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState("Dancing Script");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // PDF preview and signature placement
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
  const [isPlacing, setIsPlacing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const remainingUsage = typeof window !== "undefined" ? getRemainingUsage() : 2;

  // Initialize drawing canvas
  useEffect(() => {
    if (signatureMode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [signatureMode]);

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setPlacedSignatures([]);
      setPageImages([]);

      // Generate page previews
      setIsLoadingPreview(true);
      try {
        // Dynamic import to avoid SSR issues with pdfjs-dist
        const { generatePdfThumbnails } = await import("@/lib/pdf-utils");
        const images = await generatePdfThumbnails(newFiles[0], 1);
        setPageImages(images);
        setCurrentPage(0);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF. Please try another file.");
      } finally {
        setIsLoadingPreview(false);
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setPageImages([]);
    setPlacedSignatures([]);
  }, []);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();

    let x, y;
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();

    let x, y;
    if ("touches" in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveSignature = () => {
    if (signatureMode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    } else if (signatureMode === "type" && typedName.trim()) {
      // Create signature from text
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d")!;

      ctx.font = `48px "${selectedFont}", cursive`;
      ctx.fillStyle = "#000";
      ctx.textBaseline = "middle";
      ctx.fillText(typedName, 10, 50);

      setSignatureDataUrl(canvas.toDataURL("image/png"));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceSignature = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacing || !signatureDataUrl || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newSignature: PlacedSignature = {
      id: `sig-${Date.now()}`,
      dataUrl: signatureDataUrl,
      x: Math.max(0, Math.min(85, x - 7.5)),
      y: Math.max(0, Math.min(90, y - 5)),
      width: 15,
      height: 10,
      pageIndex: currentPage,
    };

    setPlacedSignatures([...placedSignatures, newSignature]);
    setIsPlacing(false);
  };

  const removeSignature = (id: string) => {
    setPlacedSignatures(placedSignatures.filter((s) => s.id !== id));
  };

  const signPDF = async () => {
    if (files.length === 0 || placedSignatures.length === 0) {
      setError("Please add at least one signature to the document");
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
      setProgress(20);

      const fileBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      const pages = pdf.getPages();

      setStatus("Adding signatures...");

      for (let i = 0; i < placedSignatures.length; i++) {
        const sig = placedSignatures[i];
        setProgress(20 + ((i + 1) / placedSignatures.length) * 60);
        setStatus(`Adding signature ${i + 1} of ${placedSignatures.length}...`);

        const page = pages[sig.pageIndex];
        const { width, height } = page.getSize();

        // Convert signature to embeddable image
        const sigImageBytes = await fetch(sig.dataUrl).then((r) => r.arrayBuffer());
        const sigImage = await pdf.embedPng(new Uint8Array(sigImageBytes));

        const sigWidth = (sig.width / 100) * width;
        const sigHeight = (sig.height / 100) * height;
        const sigX = (sig.x / 100) * width;
        const sigY = height - (sig.y / 100) * height - sigHeight;

        page.drawImage(sigImage, {
          x: sigX,
          y: sigY,
          width: sigWidth,
          height: sigHeight,
        });
      }

      setStatus("Saving PDF...");
      setProgress(90);

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      incrementUsage();
    } catch (err) {
      console.error("Sign error:", err);
      setError("Failed to sign PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_signed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fonts = [
    { name: "Dancing Script", style: "cursive" },
    { name: "Great Vibes", style: "cursive" },
    { name: "Pacifico", style: "cursive" },
    { name: "Caveat", style: "cursive" },
  ];

  const currentPageSignatures = placedSignatures.filter((s) => s.pageIndex === currentPage);

  return (
    <div className="min-h-[80vh]">
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat&family=Dancing+Script&family=Great+Vibes&family=Pacifico&display=swap"
        rel="stylesheet"
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-400/10 to-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                <PenTool className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Sign PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Add your signature to any PDF document
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
            {pageImages.length === 0 && (
              <FileDropzone
                onFilesSelected={handleFilesSelected}
                accept=".pdf,application/pdf"
                multiple={false}
                maxSize={getMaxFileSize()}
                maxFiles={1}
                files={files}
                onRemoveFile={handleRemoveFile}
                disabled={isProcessing || isLoadingPreview}
              />
            )}

            {/* Loading preview */}
            {isLoadingPreview && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass animate-fade-in">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                  <p className="text-[var(--muted-foreground)]">Loading document...</p>
                </div>
              </div>
            )}

            {/* Signature creation + PDF preview */}
            {pageImages.length > 0 && !resultUrl && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Signature creation panel */}
                <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                  <h3 className="text-lg font-semibold mb-4">Create Your Signature</h3>

                  {/* Mode tabs */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setSignatureMode("draw")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                        signatureMode === "draw"
                          ? "bg-emerald-500 text-white"
                          : "border border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <Pencil className="h-4 w-4" />
                      Draw
                    </button>
                    <button
                      onClick={() => setSignatureMode("type")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                        signatureMode === "type"
                          ? "bg-emerald-500 text-white"
                          : "border border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <Type className="h-4 w-4" />
                      Type
                    </button>
                    <button
                      onClick={() => setSignatureMode("upload")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                        signatureMode === "upload"
                          ? "bg-emerald-500 text-white"
                          : "border border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </button>
                  </div>

                  {/* Draw mode */}
                  {signatureMode === "draw" && (
                    <div>
                      <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-2 bg-white">
                        <canvas
                          ref={canvasRef}
                          width={350}
                          height={120}
                          className="w-full cursor-crosshair touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={clearCanvas}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Clear
                        </button>
                        <button
                          onClick={saveSignature}
                          disabled={!hasDrawn}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          Use Signature
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Type mode */}
                  {signatureMode === "type" && (
                    <div>
                      <input
                        type="text"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        placeholder="Type your name..."
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-black text-2xl focus:border-emerald-500 focus:outline-none transition-colors"
                        style={{ fontFamily: `"${selectedFont}", cursive` }}
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {fonts.map((font) => (
                          <button
                            key={font.name}
                            onClick={() => setSelectedFont(font.name)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                              selectedFont === font.name
                                ? "bg-emerald-500 text-white"
                                : "border border-[var(--border)] hover:bg-[var(--muted)]"
                            }`}
                            style={{ fontFamily: `"${font.name}", ${font.style}` }}
                          >
                            {font.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={saveSignature}
                        disabled={!typedName.trim()}
                        className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Use Signature
                      </button>
                    </div>
                  )}

                  {/* Upload mode */}
                  {signatureMode === "upload" && (
                    <div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)] transition-colors">
                        <Upload className="h-8 w-8 text-[var(--muted-foreground)] mb-2" />
                        <span className="text-sm text-[var(--muted-foreground)]">
                          Click to upload signature image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* Current signature preview */}
                  {signatureDataUrl && (
                    <div className="mt-4 p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                      <p className="text-sm text-[var(--muted-foreground)] mb-2">Your signature:</p>
                      <div className="bg-white rounded-lg p-2 inline-block">
                        <img src={signatureDataUrl} alt="Signature" className="h-12 object-contain" />
                      </div>
                      <button
                        onClick={() => setIsPlacing(true)}
                        className="ml-4 px-4 py-2 rounded-xl text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                      >
                        Place on Document
                      </button>
                    </div>
                  )}
                </div>

                {/* PDF preview panel */}
                <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Document Preview</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-3 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-50 transition-colors"
                      >
                        Prev
                      </button>
                      <span className="text-sm">
                        {currentPage + 1} / {pageImages.length}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(pageImages.length - 1, currentPage + 1))}
                        disabled={currentPage === pageImages.length - 1}
                        className="px-3 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  <div
                    ref={previewRef}
                    onClick={handlePlaceSignature}
                    className={`relative rounded-xl overflow-hidden border-2 ${
                      isPlacing
                        ? "border-emerald-500 cursor-crosshair"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <img
                      src={pageImages[currentPage]}
                      alt={`Page ${currentPage + 1}`}
                      className="w-full h-auto"
                      draggable={false}
                    />

                    {/* Placed signatures on current page */}
                    {currentPageSignatures.map((sig) => (
                      <div
                        key={sig.id}
                        className="absolute group"
                        style={{
                          left: `${sig.x}%`,
                          top: `${sig.y}%`,
                          width: `${sig.width}%`,
                          height: `${sig.height}%`,
                        }}
                      >
                        <img src={sig.dataUrl} alt="Signature" className="w-full h-full object-contain" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSignature(sig.id);
                          }}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {isPlacing && (
                      <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                        <p className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                          Click to place signature
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-[var(--muted-foreground)] text-center">
                    {placedSignatures.length} signature{placedSignatures.length !== 1 ? "s" : ""} added
                  </p>
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

            {/* Success result */}
            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
                    <PenTool className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Document Signed!</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Your signed PDF is ready to download
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={signPDF}
                  disabled={placedSignatures.length === 0 || isProcessing || isLoadingPreview}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <PenTool className="h-5 w-5" />
                  Sign & Save PDF
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Signed PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                    setPageImages([]);
                    setPlacedSignatures([]);
                    setSignatureDataUrl(null);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Sign Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
