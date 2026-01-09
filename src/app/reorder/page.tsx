"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, ArrowUpDown, Sparkles, GripVertical, RotateCcw } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getRemainingUsage,
  incrementUsage,
  getMaxFileSize,
} from "@/lib/usage";
import Link from "next/link";

interface PageItem {
  id: string;
  originalIndex: number;
  thumbnail: string;
}

function SortablePageItem({ page, index }: { page: PageItem; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
        isDragging
          ? "border-pink-500 shadow-2xl shadow-pink-500/30 scale-105"
          : "border-[var(--border)] hover:border-pink-500/50"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs font-medium text-white z-10">
        {index + 1}
      </div>
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-pink-500/80 backdrop-blur-sm text-xs font-medium text-white z-10">
        was {page.originalIndex + 1}
      </div>
      <img
        src={page.thumbnail}
        alt={`Page ${index + 1}`}
        className="w-full h-auto"
        draggable={false}
      />
    </div>
  );
}

export default function ReorderPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [originalOrder, setOriginalOrder] = useState<PageItem[]>([]);

  const remainingUsage = typeof window !== "undefined" ? getRemainingUsage() : 2;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles([newFiles[0]]);
      setResultUrl(null);
      setError(null);
      setPages([]);

      // Generate thumbnails
      setIsLoadingThumbnails(true);
      try {
        // Dynamic import to avoid SSR issues with pdfjs-dist
        const { generatePdfThumbnails } = await import("@/lib/pdf-utils");
        const thumbnails = await generatePdfThumbnails(newFiles[0], 0.3);
        const newPages: PageItem[] = thumbnails.map((thumbnail, index) => ({
          id: `page-${index + 1}`,
          originalIndex: index,
          thumbnail,
        }));

        setPages(newPages);
        setOriginalOrder([...newPages]);
      } catch (err) {
        console.error("Error generating thumbnails:", err);
        setError("Failed to load PDF pages. Please try another file.");
      } finally {
        setIsLoadingThumbnails(false);
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
    setPages([]);
    setOriginalOrder([]);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const resetOrder = () => {
    setPages([...originalOrder]);
  };

  const hasChanges = () => {
    if (pages.length !== originalOrder.length) return false;
    return pages.some((page, index) => page.id !== originalOrder[index].id);
  };

  const reorderPDF = async () => {
    if (files.length === 0 || pages.length === 0) {
      setError("Please select a PDF file");
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
      const sourcePdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      setStatus("Reordering pages...");

      for (let i = 0; i < pages.length; i++) {
        setProgress(20 + ((i + 1) / pages.length) * 60);
        setStatus(`Processing page ${i + 1} of ${pages.length}...`);

        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pages[i].originalIndex]);
        newPdf.addPage(copiedPage);
      }

      setStatus("Saving PDF...");
      setProgress(90);

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      incrementUsage();
    } catch (err) {
      console.error("Reorder error:", err);
      setError("Failed to reorder PDF. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_reordered.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-rose-400/10 to-pink-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                <ArrowUpDown className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Reorder Pages
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Drag and drop to rearrange your PDF pages
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
            {pages.length === 0 && (
              <FileDropzone
                onFilesSelected={handleFilesSelected}
                accept=".pdf,application/pdf"
                multiple={false}
                maxSize={getMaxFileSize()}
                maxFiles={1}
                files={files}
                onRemoveFile={handleRemoveFile}
                disabled={isProcessing || isLoadingThumbnails}
              />
            )}

            {/* Loading thumbnails */}
            {isLoadingThumbnails && (
              <div className="rounded-3xl border bg-[var(--card)] p-8 shadow-glass animate-fade-in">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-4" />
                  <p className="text-[var(--muted-foreground)]">Loading pages...</p>
                </div>
              </div>
            )}

            {/* Page grid for reordering */}
            {pages.length > 0 && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {pages.length} Pages - Drag to Reorder
                  </h3>
                  <div className="flex items-center gap-2">
                    {hasChanges() && (
                      <button
                        onClick={resetOrder}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </button>
                    )}
                    <button
                      onClick={handleRemoveFile}
                      className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                    >
                      Change PDF
                    </button>
                  </div>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {pages.map((page, index) => (
                        <SortablePageItem key={page.id} page={page} index={index} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <p className="mt-4 text-sm text-[var(--muted-foreground)] text-center">
                  Drag pages to reorder them. The new order will be applied when you save.
                </p>
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 mb-4">
                    <ArrowUpDown className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Pages Reordered!</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Your reordered PDF is ready to download
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={reorderPDF}
                  disabled={pages.length === 0 || isProcessing || isLoadingThumbnails}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 font-medium text-white shadow-lg shadow-pink-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <ArrowUpDown className="h-5 w-5" />
                  Save Reordered PDF
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Reordered PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                    setPages([]);
                    setOriginalOrder([]);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Reorder Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
