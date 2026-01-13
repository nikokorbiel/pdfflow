"use client";

import Link from "next/link";
import {
  Combine,
  Split,
  FileDown,
  RotateCw,
  Droplets,
  Hash,
  PenTool,
  Lock,
  Crop,
  Trash2,
  Layers,
  FileText,
  Table,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

interface ToolSuggestion {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  reason: string;
}

// Tool relationships - what tools are commonly used after each tool
const toolRelationships: Record<string, ToolSuggestion[]> = {
  merge: [
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Reduce merged file size" },
    { name: "Add Page Numbers", href: "/page-numbers", icon: Hash, reason: "Number merged pages" },
    { name: "Add Watermark", href: "/watermark", icon: Droplets, reason: "Brand your document" },
  ],
  split: [
    { name: "Merge", href: "/merge", icon: Combine, reason: "Recombine specific pages" },
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Compress split files" },
    { name: "Rename", href: "/", icon: FileText, reason: "Organize extracted pages" },
  ],
  compress: [
    { name: "Merge", href: "/merge", icon: Combine, reason: "Combine compressed files" },
    { name: "Add Watermark", href: "/watermark", icon: Droplets, reason: "Add branding" },
    { name: "Encrypt", href: "/encrypt", icon: Lock, reason: "Secure your PDF" },
  ],
  rotate: [
    { name: "Crop", href: "/crop", icon: Crop, reason: "Adjust page boundaries" },
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Reduce file size" },
    { name: "Merge", href: "/merge", icon: Combine, reason: "Combine rotated pages" },
  ],
  "pdf-to-image": [
    { name: "Compress Images", href: "/compress-images", icon: FileDown, reason: "Reduce image sizes" },
    { name: "Resize Images", href: "/resize-images", icon: Crop, reason: "Adjust dimensions" },
    { name: "Image to PDF", href: "/image-to-pdf", icon: FileText, reason: "Convert back to PDF" },
  ],
  "image-to-pdf": [
    { name: "Merge", href: "/merge", icon: Combine, reason: "Add more PDFs" },
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Reduce file size" },
    { name: "Add Page Numbers", href: "/page-numbers", icon: Hash, reason: "Number pages" },
  ],
  watermark: [
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Reduce file size" },
    { name: "Encrypt", href: "/encrypt", icon: Lock, reason: "Protect your PDF" },
    { name: "Sign", href: "/sign", icon: PenTool, reason: "Add signature" },
  ],
  sign: [
    { name: "Encrypt", href: "/encrypt", icon: Lock, reason: "Secure signed document" },
    { name: "Flatten", href: "/flatten", icon: Layers, reason: "Lock signature" },
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Reduce file size" },
  ],
  unlock: [
    { name: "Edit", href: "/crop", icon: Crop, reason: "Now you can edit it" },
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Reduce file size" },
    { name: "Split", href: "/split", icon: Split, reason: "Extract pages" },
  ],
  encrypt: [
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Compress before sharing" },
    { name: "Watermark", href: "/watermark", icon: Droplets, reason: "Add visible branding" },
  ],
  "delete-pages": [
    { name: "Reorder", href: "/reorder", icon: RotateCw, reason: "Rearrange remaining pages" },
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Reduce file size" },
    { name: "Add Page Numbers", href: "/page-numbers", icon: Hash, reason: "Renumber pages" },
  ],
  crop: [
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Smaller file after crop" },
    { name: "Rotate", href: "/rotate", icon: RotateCw, reason: "Fix orientation" },
    { name: "Add Margins", href: "/add-margins", icon: Crop, reason: "Add back margins" },
  ],
  "page-numbers": [
    { name: "Watermark", href: "/watermark", icon: Droplets, reason: "Add branding" },
    { name: "Headers/Footers", href: "/headers-footers", icon: FileText, reason: "Add more info" },
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Reduce file size" },
  ],
  "pdf-to-word": [
    { name: "PDF to Excel", href: "/pdf-to-excel", icon: Table, reason: "Extract tables" },
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Compress original" },
  ],
  flatten: [
    { name: "Compress", href: "/compress", icon: FileDown, reason: "Reduce file size" },
    { name: "Encrypt", href: "/encrypt", icon: Lock, reason: "Secure flattened PDF" },
  ],
  reorder: [
    { name: "Delete Pages", href: "/delete-pages", icon: Trash2, reason: "Remove unwanted pages" },
    { name: "Merge", href: "/merge", icon: Combine, reason: "Add more pages" },
    { name: "Add Page Numbers", href: "/page-numbers", icon: Hash, reason: "Number reordered pages" },
  ],
};

// Default suggestions for tools without specific relationships
const defaultSuggestions: ToolSuggestion[] = [
  { name: "Compress", href: "/compress", icon: FileDown, reason: "Reduce file size" },
  { name: "Merge", href: "/merge", icon: Combine, reason: "Combine with other PDFs" },
  { name: "Add Watermark", href: "/watermark", icon: Droplets, reason: "Brand your document" },
];

interface ToolSuggestionsProps {
  currentTool: string;
  showAfterProcess?: boolean;
}

export function ToolSuggestions({ currentTool, showAfterProcess = true }: ToolSuggestionsProps) {
  if (!showAfterProcess) return null;

  const suggestions = toolRelationships[currentTool] || defaultSuggestions;
  const filteredSuggestions = suggestions.filter(s => s.href !== `/${currentTool}`).slice(0, 3);

  if (filteredSuggestions.length === 0) return null;

  return (
    <div className="mt-8 animate-fade-in-up">
      <div className="rounded-2xl border border-[#1e293b] bg-[#0f0f14] p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="text-sm font-medium text-white">You might also need</h3>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {filteredSuggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <Link
                key={suggestion.href}
                href={suggestion.href}
                className="group flex items-center gap-3 p-3 rounded-xl bg-[#1e293b]/30 hover:bg-[#1e293b]/60 border border-transparent hover:border-[#334155] transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center group-hover:bg-[#334155] transition-colors">
                  <Icon className="w-5 h-5 text-[#0ea5e9]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{suggestion.name}</p>
                  <p className="text-xs text-[#64748b] truncate">{suggestion.reason}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#0ea5e9] group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
