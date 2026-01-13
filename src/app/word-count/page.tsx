"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { FileText, Sparkles, AlertCircle, Crown, Hash, Type } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

interface CountResult {
  fileName: string;
  pages: number;
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
}

export default function WordCount() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<CountResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  const loadPdfJs = async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    return pdfjsLib;
  };

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setResults([]);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResults(prev => prev.filter((_, i) => i !== index));
  }, []);

  const countWords = async () => {
    if (files.length === 0) {
      setError("Please select PDF files");
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
      const pdfjsLib = await loadPdfJs();
      const newResults: CountResult[] = [];

      for (let f = 0; f < files.length; f++) {
        setStatus(`Analyzing ${files[f].name}...`);
        setProgress((f / files.length) * 90);

        const fileBuffer = await files[f].arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise as PDFDocumentProxy;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter((item): item is TextItem => "str" in item)
            .map(item => item.str)
            .join(" ");
          fullText += pageText + "\n\n";
        }

        const words = fullText.trim().split(/\s+/).filter(w => w.length > 0).length;
        const characters = fullText.length;
        const charactersNoSpaces = fullText.replace(/\s/g, "").length;
        const paragraphs = fullText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

        newResults.push({
          fileName: files[f].name,
          pages: pdf.numPages,
          words,
          characters,
          charactersNoSpaces,
          paragraphs,
        });
      }

      setResults(newResults);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Count error:", err);
      setError("Failed to count words. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totals = results.reduce(
    (acc, r) => ({
      pages: acc.pages + r.pages,
      words: acc.words + r.words,
      characters: acc.characters + r.characters,
      charactersNoSpaces: acc.charactersNoSpaces + r.charactersNoSpaces,
      paragraphs: acc.paragraphs + r.paragraphs,
    }),
    { pages: 0, words: 0, characters: 0, charactersNoSpaces: 0, paragraphs: 0 }
  );

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Word Count</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Count words, characters, and pages in PDFs</p>
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
              multiple={true}
              maxSize={maxFileSize}
              maxFiles={20}
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

            {results.length > 0 && (
              <>
                <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div key={index} className="p-4 rounded-xl bg-[var(--muted)]">
                        <p className="font-medium mb-3 truncate">{result.fileName}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                          <div>
                            <p className="text-xl font-bold text-blue-500">{result.pages}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Pages</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-cyan-500">{result.words.toLocaleString()}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Words</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold">{result.characters.toLocaleString()}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Characters</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold">{result.charactersNoSpaces.toLocaleString()}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">No Spaces</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold">{result.paragraphs}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Paragraphs</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {results.length > 1 && (
                  <div className="rounded-3xl border bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-6 shadow-glass">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Hash className="h-5 w-5 text-blue-500" />
                      Total ({results.length} files)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-2xl font-bold text-blue-500">{totals.pages}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Pages</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-2xl font-bold text-cyan-500">{totals.words.toLocaleString()}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Words</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-2xl font-bold">{totals.characters.toLocaleString()}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Characters</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-2xl font-bold">{totals.charactersNoSpaces.toLocaleString()}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">No Spaces</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-2xl font-bold">{totals.paragraphs}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Paragraphs</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {results.length === 0 && (
              <button
                onClick={countWords}
                disabled={files.length === 0 || isProcessing}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Type className="h-5 w-5" />
                Count Words
              </button>
            )}

            {results.length > 0 && (
              <button
                onClick={() => { setFiles([]); setResults([]); }}
                className="w-full flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
              >
                Analyze More Files
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
