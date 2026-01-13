"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { List, Sparkles, AlertCircle, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface OutlineItem {
  title: string;
  page: number;
  level: number;
  children?: OutlineItem[];
}

export default function PdfOutline() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isPro, canProcess, maxFileSize, usageDisplay } = useToolUsage();

  const loadPdfJs = async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    return pdfjsLib;
  };

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setOutline([]);
      setError(null);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setOutline([]);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processOutlineItem = async (item: any, pdf: PDFDocumentProxy, level: number): Promise<OutlineItem> => {
    let pageNum = 1;

    if (item.dest) {
      try {
        let dest = item.dest;
        if (typeof dest === "string") {
          dest = await pdf.getDestination(dest);
        }
        if (dest && dest[0]) {
          const ref = dest[0];
          const pageIndex = await pdf.getPageIndex(ref);
          pageNum = pageIndex + 1;
        }
      } catch {
        // Keep default page 1
      }
    }

    const outlineItem: OutlineItem = {
      title: item.title || "Untitled",
      page: pageNum,
      level,
    };

    if (item.items && item.items.length > 0) {
      outlineItem.children = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item.items.map((child: any) => processOutlineItem(child, pdf, level + 1))
      );
    }

    return outlineItem;
  };

  const extractOutline = async () => {
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
      setProgress(30);

      const pdfjsLib = await loadPdfJs();
      const fileBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise as PDFDocumentProxy;

      setStatus("Extracting outline...");
      setProgress(60);

      const pdfOutline = await pdf.getOutline();

      if (!pdfOutline || pdfOutline.length === 0) {
        setError("This PDF has no outline/bookmarks");
        setIsProcessing(false);
        return;
      }

      const processedOutline = await Promise.all(
        pdfOutline.map((item) => processOutlineItem(item, pdf, 0))
      );

      setOutline(processedOutline);
      setProgress(100);
      setStatus("Complete!");
    } catch (err) {
      console.error("Outline error:", err);
      setError("Failed to extract outline. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOutlineItem = (item: OutlineItem, index: number) => (
    <div key={index} style={{ paddingLeft: `${item.level * 20}px` }} className="py-2 border-b border-[var(--border)] last:border-0">
      <div className="flex justify-between items-center">
        <span className={`${item.level === 0 ? "font-semibold" : ""}`}>{item.title}</span>
        <span className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded">
          Page {item.page}
        </span>
      </div>
      {item.children?.map((child, i) => renderOutlineItem(child, i))}
    </div>
  );

  const flattenOutline = (items: OutlineItem[]): OutlineItem[] => {
    const flat: OutlineItem[] = [];
    const process = (item: OutlineItem) => {
      flat.push(item);
      item.children?.forEach(process);
    };
    items.forEach(process);
    return flat;
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-lime-500/20 to-green-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500 to-green-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-lime-500 to-green-500 shadow-lg">
                <List className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">PDF Outline</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">View PDF table of contents</p>
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

            {outline.length > 0 && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <List className="h-5 w-5 text-lime-500" />
                    Table of Contents
                  </h3>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {flattenOutline(outline).length} items
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {outline.map((item, index) => renderOutlineItem(item, index))}
                </div>
              </div>
            )}

            {outline.length === 0 && (
              <button
                onClick={extractOutline}
                disabled={files.length === 0 || isProcessing}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-lime-500 to-green-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <List className="h-5 w-5" />
                Extract Outline
              </button>
            )}

            {outline.length > 0 && (
              <button
                onClick={() => { setFiles([]); setOutline([]); }}
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
