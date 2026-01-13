"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export const shortcuts: Omit<Shortcut, "action">[] = [
  { key: "m", ctrl: true, description: "Go to Merge" },
  { key: "s", ctrl: true, shift: true, description: "Go to Split" },
  { key: "c", ctrl: true, shift: true, description: "Go to Compress" },
  { key: "r", ctrl: true, shift: true, description: "Go to Rotate" },
  { key: "w", ctrl: true, shift: true, description: "Go to Watermark" },
  { key: "k", ctrl: true, description: "Open search / tools" },
  { key: "/", description: "Open keyboard shortcuts" },
  { key: "Escape", description: "Close modal / cancel" },
];

export function useKeyboardShortcuts() {
  const router = useRouter();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Show shortcuts modal
      if (key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // Close modal
      if (key === "escape") {
        setShowShortcuts(false);
        return;
      }

      // Navigation shortcuts (Ctrl/Cmd + key)
      if (e.ctrlKey || e.metaKey) {
        switch (key) {
          case "m":
            if (!e.shiftKey) {
              e.preventDefault();
              router.push("/merge");
            }
            break;
          case "s":
            if (e.shiftKey) {
              e.preventDefault();
              router.push("/split");
            }
            break;
          case "c":
            if (e.shiftKey) {
              e.preventDefault();
              router.push("/compress");
            }
            break;
          case "r":
            if (e.shiftKey) {
              e.preventDefault();
              router.push("/rotate");
            }
            break;
          case "w":
            if (e.shiftKey) {
              e.preventDefault();
              router.push("/watermark");
            }
            break;
          case "k":
            e.preventDefault();
            // Focus search if exists, or navigate to tools
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            } else {
              router.push("/tools");
            }
            break;
        }
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { showShortcuts, setShowShortcuts };
}

// Format shortcut keys for display
export function formatShortcut(shortcut: Omit<Shortcut, "action">): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.alt) parts.push("Alt");
  parts.push(shortcut.key.toUpperCase());
  return parts.join(" + ");
}
