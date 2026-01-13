"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { Info, FileText, Sparkles, AlertCircle, Crown, Calendar, User, Hash, File } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

interface PDFInfo {
  pageCount: number;
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
  pages: Array<{
    number: number;
    width: number;
    height: number;
    rotation: number;
  }>;
}

export default function PageInfo() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);

  const { isPro, maxFileSize, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setError(null);
      setIsProcessing(true);

      try {
        const fileBuffer = await newFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });

        const pages = pdfDoc.getPages();
        const pageInfo = pages.map((page, index) => ({
          number: index + 1,
          width: Math.round(page.getWidth() * 100) / 100,
          height: Math.round(page.getHeight() * 100) / 100,
          rotation: page.getRotation().angle,
        }));

        setPdfInfo({
          pageCount: pdfDoc.getPageCount(),
          title: pdfDoc.getTitle() || "Not set",
          author: pdfDoc.getAuthor() || "Not set",
          subject: pdfDoc.getSubject() || "Not set",
          creator: pdfDoc.getCreator() || "Not set",
          producer: pdfDoc.getProducer() || "Not set",
          creationDate: pdfDoc.getCreationDate()?.toLocaleDateString() || "Not set",
          modificationDate: pdfDoc.getModificationDate()?.toLocaleDateString() || "Not set",
          pages: pageInfo,
        });
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to read PDF information");
      } finally {
        setIsProcessing(false);
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setPdfInfo(null);
  }, []);

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-teal-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-500 shadow-lg">
                <Info className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Page Info</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">View detailed information about your PDF</p>
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

            {isProcessing && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass text-center">
                <p className="text-[var(--muted-foreground)]">Analyzing PDF...</p>
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

            {pdfInfo && (
              <div className="space-y-6">
                {/* Document Info */}
                <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-500" />
                    Document Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)]">
                      <Hash className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Pages</p>
                        <p className="font-medium">{pdfInfo.pageCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)]">
                      <File className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Title</p>
                        <p className="font-medium truncate">{pdfInfo.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)]">
                      <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Author</p>
                        <p className="font-medium truncate">{pdfInfo.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)]">
                      <Calendar className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Created</p>
                        <p className="font-medium">{pdfInfo.creationDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page Details */}
                <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                  <h3 className="font-semibold mb-4">Page Dimensions</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {pdfInfo.pages.map((page) => (
                      <div key={page.number} className="flex items-center justify-between p-3 rounded-xl bg-[var(--muted)]">
                        <span className="font-medium">Page {page.number}</span>
                        <div className="text-sm text-[var(--muted-foreground)]">
                          {page.width} × {page.height} pts
                          {page.rotation > 0 && <span className="ml-2">(rotated {page.rotation}°)</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Metadata */}
                <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                  <h3 className="font-semibold mb-4">Additional Metadata</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2">
                      <span className="text-[var(--muted-foreground)]">Subject</span>
                      <span>{pdfInfo.subject}</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span className="text-[var(--muted-foreground)]">Creator</span>
                      <span>{pdfInfo.creator}</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span className="text-[var(--muted-foreground)]">Producer</span>
                      <span>{pdfInfo.producer}</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span className="text-[var(--muted-foreground)]">Modified</span>
                      <span>{pdfInfo.modificationDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {pdfInfo && (
              <button
                onClick={() => { setFiles([]); setPdfInfo(null); }}
                className="w-full flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
              >
                Analyze Another PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
