"use client";

import { QuickActions } from "@/components/QuickActions";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export function GlobalFeatures() {
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts();

  return (
    <>
      <QuickActions />
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  );
}
