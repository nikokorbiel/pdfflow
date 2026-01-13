// File history tracking for processed PDFs

export interface FileHistoryItem {
  id: string;
  fileName: string;
  originalName: string;
  tool: string;
  toolName: string;
  toolIcon: string;
  timestamp: number;
  fileSize?: number;
  outputSize?: number;
  pageCount?: number;
  resultUrl?: string; // Blob URL (only valid in current session)
}

const HISTORY_KEY = "pdfflow-file-history";
const MAX_HISTORY_ITEMS_FREE = 10;
const MAX_HISTORY_ITEMS_PRO = 50;
const RETENTION_DAYS_FREE = 7;
const RETENTION_DAYS_PRO = 30;

// Check Pro status from localStorage cache
function getIsPro(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("pdf-tools-pro-cached") === "true";
}

export function getFileHistory(isPro?: boolean): FileHistoryItem[] {
  if (typeof window === "undefined") return [];

  const proStatus = isPro ?? getIsPro();
  const retentionDays = proStatus ? RETENTION_DAYS_PRO : RETENTION_DAYS_FREE;

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    const history: FileHistoryItem[] = JSON.parse(stored);

    // Filter out items older than retention period
    const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    return history.filter(item => item.timestamp > cutoffTime);
  } catch {
    return [];
  }
}

export function addToFileHistory(
  item: Omit<FileHistoryItem, "id" | "timestamp">,
  isPro?: boolean
): void {
  if (typeof window === "undefined") return;

  const proStatus = isPro ?? getIsPro();
  const maxItems = proStatus ? MAX_HISTORY_ITEMS_PRO : MAX_HISTORY_ITEMS_FREE;

  try {
    const history = getFileHistory(proStatus);

    const newItem: FileHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Add to beginning, remove duplicates with same fileName + tool
    const filtered = history.filter(
      h => !(h.originalName === item.originalName && h.tool === item.tool)
    );

    const updated = [newItem, ...filtered].slice(0, maxItems);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is full
  }
}

export function clearFileHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export function removeFromHistory(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const history = getFileHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail
  }
}

// Tool metadata for history display
export const toolMeta: Record<string, { name: string; icon: string; color: string }> = {
  merge: { name: "Merge PDF", icon: "Combine", color: "from-violet-500 to-purple-500" },
  split: { name: "Split PDF", icon: "Split", color: "from-blue-500 to-cyan-400" },
  compress: { name: "Compress", icon: "FileDown", color: "from-emerald-500 to-teal-400" },
  "pdf-to-image": { name: "PDF to Image", icon: "Image", color: "from-orange-500 to-amber-400" },
  "image-to-pdf": { name: "Image to PDF", icon: "FileImage", color: "from-indigo-500 to-blue-400" },
  "pdf-to-word": { name: "PDF to Word", icon: "FileText", color: "from-blue-600 to-blue-400" },
  "pdf-to-excel": { name: "PDF to Excel", icon: "Table", color: "from-green-600 to-emerald-600" },
  "pdf-to-powerpoint": { name: "PDF to PPT", icon: "Presentation", color: "from-orange-600 to-red-500" },
  rotate: { name: "Rotate PDF", icon: "RotateCw", color: "from-teal-500 to-cyan-400" },
  watermark: { name: "Watermark", icon: "Droplets", color: "from-blue-500 to-indigo-500" },
  "page-numbers": { name: "Page Numbers", icon: "Hash", color: "from-slate-500 to-gray-400" },
  reorder: { name: "Reorder Pages", icon: "ArrowUpDown", color: "from-pink-500 to-rose-500" },
  sign: { name: "Sign PDF", icon: "PenTool", color: "from-purple-500 to-pink-500" },
  unlock: { name: "Unlock PDF", icon: "Unlock", color: "from-cyan-500 to-sky-500" },
  crop: { name: "Crop PDF", icon: "Crop", color: "from-fuchsia-500 to-purple-500" },
  redact: { name: "Redact PDF", icon: "EyeOff", color: "from-zinc-600 to-slate-600" },
  flatten: { name: "Flatten PDF", icon: "Layers", color: "from-blue-600 to-indigo-600" },
  repair: { name: "Repair PDF", icon: "Wrench", color: "from-yellow-500 to-amber-500" },
  "extract-images": { name: "Extract Images", icon: "ImageIcon", color: "from-sky-500 to-cyan-500" },
  "delete-pages": { name: "Delete Pages", icon: "Trash2", color: "from-red-500 to-rose-500" },
  "html-to-pdf": { name: "HTML to PDF", icon: "Code", color: "from-violet-600 to-purple-600" },
};

// Filter history by tool
export function getHistoryByTool(tool: string, isPro?: boolean): FileHistoryItem[] {
  return getFileHistory(isPro).filter(item => item.tool === tool);
}

// Search history by file name
export function searchHistory(query: string, isPro?: boolean): FileHistoryItem[] {
  const lowerQuery = query.toLowerCase();
  return getFileHistory(isPro).filter(
    item => item.originalName.toLowerCase().includes(lowerQuery) ||
            item.toolName.toLowerCase().includes(lowerQuery)
  );
}

// Get history stats
export function getHistoryStats(isPro?: boolean): {
  totalFiles: number;
  totalSize: number;
  toolBreakdown: Record<string, number>;
} {
  const history = getFileHistory(isPro);
  const totalFiles = history.length;
  const totalSize = history.reduce((sum, item) => sum + (item.fileSize || 0), 0);
  const toolBreakdown: Record<string, number> = {};

  for (const item of history) {
    toolBreakdown[item.tool] = (toolBreakdown[item.tool] || 0) + 1;
  }

  return { totalFiles, totalSize, toolBreakdown };
}

// Helper to format file size
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Helper to format relative time
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}
