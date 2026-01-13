"use client";

import { useFileTray, TrayFile } from "@/contexts/FileTrayContext";
import { X, Trash2, FolderOpen, ChevronRight, ChevronLeft, File, Image } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileItem({ file, onRemove, onSelect }: {
  file: TrayFile;
  onRemove: () => void;
  onSelect: () => void;
}) {
  const isImage = file.file.type.startsWith("image/");
  const isPdf = file.file.type === "application/pdf";

  return (
    <div
      className="group relative flex items-center gap-3 p-3 rounded-xl bg-[#1e293b]/50 hover:bg-[#1e293b] border border-[#334155]/50 transition-all cursor-pointer"
      onClick={onSelect}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ fileId: file.id }));
        e.dataTransfer.effectAllowed = "copy";
      }}
    >
      {/* Thumbnail or Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center overflow-hidden">
        {file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : isImage ? (
          <Image className="w-5 h-5 text-purple-400" />
        ) : isPdf ? (
          <File className="w-5 h-5 text-red-400" />
        ) : (
          <File className="w-5 h-5 text-[#94a3b8]" />
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-[#94a3b8]">
          {formatFileSize(file.size)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-[#94a3b8] hover:text-red-400 transition-all"
        title="Remove file"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function FileTray() {
  const { files, removeFile, clearAll, isOpen, setIsOpen, toggleTray } = useFileTray();

  return (
    <>
      {/* Toggle Button - Fixed on right side */}
      <button
        onClick={toggleTray}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 px-2 py-4 rounded-l-xl bg-[#1e293b] border border-r-0 border-[#334155] shadow-lg transition-all hover:bg-[#334155] ${
          isOpen ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        }`}
        title="Open File Tray"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
        {files.length > 0 && (
          <span className="absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center text-xs font-bold bg-[#0ea5e9] text-white rounded-full">
            {files.length}
          </span>
        )}
      </button>

      {/* Tray Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-72 bg-[#0a0a0f] border-l border-[#1e293b] shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#0ea5e9]/20 to-purple-500/20">
              <FolderOpen className="w-5 h-5 text-[#0ea5e9]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">File Tray</h3>
              <p className="text-xs text-[#94a3b8]">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ height: "calc(100% - 140px)" }}>
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 rounded-2xl bg-[#1e293b]/50 mb-4">
                <FolderOpen className="w-8 h-8 text-[#94a3b8]" />
              </div>
              <p className="text-sm text-[#94a3b8] mb-1">No files yet</p>
              <p className="text-xs text-[#64748b]">
                Files you upload will appear here
              </p>
            </div>
          ) : (
            files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onRemove={() => removeFile(file.id)}
                onSelect={() => {
                  // Could navigate to a relevant tool or copy to clipboard
                }}
              />
            ))
          )}
        </div>

        {/* Footer Actions */}
        {files.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1e293b] bg-[#0a0a0f]">
            <button
              onClick={clearAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Files
            </button>
            <p className="text-center text-xs text-[#64748b] mt-3">
              Drag files to any tool to use them
            </p>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
