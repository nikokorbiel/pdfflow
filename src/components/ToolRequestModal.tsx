"use client";

import { useState } from "react";
import { X, Sparkles, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToolRequestModal({ isOpen, onClose }: ToolRequestModalProps) {
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Store in localStorage for now (could be sent to an API)
    const requests = JSON.parse(localStorage.getItem("toolRequests") || "[]");
    requests.push({
      toolName,
      description,
      email,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("toolRequests", JSON.stringify(requests));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset and close after showing success
    setTimeout(() => {
      setToolName("");
      setDescription("");
      setEmail("");
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-auto sm:w-full sm:max-w-md z-50 flex items-center justify-center"
          >
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Request a Tool</h2>
                    <p className="text-xs text-[var(--text-secondary)]">Tell us what you need</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">Request Submitted!</h3>
                    <p className="text-sm text-[#64748b]">We&apos;ll review your suggestion soon.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Tool Name
                      </label>
                      <input
                        type="text"
                        value={toolName}
                        onChange={(e) => setToolName(e.target.value)}
                        placeholder="e.g., PDF to Excel"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this tool should do..."
                        required
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Email <span className="text-[var(--text-muted)]">(optional)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Get notified when it's ready"
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
