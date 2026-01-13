"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Paperclip, Sparkles, AlertCircle, Crown, File } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

export default function AddAttachment() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handlePdfSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setPdfFile(newFiles[0]);
      setResultUrl(null);
      setError(null);
    }
  }, []);

  const handleAttachmentsSelected = useCallback((newFiles: File[]) => {
    setAttachments(prev => [...prev, ...newFiles]);
    setResultUrl(null);
    setError(null);
  }, []);

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addAttachments = async () => {
    if (!pdfFile) {
      setError("Please select a PDF file");
      return;
    }

    if (attachments.length === 0) {
      setError("Please add at least one attachment");
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

      const pdfBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      setStatus("Adding attachments...");

      for (let i = 0; i < attachments.length; i++) {
        setProgress(20 + ((i / attachments.length) * 60));
        setStatus(`Adding ${attachments[i].name}...`);

        const attachmentBuffer = await attachments[i].arrayBuffer();
        await pdfDoc.attach(new Uint8Array(attachmentBuffer), attachments[i].name, {
          mimeType: attachments[i].type || "application/octet-stream",
          description: `Attached file: ${attachments[i].name}`,
          creationDate: new Date(),
          modificationDate: new Date(),
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
      console.error("Attachment error:", err);
      setError("Failed to add attachments. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = pdfFile?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_with_attachments.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg">
                <Paperclip className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Add Attachment</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Embed files inside your PDF</p>
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
            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">PDF File</label>
              <FileDropzone
                onFilesSelected={handlePdfSelected}
                accept=".pdf,application/pdf"
                multiple={false}
                maxSize={maxFileSize}
                maxFiles={1}
                files={pdfFile ? [pdfFile] : []}
                onRemoveFile={() => setPdfFile(null)}
                disabled={isProcessing}
              />
            </div>

            {pdfFile && !resultUrl && (
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Attachments</label>
                <FileDropzone
                  onFilesSelected={handleAttachmentsSelected}
                  accept="*/*"
                  multiple={true}
                  maxSize={maxFileSize}
                  maxFiles={20}
                  files={[]}
                  onRemoveFile={() => {}}
                  disabled={isProcessing}
                />

                {attachments.length > 0 && (
                  <div className="mt-4 rounded-xl border bg-[var(--card)] p-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]">
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5 text-teal-500" />
                          <div>
                            <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 mb-4">
                  <Paperclip className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Attachments Added!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {attachments.length} file{attachments.length !== 1 ? "s" : ""} embedded in PDF
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={addAttachments}
                  disabled={!pdfFile || attachments.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Paperclip className="h-5 w-5" />
                  Add Attachments
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
                <button onClick={() => { setPdfFile(null); setAttachments([]); setResultUrl(null); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
