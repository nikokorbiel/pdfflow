"use client";

// Simple gradient background - particles removed for cleaner look
// Particle animation only appears in hero section via page.tsx

export function Background() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      style={{
        background: "#000000",
      }}
    />
  );
}
