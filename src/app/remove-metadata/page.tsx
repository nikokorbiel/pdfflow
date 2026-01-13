"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, ShieldOff, Sparkles, AlertCircle, Crown, Info } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

interface MetadataInfo {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export default function RemoveMetadata() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataInfo | null>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);

      try {
        const fileBuffer = await newFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);

        setMetadata({
          title: pdfDoc.getTitle(),
          author: pdfDoc.getAuthor(),
          subject: pdfDoc.getSubject(),
          keywords: pdfDoc.getKeywords(),
          creator: pdfDoc.getCreator(),
          producer: pdfDoc.getProducer(),
          creationDate: pdfDoc.getCreationDate(),
          modificationDate: pdfDoc.getModificationDate(),
        });
      } catch {
        setError("Failed to read PDF metadata");
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setMetadata(null);
  }, []);

  const removeMetadata = async () => {
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
      const pdfDoc = await PDFDocument.load(fileBuffer);

      setStatus("Removing metadata...");
      setProgress(50);

      // Remove all metadata
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);
      pdfDoc.setCreator("");
      pdfDoc.setProducer("");

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
      console.error("Metadata removal error:", err);
      setError("Failed to remove metadata. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_clean.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Not set";
    return date.toLocaleString();
  };

  const hasMetadata = metadata && (
    metadata.title || metadata.author || metadata.subject ||
    metadata.keywords || metadata.creator || metadata.producer ||
    metadata.creationDate || metadata.modificationDate
  );

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/20 to-rose-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                <ShieldOff className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Remove Metadata</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Strip all metadata from your PDF for privacy</p>
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

            {metadata && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-[var(--accent)]" />
                  <h3 className="font-semibold">Current Metadata</h3>
                </div>
                {hasMetadata ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {metadata.title && (
                      <div>
                        <span className="text-[var(--muted-foreground)]">Title:</span>
                        <span className="ml-2">{metadata.title}</span>
                      </div>
                    )}
                    {metadata.author && (
                      <div>
                        <span className="text-[var(--muted-foreground)]">Author:</span>
                        <span className="ml-2">{metadata.author}</span>
                      </div>
                    )}
                    {metadata.subject && (
                      <div>
                        <span className="text-[var(--muted-foreground)]">Subject:</span>
                        <span className="ml-2">{metadata.subject}</span>
                      </div>
                    )}
                    {metadata.keywords && (
                      <div>
                        <span className="text-[var(--muted-foreground)]">Keywords:</span>
                        <span className="ml-2">{metadata.keywords}</span>
                      </div>
                    )}
                    {metadata.creator && (
                      <div>
                        <span className="text-[var(--muted-foreground)]">Creator:</span>
                        <span className="ml-2">{metadata.creator}</span>
                      </div>
                    )}
                    {metadata.producer && (
                      <div>
                        <span className="text-[var(--muted-foreground)]">Producer:</span>
                        <span className="ml-2">{metadata.producer}</span>
                      </div>
                    )}
                    {metadata.creationDate && (
                      <div>
                        <span className="text-[var(--muted-foreground)]">Created:</span>
                        <span className="ml-2">{formatDate(metadata.creationDate)}</span>
                      </div>
                    )}
                    {metadata.modificationDate && (
                      <div>
                        <span className="text-[var(--muted-foreground)]">Modified:</span>
                        <span className="ml-2">{formatDate(metadata.modificationDate)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">No metadata found in this PDF.</p>
                )}
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 mb-4">
                  <ShieldOff className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Metadata Removed!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">All metadata has been stripped from your PDF</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={removeMetadata}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ShieldOff className="h-5 w-5" />
                  Remove Metadata
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download Clean PDF
                </button>
              )}
              {resultUrl && (
                <button onClick={() => { setFiles([]); setResultUrl(null); setMetadata(null); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
