"use client";

import { shortcuts, formatShortcut } from "@/hooks/useKeyboardShortcuts";
import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0f0f14] border border-[#1e293b] rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-purple-500/20">
              <Keyboard className="w-5 h-5 text-[#0ea5e9]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1e293b]/50 transition-colors"
            >
              <span className="text-sm text-[#e2e8f0]">{shortcut.description}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-medium bg-[#1e293b] text-[#94a3b8] rounded-lg border border-[#334155]">
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1e293b] bg-[#0a0a0f]">
          <p className="text-xs text-[#64748b] text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-[#1e293b] rounded border border-[#334155]">/</kbd> anytime to open this menu
          </p>
        </div>
      </div>
    </div>
  );
}
