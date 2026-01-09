"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  files: File[];
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
}

export function FileDropzone({
  onFilesSelected,
  accept,
  multiple = false,
  maxSize = 10,
  maxFiles = 2,
  files,
  onRemoveFile,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (fileList: File[]): File[] => {
      setError(null);
      const validFiles: File[] = [];

      for (const file of fileList) {
        if (file.size > maxSize * 1024 * 1024) {
          setError(`File "${file.name}" exceeds ${maxSize}MB limit`);
          continue;
        }

        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const fileType = file.type;
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

        const isAccepted = acceptedTypes.some(
          (type) =>
            type === fileType ||
            type === fileExtension ||
            (type.endsWith("/*") && fileType.startsWith(type.replace("/*", "")))
        );

        if (!isAccepted) {
          setError(`File "${file.name}" is not a supported format`);
          continue;
        }

        validFiles.push(file);
      }

      const totalFiles = files.length + validFiles.length;
      if (totalFiles > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed (Free tier limit)`);
        return validFiles.slice(0, maxFiles - files.length);
      }

      return validFiles;
    },
    [accept, maxSize, maxFiles, files.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(droppedFiles);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [disabled, validateFiles, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
      e.target.value = "";
    },
    [disabled, validateFiles, onFilesSelected]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.01]"
            : "border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--muted)]/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {/* Animated background gradient on drag */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-purple-500/10 to-pink-500/10 transition-opacity duration-300 ${
            isDragging ? "opacity-100" : "opacity-0"
          }`}
        />

        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed z-10"
        />

        <div className="relative p-12 text-center">
          {/* Icon with animation */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--muted)] border border-[var(--border)] mb-6 transition-all duration-300 ${isDragging ? "scale-110 shadow-glow" : ""}`}>
            <Upload className={`h-7 w-7 text-[var(--accent)] transition-transform duration-300 ${isDragging ? "-translate-y-1" : ""}`} />
          </div>

          <div>
            <p className="text-lg font-medium">
              {isDragging ? (
                <span className="text-[var(--accent)]">Release to upload</span>
              ) : (
                "Drop files here or click to upload"
              )}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {accept.includes("pdf") && "PDF files "}
              {accept.includes("image") && "PNG, JPG, JPEG, WEBP "}
              up to {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="animate-fade-in rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="group flex items-center justify-between rounded-2xl border bg-[var(--card)] p-4 transition-all hover:shadow-glass animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--muted)] text-[var(--accent)]">
                    {getFileIcon(file)}
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-[var(--muted)] transition-all"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4 text-[var(--muted-foreground)]" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
