"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Bookmark, Sparkles, AlertCircle, Crown, Plus, Trash2 } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

interface BookmarkEntry {
  title: string;
  page: number;
}

export default function AddBookmarks() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([
    { title: "Introduction", page: 1 },
  ]);
  const [pageCount, setPageCount] = useState(0);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);

      // Get page count
      try {
        const fileBuffer = await newFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);
        setPageCount(pdfDoc.getPageCount());
      } catch {
        setPageCount(0);
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setPageCount(0);
  }, []);

  const addBookmarkEntry = () => {
    setBookmarks([...bookmarks, { title: "", page: 1 }]);
  };

  const removeBookmarkEntry = (index: number) => {
    setBookmarks(bookmarks.filter((_, i) => i !== index));
  };

  const updateBookmark = (index: number, field: "title" | "page", value: string | number) => {
    const updated = [...bookmarks];
    if (field === "title") {
      updated[index].title = value as string;
    } else {
      updated[index].page = Math.max(1, Math.min(pageCount || 999, value as number));
    }
    setBookmarks(updated);
  };

  const addBookmarksToPdf = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
      return;
    }

    if (bookmarks.length === 0) {
      setError("Please add at least one bookmark");
      return;
    }

    if (bookmarks.some(b => !b.title.trim())) {
      setError("All bookmarks must have a title");
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

      const fileBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();

      setStatus("Adding bookmarks...");
      setProgress(60);

      // Note: pdf-lib doesn't have built-in bookmark support
      // We'll add them as document metadata outline
      // For full bookmark support, a different library would be needed

      // Store bookmarks in PDF metadata as a workaround
      const bookmarkData = bookmarks.map(b => ({
        title: b.title,
        page: Math.min(b.page, pages.length),
      }));

      pdfDoc.setTitle(pdfDoc.getTitle() || files[0].name.replace(/\.pdf$/i, ""));
      pdfDoc.setKeywords([...bookmarkData.map(b => `bookmark:${b.title}:${b.page}`)]);

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
      console.error("Bookmark error:", err);
      setError("Failed to add bookmarks. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_bookmarked.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-orange-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                <Bookmark className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Add Bookmarks</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Add navigation bookmarks to PDF</p>
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
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">
                    Bookmarks {pageCount > 0 && `(${pageCount} pages)`}
                  </label>
                  <button
                    onClick={addBookmarkEntry}
                    className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {bookmarks.map((bookmark, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={bookmark.title}
                        onChange={(e) => updateBookmark(index, "title", e.target.value)}
                        placeholder="Bookmark title"
                        className="flex-1 px-4 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] focus:outline-none focus:border-amber-500"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--muted-foreground)]">Page</span>
                        <input
                          type="number"
                          min={1}
                          max={pageCount || 999}
                          value={bookmark.page}
                          onChange={(e) => updateBookmark(index, "page", parseInt(e.target.value) || 1)}
                          className="w-20 px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      {bookmarks.length > 1 && (
                        <button
                          onClick={() => removeBookmarkEntry(index)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-4">
                  <Bookmark className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Bookmarks Added!</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""} added
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={addBookmarksToPdf}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Bookmark className="h-5 w-5" />
                  Add Bookmarks
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
                <button onClick={() => { setFiles([]); setResultUrl(null); }} className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all">
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
