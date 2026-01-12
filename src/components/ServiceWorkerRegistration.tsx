"use client";

import { useEffect, useState } from "react";
import { X, Download, RefreshCw } from "lucide-react";

export function ServiceWorkerRegistration() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Register service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New content is available, show update prompt
                setShowUpdatePrompt(true);
              }
            });
          }
        });

        console.log("[PWA] Service worker registered");
      } catch (error) {
        console.error("[PWA] Service worker registration failed:", error);
      }
    };

    registerSW();

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show install prompt after a delay (don't interrupt immediately)
      const hasDeclined = localStorage.getItem("pwa-install-declined");
      if (!hasDeclined) {
        setTimeout(() => setShowInstallPrompt(true), 30000); // 30 seconds
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // @ts-expect-error - beforeinstallprompt event type
    const result = await deferredPrompt.prompt();
    console.log("[PWA] Install prompt result:", result);

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDeclineInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("pwa-install-declined", "true");
  };

  const handleUpdate = () => {
    setShowUpdatePrompt(false);
    window.location.reload();
  };

  if (!showInstallPrompt && !showUpdatePrompt) {
    return null;
  }

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e293b] shadow-2xl">
            <button
              onClick={handleDeclineInstall}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-[#64748b]" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-1">
                  Install PDFflow
                </h3>
                <p className="text-xs text-[#94a3b8] mb-3">
                  Add to your home screen for quick access and offline use.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    Install
                  </button>
                  <button
                    onClick={handleDeclineInstall}
                    className="px-3 py-1.5 rounded-lg text-[#94a3b8] text-xs font-medium hover:text-white transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#0ea5e9]/30 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-1">
                  Update available
                </h3>
                <p className="text-xs text-[#94a3b8] mb-3">
                  A new version of PDFflow is ready. Refresh to update.
                </p>
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  Refresh now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
