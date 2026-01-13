"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Code, Sparkles, Globe, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function HTMLToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [htmlContent, setHtmlContent] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "url" | "paste">("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const convertToPDF = async () => {
    if (inputMode === "file" && files.length === 0) {
      setError("Please select an HTML file");
      return;
    }
    if (inputMode === "paste" && !htmlContent.trim()) {
      setError("Please paste HTML content");
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
      setStatus("Processing HTML...");
      setProgress(20);

      let html = "";

      if (inputMode === "file") {
        html = await files[0].text();
      } else if (inputMode === "paste") {
        html = htmlContent;
      }

      // Create a hidden container to render the HTML
      setStatus("Rendering HTML...");
      setProgress(40);

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "800px";
      container.style.backgroundColor = "#ffffff";
      container.style.padding = "40px";
      container.style.fontFamily = "system-ui, -apple-system, sans-serif";
      container.innerHTML = html;
      document.body.appendChild(container);

      // Wait for content and images to load
      await new Promise(resolve => setTimeout(resolve, 300));

      // Wait for any images to load
      const images = container.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve(true);
              else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
              }
            })
        )
      );

      setStatus("Creating PDF...");
      setProgress(60);

      // Use html2canvas to capture the content
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Clean up container
      document.body.removeChild(container);

      setProgress(80);

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Conversion error:", err);
      setError("Failed to convert HTML. Please ensure the content is valid HTML.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = files[0]?.name.replace(/\.html?$/i, "") || "document";
    link.download = `${baseName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-400 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-400 shadow-lg">
                <Code className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              HTML to PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Convert HTML pages and code to PDF documents
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                {isPro ? (
                  <>
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Unlimited
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {usageDisplay}
                    </span>
                  </>
                )}
              </div>
              {!isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <Link href="/pricing" className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity">
                    Upgrade
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {/* Input mode toggle */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setInputMode("file")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${inputMode === "file" ? "bg-[var(--accent)] text-white" : "bg-[var(--muted)] hover:bg-[var(--muted)]/80"}`}
              >
                Upload File
              </button>
              <button
                onClick={() => setInputMode("paste")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${inputMode === "paste" ? "bg-[var(--accent)] text-white" : "bg-[var(--muted)] hover:bg-[var(--muted)]/80"}`}
              >
                Paste HTML
              </button>
            </div>

            {inputMode === "file" && (
              <FileDropzone
                onFilesSelected={handleFilesSelected}
                accept=".html,.htm,text/html"
                multiple={false}
                maxSize={maxFileSize}
                maxFiles={1}
                files={files}
                onRemoveFile={handleRemoveFile}
                disabled={isProcessing}
              />
            )}

            {inputMode === "paste" && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <label className="block text-sm font-medium mb-2">Paste HTML Code</label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>"
                  rows={10}
                  className="w-full rounded-2xl border bg-[var(--background)] px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none"
                />
              </div>
            )}

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

            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10">
                    <Globe className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium">PDF ready</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Your HTML has been converted to PDF</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-[var(--muted)]/50 border border-[var(--border)] p-5 animate-fade-in">
              <p className="text-sm text-[var(--muted-foreground)] text-center">
                <strong className="text-foreground">Note:</strong> This converts static HTML content.
                <br className="hidden sm:block" />
                <span className="text-[var(--accent)]"> Upgrade to Pro</span> for URL-to-PDF conversion and advanced rendering.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={convertToPDF}
                  disabled={(inputMode === "file" && files.length === 0) || (inputMode === "paste" && !htmlContent.trim()) || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-400 px-8 py-4 font-medium text-white shadow-lg shadow-violet-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Code className="h-5 w-5" />
                  Convert to PDF
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
                    setHtmlContent("");
                    setResultUrl(null);
                    setProgress(0);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Convert Another
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
