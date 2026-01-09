"use client";

import { useState } from "react";
import { Save, Trash2, Check, X, FolderOpen } from "lucide-react";

interface Template {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

interface TemplateManagerProps<T extends Template> {
  templates: T[];
  onSelect: (template: T) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  renderPreview?: (template: T) => React.ReactNode;
  label?: string;
}

export function TemplateManager<T extends Template>({
  templates,
  onSelect,
  onSave,
  onDelete,
  renderPreview,
  label = "Templates",
}: TemplateManagerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSave = () => {
    if (newName.trim()) {
      onSave(newName.trim());
      setNewName("");
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirm(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors text-sm"
        >
          <FolderOpen className="h-4 w-4" />
          {label}
          {templates.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[var(--primary)] text-white text-xs">
              {templates.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsSaving(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity text-sm"
        >
          <Save className="h-4 w-4" />
          Save Current
        </button>
      </div>

      {/* Save Modal */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-2xl p-6 max-w-md w-full mx-4 border border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-4">Save as Template</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Template name..."
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsSaving(false);
                  setNewName("");
                }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newName.trim()}
                className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-xl z-40 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-[var(--border)]">
            <h4 className="font-medium text-sm">Saved {label}</h4>
          </div>

          {templates.length === 0 ? (
            <div className="p-6 text-center text-[var(--text-secondary)]">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No templates saved yet</p>
              <p className="text-xs mt-1">Save your current settings as a template</p>
            </div>
          ) : (
            <div className="p-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group relative p-3 rounded-lg hover:bg-[var(--muted)] transition-colors"
                >
                  {deleteConfirm === template.id ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Delete?</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        onSelect(template);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{template.name}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {formatDate(template.updatedAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(template.id);
                          }}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {renderPreview && (
                        <div className="mt-2">{renderPreview(template)}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="p-2 border-t border-[var(--border)]">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-sm text-center text-[var(--text-secondary)] hover:bg-[var(--muted)] rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
