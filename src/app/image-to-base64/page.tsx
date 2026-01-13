"use client";

import { useState, useCallback } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Binary, Sparkles, AlertCircle, Crown, Copy, Check } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

export default function ImageToBase64() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<{ name: string; base64: string; size: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [includeDataUri, setIncludeDataUri] = useState(true);

  const { isPro, maxFileSize, usageDisplay } = useToolUsage();

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    setError(null);
    setResults([]);

    const newResults: { name: string; base64: string; size: string }[] = [];

    for (const file of newFiles) {
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            if (includeDataUri) {
              resolve(result);
            } else {
              resolve(result.split(",")[1]);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newResults.push({
          name: file.name,
          base64,
          size: (base64.length / 1024).toFixed(1) + " KB",
        });
      } catch {
        newResults.push({
          name: file.name + " (Error)",
          base64: "",
          size: "0 KB",
        });
      }
    }

    setResults(newResults);
  }, [includeDataUri]);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResults(prev => prev.filter((_, i) => i !== index));
  }, []);

  const copyToClipboard = async (index: number) => {
    try {
      await navigator.clipboard.writeText(results[index].base64);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = results[index].base64;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-400/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
                <Binary className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Image to Base64</h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto">Convert images to Base64 strings</p>
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
            <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDataUri}
                  onChange={(e) => setIncludeDataUri(e.target.checked)}
                  className="w-5 h-5 rounded accent-violet-500"
                />
                <span className="text-sm">Include Data URI prefix (data:image/...;base64,)</span>
              </label>
            </div>

            <FileDropzone
              onFilesSelected={handleFilesSelected}
              accept="image/*"
              multiple={true}
              maxSize={maxFileSize}
              maxFiles={20}
              files={files}
              onRemoveFile={handleRemoveFile}
              disabled={false}
            />

            {error && (
              <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate max-w-[300px]">{result.name}</h3>
                      <span className="text-sm text-[var(--muted-foreground)]">{result.size}</span>
                    </div>
                    <textarea
                      readOnly
                      value={result.base64}
                      className="w-full h-24 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] font-mono text-xs resize-none focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(index)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500 text-white font-medium hover:opacity-90 transition-all"
                    >
                      {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedIndex === index ? "Copied!" : "Copy to Clipboard"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {results.length > 0 && (
              <button
                onClick={() => { setFiles([]); setResults([]); }}
                className="w-full flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
              >
                Convert More Images
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
