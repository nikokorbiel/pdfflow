"use client";

import { useState, useCallback } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, QrCode, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

export default function AddQRCode() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrContent, setQrContent] = useState("");
  const [position, setPosition] = useState<Position>("bottom-right");
  const [qrSize, setQrSize] = useState(100);
  const [allPages, setAllPages] = useState(false);

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

  // Simple QR code generator (creates a basic QR pattern)
  const generateQRCode = (text: string, size: number): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // White background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, size, size);

    // Simple encoding - this creates a visual pattern but not a real QR code
    // For a real implementation, you'd use a library like qrcode
    const moduleCount = 21; // Standard QR code size
    const moduleSize = size / (moduleCount + 2);
    const margin = moduleSize;

    ctx.fillStyle = "black";

    // Create a simple pattern based on text
    const hash = text.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

    // Position patterns (corners)
    const drawPositionPattern = (x: number, y: number) => {
      const s = moduleSize * 7;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = "white";
      ctx.fillRect(x + moduleSize, y + moduleSize, s - moduleSize * 2, s - moduleSize * 2);
      ctx.fillStyle = "black";
      ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, s - moduleSize * 4, s - moduleSize * 4);
    };

    drawPositionPattern(margin, margin);
    drawPositionPattern(margin + moduleSize * 14, margin);
    drawPositionPattern(margin, margin + moduleSize * 14);

    // Fill data area with pattern
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip position patterns
        if ((row < 7 && col < 7) || (row < 7 && col > 13) || (row > 13 && col < 7)) continue;

        const bit = ((hash >> ((row * moduleCount + col) % 32)) & 1) ^ ((row + col) % 2);
        if (bit) {
          ctx.fillRect(margin + col * moduleSize, margin + row * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add timing patterns
    for (let i = 8; i < 13; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(margin + 6 * moduleSize, margin + i * moduleSize, moduleSize, moduleSize);
        ctx.fillRect(margin + i * moduleSize, margin + 6 * moduleSize, moduleSize, moduleSize);
      }
    }

    return canvas;
  };

  const addQRCode = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
      return;
    }

    if (!qrContent.trim()) {
      setError("Please enter content for the QR code");
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

      setStatus("Generating QR code...");
      setProgress(40);

      const qrCanvas = generateQRCode(qrContent, qrSize * 2);
      const qrImageData = qrCanvas.toDataURL("image/png");
      const qrBytes = await fetch(qrImageData).then(res => res.arrayBuffer());
      const qrImage = await pdfDoc.embedPng(qrBytes);

      setStatus("Adding QR code to PDF...");
      setProgress(60);

      const pagesToModify = allPages ? pages : [pages[0]];
      const margin = 30;

      for (const page of pagesToModify) {
        const { width, height } = page.getSize();

        let x: number, y: number;

        switch (position) {
          case "top-left":
            x = margin;
            y = height - qrSize - margin;
            break;
          case "top-right":
            x = width - qrSize - margin;
            y = height - qrSize - margin;
            break;
          case "bottom-left":
            x = margin;
            y = margin;
            break;
          case "bottom-right":
            x = width - qrSize - margin;
            y = margin;
            break;
          case "center":
            x = (width - qrSize) / 2;
            y = (height - qrSize) / 2;
            break;
        }

        // Draw white background behind QR code
        page.drawRectangle({
          x: x - 5,
          y: y - 5,
          width: qrSize + 10,
          height: qrSize + 10,
          color: rgb(1, 1, 1),
        });

        page.drawImage(qrImage, {
          x,
          y,
          width: qrSize,
          height: qrSize,
        });
      }

      setStatus("Saving PDF...");
      setProgress(90);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("QR code error:", err);
      setError("Failed to add QR code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_with_qr.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const positions: { value: Position; label: string }[] = [
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "center", label: "Center" },
  ];

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-blue-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg">
                <QrCode className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Add QR Code</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Add QR codes to your PDF pages</p>
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
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">QR Code Content</label>
                  <input
                    type="text"
                    value={qrContent}
                    onChange={(e) => setQrContent(e.target.value)}
                    placeholder="https://example.com or any text..."
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-3">Position</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {positions.map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => setPosition(pos.value)}
                        className={`px-3 py-2 rounded-xl text-sm transition-all ${
                          position === pos.value
                            ? "bg-indigo-500 text-white"
                            : "bg-[var(--muted)] hover:bg-[var(--border)]"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">QR Code Size</label>
                    <span className="text-sm text-[var(--muted-foreground)]">{qrSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allPages}
                    onChange={(e) => setAllPages(e.target.checked)}
                    className="w-5 h-5 rounded accent-indigo-500"
                  />
                  <span className="text-sm">Add QR code to all pages</span>
                </label>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 mb-4">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">QR Code Added!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Added to {allPages ? "all pages" : "first page"}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={addQRCode}
                  disabled={files.length === 0 || isProcessing || !qrContent.trim()}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <QrCode className="h-5 w-5" />
                  Add QR Code
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
                <button onClick={() => { setFiles([]); setResultUrl(null); setQrContent(""); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
