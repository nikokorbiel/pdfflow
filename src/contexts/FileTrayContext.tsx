"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface TrayFile {
  id: string;
  file: File;
  name: string;
  size: number;
  addedAt: Date;
  thumbnail?: string;
}

interface FileTrayContextType {
  files: TrayFile[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  clearAll: () => void;
  getFile: (id: string) => TrayFile | undefined;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleTray: () => void;
}

const FileTrayContext = createContext<FileTrayContextType | undefined>(undefined);

export function FileTrayProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<TrayFile[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Generate unique ID
  const generateId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Generate thumbnail for PDF files
  const generateThumbnail = useCallback(async (file: File): Promise<string | undefined> => {
    if (file.type !== "application/pdf") return undefined;

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);

      const scale = 0.3;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      if (!context) return undefined;

      await page.render({ canvasContext: context, viewport, canvas }).promise;

      return canvas.toDataURL("image/jpeg", 0.6);
    } catch {
      return undefined;
    }
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const trayFiles: TrayFile[] = [];

    for (const file of newFiles) {
      // Check if file already exists (by name and size)
      const exists = files.some(f => f.name === file.name && f.size === file.size);
      if (exists) continue;

      const thumbnail = await generateThumbnail(file);

      trayFiles.push({
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        addedAt: new Date(),
        thumbnail,
      });
    }

    if (trayFiles.length > 0) {
      setFiles(prev => [...prev, ...trayFiles]);
      // Auto-open tray when files are added
      setIsOpen(true);
    }
  }, [files, generateThumbnail]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const getFile = useCallback((id: string) => {
    return files.find(f => f.id === id);
  }, [files]);

  const toggleTray = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Clean up old files after 1 hour to prevent memory issues
  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      setFiles(prev => prev.filter(f => f.addedAt > oneHourAgo));
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  return (
    <FileTrayContext.Provider
      value={{
        files,
        addFiles,
        removeFile,
        clearAll,
        getFile,
        isOpen,
        setIsOpen,
        toggleTray,
      }}
    >
      {children}
    </FileTrayContext.Provider>
  );
}

export function useFileTray() {
  const context = useContext(FileTrayContext);
  if (!context) {
    throw new Error("useFileTray must be used within a FileTrayProvider");
  }
  return context;
}
