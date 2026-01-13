"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, FileText, Sparkles, AlertCircle, Crown, Save } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
}

export default function EditMetadata() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<PDFMetadata>({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
    creationDate: "",
    modificationDate: "",
  });

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);

      try {
        const fileBuffer = await newFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });

        setMetadata({
          title: pdfDoc.getTitle() || "",
          author: pdfDoc.getAuthor() || "",
          subject: pdfDoc.getSubject() || "",
          keywords: pdfDoc.getKeywords() || "",
          creator: pdfDoc.getCreator() || "",
          producer: pdfDoc.getProducer() || "",
          creationDate: pdfDoc.getCreationDate()?.toISOString().split("T")[0] || "",
          modificationDate: pdfDoc.getModificationDate()?.toISOString().split("T")[0] || "",
        });
      } catch (err) {
        console.error("Error reading metadata:", err);
        setError("Failed to read PDF metadata");
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setMetadata({
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "",
      producer: "",
      creationDate: "",
      modificationDate: "",
    });
  }, []);

  const saveMetadata = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
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
      const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });

      setStatus("Updating metadata...");
      setProgress(50);

      if (metadata.title) pdfDoc.setTitle(metadata.title);
      if (metadata.author) pdfDoc.setAuthor(metadata.author);
      if (metadata.subject) pdfDoc.setSubject(metadata.subject);
      if (metadata.keywords) pdfDoc.setKeywords([metadata.keywords]);
      if (metadata.creator) pdfDoc.setCreator(metadata.creator);
      if (metadata.producer) pdfDoc.setProducer(metadata.producer);

      setStatus("Saving PDF...");
      setProgress(80);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Metadata error:", err);
      setError("Failed to update metadata. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_edited.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Edit Metadata
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              View and edit PDF document properties
            </p>
          </div>

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
              {!isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <Link
                    href="/pricing"
                    className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
                  >
                    Upgrade
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
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
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  Document Properties
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                      placeholder="Document title"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={metadata.author}
                      onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                      placeholder="Author name"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={metadata.subject}
                      onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                      placeholder="Document subject"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={metadata.keywords}
                      onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                      placeholder="Comma-separated keywords"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                      Creator
                    </label>
                    <input
                      type="text"
                      value={metadata.creator}
                      onChange={(e) => setMetadata({ ...metadata, creator: e.target.value })}
                      placeholder="Application that created the PDF"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                      Producer
                    </label>
                    <input
                      type="text"
                      value={metadata.producer}
                      onChange={(e) => setMetadata({ ...metadata, producer: e.target.value })}
                      placeholder="PDF producer"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                {(metadata.creationDate || metadata.modificationDate) && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)] grid gap-4 sm:grid-cols-2 text-sm text-[var(--muted-foreground)]">
                    {metadata.creationDate && (
                      <div>Created: {metadata.creationDate}</div>
                    )}
                    {metadata.modificationDate && (
                      <div>Modified: {metadata.modificationDate}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <ProgressBar progress={progress} status={status} />
              </div>
            )}

            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-4">
                    <Save className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Metadata Updated!</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Your PDF properties have been saved
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={saveMetadata}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 font-medium text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Save className="h-5 w-5" />
                  Save Metadata
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
                    setResultUrl(null);
                    setProgress(0);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Edit Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
