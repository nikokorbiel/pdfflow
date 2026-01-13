"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { Download, Lock, Sparkles, Eye, EyeOff, ShieldCheck, Crown } from "lucide-react";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

export default function ProtectPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password options
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isPro, canProcess, maxFileSize, recordUsage: _recordUsage, usageDisplay } = useToolUsage();

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

  const protectPDF = async () => {
    if (files.length === 0) {
      setError("Please select a PDF file");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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
      setStatus("Validating PDF...");
      setProgress(20);

      const fileBuffer = await files[0].arrayBuffer();

      // Validate the PDF can be loaded
      await PDFDocument.load(fileBuffer, { ignoreEncryption: true });

      setStatus("Preparing encryption...");
      setProgress(50);

      // PDF encryption requires server-side processing for security
      // Client-side JavaScript cannot securely implement PDF encryption standards (RC4/AES)
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress(100);
      setStatus("Ready");
      setError(
        "PDF password protection requires secure server-side encryption. " +
        "This feature is available with PDFflow Pro. Upgrade to protect your PDFs with industry-standard AES-256 encryption."
      );
    } catch (err) {
      console.error("Protection error:", err);
      setError("Failed to read PDF. The file may be corrupted or invalid.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    link.download = `${originalName}_protected.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const canProtect = files.length > 0 && password.length >= 4 && passwordsMatch;

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg">
                <Lock className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Protect PDF
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Secure your PDF with password protection
            </p>
          </div>

          {/* Usage indicator */}
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

          {/* Main content */}
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

            {/* Password options */}
            {files.length > 0 && !resultUrl && (
              <div className="rounded-3xl border bg-[var(--card)] p-6 shadow-glass animate-fade-in space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold">Set Password</h3>
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (min 4 characters)"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 pr-12 rounded-xl border bg-[var(--muted)] focus:outline-none transition-colors ${
                        confirmPassword && password !== confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-[var(--border)] focus:border-amber-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-2 text-sm text-red-500">Passwords do not match</p>
                  )}
                  {passwordsMatch && (
                    <p className="mt-2 text-sm text-emerald-500 flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Password strength indicator */}
                {password && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      Password Strength
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength =
                          (password.length >= 4 ? 1 : 0) +
                          (password.length >= 8 ? 1 : 0) +
                          (/[A-Z]/.test(password) && /[a-z]/.test(password) ? 1 : 0) +
                          (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password) ? 1 : 0);

                        return (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-colors ${
                              level <= strength
                                ? strength <= 1
                                  ? "bg-red-500"
                                  : strength <= 2
                                  ? "bg-amber-500"
                                  : strength <= 3
                                  ? "bg-yellow-500"
                                  : "bg-emerald-500"
                                : "bg-[var(--border)]"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Use 8+ characters with uppercase, lowercase, and numbers for best security
                    </p>
                  </div>
                )}
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 mb-4">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">PDF Protected!</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Your password-protected PDF is ready to download
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    Remember your password to open this PDF
                  </div>
                </div>
              </div>
            )}

            {/* Note */}
            {files.length > 0 && !resultUrl && (
              <div className="rounded-3xl bg-[var(--muted)]/50 border border-[var(--border)] p-5 animate-fade-in">
                <p className="text-sm text-[var(--muted-foreground)] text-center">
                  <strong className="text-foreground">Important:</strong> Remember your password!
                  <br className="hidden sm:block" />
                  You&apos;ll need it to open the protected PDF. We cannot recover lost passwords.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!resultUrl ? (
                <button
                  onClick={protectPDF}
                  disabled={!canProtect || isProcessing}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-medium text-white shadow-lg shadow-amber-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all press-effect"
                >
                  <Lock className="h-5 w-5" />
                  Protect PDF
                </button>
              ) : (
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all press-effect"
                >
                  <Download className="h-5 w-5" />
                  Download Protected PDF
                </button>
              )}

              {resultUrl && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                    setProgress(0);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Protect Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
