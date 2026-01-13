"use client";

import { Search, X } from "lucide-react";

interface ToolSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ToolSearch({ value, onChange, placeholder = "Search 100 tools..." }: ToolSearchProps) {
  return (
    <div className="relative max-w-xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-[#64748b]" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-[#0a0a0f] border border-[#1e293b] text-white placeholder:text-[#64748b] focus:border-[#0ea5e9] focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#64748b] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
