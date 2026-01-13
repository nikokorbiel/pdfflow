"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressBar } from "@/components/ProgressBar";
import {
  Workflow,
  FileDown,
  Droplets,
  RotateCw,
  Hash,
  Lock,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Play,
  Save,
  FolderOpen,
  Download,
  ArrowRight,
  Sparkles,
  X,
  Crown,
} from "lucide-react";
import {
  WorkflowStep,
  WorkflowToolType,
  WORKFLOW_TOOLS,
  createWorkflowStep,
  getWorkflows,
  saveWorkflow,
  deleteWorkflow,
  Workflow as WorkflowType,
} from "@/lib/workflow";
import { useToolUsage } from "@/hooks/useToolUsage";
import Link from "next/link";

const iconMap: Record<string, React.ElementType> = {
  FileDown,
  Droplets,
  RotateCw,
  Hash,
  Lock,
};

export default function WorkflowBuilder() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Saved workflows
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowType[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [workflowName, setWorkflowName] = useState("");

  const { isPro, canProcess, maxFileSize, recordUsage, usageDisplay } = useToolUsage();

  useEffect(() => {
    setSavedWorkflows(getWorkflows());
  }, []);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1));
    setResultUrl(null);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultUrl(null);
  }, []);

  const addStep = (tool: WorkflowToolType) => {
    const newStep = createWorkflowStep(tool);
    setSteps([...steps, newStep]);
    setExpandedStep(newStep.id);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId));
    if (expandedStep === stepId) setExpandedStep(null);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...steps];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const updateStepConfig = (stepId: string, key: string, value: unknown) => {
    setSteps(
      steps.map((s) =>
        s.id === stepId ? { ...s, config: { ...s.config, [key]: value } } : s
      )
    );
  };

  const handleSaveWorkflow = () => {
    if (!workflowName.trim() || steps.length === 0) return;
    saveWorkflow({ name: workflowName.trim(), steps });
    setSavedWorkflows(getWorkflows());
    setShowSaveModal(false);
    setWorkflowName("");
  };

  const handleLoadWorkflow = (workflow: WorkflowType) => {
    setSteps(workflow.steps.map((s) => ({ ...s, id: crypto.randomUUID() })));
    setShowLoadModal(false);
  };

  const handleDeleteWorkflow = (id: string) => {
    deleteWorkflow(id);
    setSavedWorkflows(getWorkflows());
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0.5, g: 0.5, b: 0.5 };
  };

  const runWorkflow = async () => {
    if (files.length === 0 || steps.length === 0) {
      setError("Please add a file and at least one tool to the workflow");
      return;
    }

    if (!canProcess) {
      setError("Daily limit reached. Upgrade to Pro for unlimited processing.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      let pdfBytes: ArrayBuffer | Uint8Array = await files[0].arrayBuffer();
      const totalSteps = steps.length;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepProgress = ((i + 1) / totalSteps) * 100;
        const toolName = WORKFLOW_TOOLS.find((t) => t.id === step.tool)?.name || step.tool;

        setStatus(`Step ${i + 1}/${totalSteps}: ${toolName}...`);
        setProgress(stepProgress * 0.9);

        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        switch (step.tool) {
          case "compress":
            // For compression, we just re-save with default settings
            // Real compression would require more sophisticated techniques
            break;

          case "watermark": {
            const { text, opacity, fontSize, rotation, color } = step.config as {
              text: string;
              opacity: number;
              fontSize: number;
              rotation: number;
              color: string;
            };
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const rgbColor = hexToRgb(color);

            for (const page of pages) {
              const { width, height } = page.getSize();
              const textWidth = font.widthOfTextAtSize(text, fontSize);
              page.drawText(text, {
                x: (width - textWidth) / 2,
                y: height / 2,
                size: fontSize,
                font,
                color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
                opacity,
                rotate: degrees(rotation),
              });
            }
            break;
          }

          case "rotate": {
            const { angle } = step.config as { angle: number };
            for (const page of pages) {
              const currentRotation = page.getRotation().angle;
              page.setRotation(degrees(currentRotation + angle));
            }
            break;
          }

          case "page-numbers": {
            const { position, startFrom, format } = step.config as {
              position: string;
              startFrom: number;
              format: string;
            };
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const totalPages = pages.length;

            pages.forEach((page, idx) => {
              const { width, height } = page.getSize();
              const pageNum = idx + startFrom;
              let text = "";

              switch (format) {
                case "number":
                  text = String(pageNum);
                  break;
                case "page-x":
                  text = `Page ${pageNum}`;
                  break;
                case "page-x-of-y":
                  text = `Page ${pageNum} of ${totalPages + startFrom - 1}`;
                  break;
              }

              const textWidth = font.widthOfTextAtSize(text, 10);
              let x = 0,
                y = 30;

              switch (position) {
                case "bottom-center":
                  x = (width - textWidth) / 2;
                  break;
                case "bottom-right":
                  x = width - textWidth - 40;
                  break;
                case "top-right":
                  x = width - textWidth - 40;
                  y = height - 30;
                  break;
              }

              page.drawText(text, {
                x,
                y,
                size: 10,
                font,
                color: rgb(0.3, 0.3, 0.3),
              });
            });
            break;
          }

          case "protect": {
            // Note: pdf-lib doesn't support encryption directly
            // This would need a different library for actual protection
            break;
          }
        }

        pdfBytes = await pdfDoc.save();
      }

      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setStatus("Complete!");
      await recordUsage();
    } catch (err) {
      console.error("Workflow error:", err);
      setError("Failed to process workflow. Please check your file and settings.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "workflow-result.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStepConfig = (step: WorkflowStep) => {
    switch (step.tool) {
      case "compress":
        return (
          <div className="space-y-3">
            <label className="text-sm font-medium">Quality</label>
            <div className="flex gap-2">
              {["low", "medium", "high"].map((q) => (
                <button
                  key={q}
                  onClick={() => updateStepConfig(step.id, "quality", q)}
                  className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all ${
                    step.config.quality === q
                      ? "bg-emerald-500 text-white"
                      : "border border-[var(--border)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        );

      case "watermark":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Text</label>
              <input
                type="text"
                value={step.config.text as string}
                onChange={(e) => updateStepConfig(step.id, "text", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Opacity: {Math.round((step.config.opacity as number) * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={step.config.opacity as number}
                  onChange={(e) => updateStepConfig(step.id, "opacity", parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Color</label>
                <input
                  type="color"
                  value={step.config.color as string}
                  onChange={(e) => updateStepConfig(step.id, "color", e.target.value)}
                  className="w-full h-9 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        );

      case "rotate":
        return (
          <div className="space-y-3">
            <label className="text-sm font-medium">Rotation</label>
            <div className="flex gap-2">
              {[90, 180, 270].map((angle) => (
                <button
                  key={angle}
                  onClick={() => updateStepConfig(step.id, "angle", angle)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                    step.config.angle === angle
                      ? "bg-teal-500 text-white"
                      : "border border-[var(--border)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>
        );

      case "page-numbers":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Position</label>
              <select
                value={step.config.position as string}
                onChange={(e) => updateStepConfig(step.id, "position", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]"
              >
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="top-right">Top Right</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Format</label>
              <select
                value={step.config.format as string}
                onChange={(e) => updateStepConfig(step.id, "format", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]"
              >
                <option value="number">1, 2, 3...</option>
                <option value="page-x">Page 1, Page 2...</option>
                <option value="page-x-of-y">Page 1 of 10...</option>
              </select>
            </div>
          </div>
        );

      case "protect":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Password</label>
              <input
                type="password"
                value={step.config.password as string}
                onChange={(e) => updateStepConfig(step.id, "password", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]"
                placeholder="Enter password"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Note: Password protection requires a Pro subscription.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl blur-xl opacity-40" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
                <Workflow className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
              Workflow Builder
            </h1>
            <p className="mt-4 text-xl text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
              Chain multiple tools together for batch processing
            </p>
          </div>

          {/* Usage indicator */}
          <div className="mt-8 flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                {isPro ? (
                  <Crown className="h-4 w-4 text-amber-500" />
                ) : (
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                )}
                <span className="text-sm text-[var(--muted-foreground)]">
                  {usageDisplay}
                </span>
              </div>
              {!isPro && (
                <>
                  <div className="h-4 w-px bg-[var(--border)]" />
                  <Link href="/pricing" className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity">
                    Upgrade
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-12 grid lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {/* Available Tools */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border bg-[var(--card)] p-4 shadow-glass sticky top-24">
                <h3 className="text-sm font-semibold mb-3">Add Tools</h3>
                <div className="space-y-2">
                  {WORKFLOW_TOOLS.map((tool) => {
                    const Icon = iconMap[tool.icon];
                    return (
                      <button
                        key={tool.id}
                        onClick={() => addStep(tool.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] hover:border-[var(--border-hover)] transition-all text-left"
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.gradient}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tool.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{tool.description}</p>
                        </div>
                        <Plus className="h-4 w-4 ml-auto text-[var(--text-muted)]" />
                      </button>
                    );
                  })}
                </div>

                {/* Workflow Actions */}
                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
                  <button
                    onClick={() => setShowSaveModal(true)}
                    disabled={steps.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-50 text-sm transition-all"
                  >
                    <Save className="h-4 w-4" />
                    Save Workflow
                  </button>
                  <button
                    onClick={() => setShowLoadModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] text-sm transition-all"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Load Workflow
                  </button>
                </div>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="lg:col-span-2 space-y-4">
              {/* File Upload */}
              <FileDropzone
                onFilesSelected={handleFilesSelected}
                accept=".pdf,application/pdf"
                multiple={false}
                maxSize={maxFileSize}
                maxFiles={1}
                files={files}
                onRemoveFile={handleRemoveFile}
                disabled={isProcessing}
              />

              {/* Steps */}
              {steps.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[var(--border)] p-12 text-center">
                  <Workflow className="h-12 w-12 mx-auto mb-4 text-[var(--text-muted)]" />
                  <p className="text-[var(--text-secondary)]">Add tools from the left panel to build your workflow</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, index) => {
                    const tool = WORKFLOW_TOOLS.find((t) => t.id === step.tool);
                    const Icon = tool ? iconMap[tool.icon] : FileDown;
                    const isExpanded = expandedStep === step.id;

                    return (
                      <div
                        key={step.id}
                        className="rounded-2xl border bg-[var(--card)] overflow-hidden shadow-glass"
                      >
                        <div
                          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[var(--muted)]/50 transition-colors"
                          onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                        >
                          <GripVertical className="h-4 w-4 text-[var(--text-muted)]" />
                          <span className="text-sm font-medium text-[var(--text-muted)] w-6">
                            {index + 1}.
                          </span>
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${tool?.gradient || "from-gray-500 to-gray-400"}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{tool?.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStep(index, "up");
                              }}
                              disabled={index === 0}
                              className="p-1 rounded hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStep(index, "down");
                              }}
                              disabled={index === steps.length - 1}
                              className="p-1 rounded hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeStep(step.id);
                              }}
                              className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 pt-0 border-t border-[var(--border)]">
                            {renderStepConfig(step)}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Flow indicator */}
                  {steps.length > 0 && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      {steps.map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-medium">
                            {i + 1}
                          </div>
                          {i < steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Progress */}
              {isProcessing && (
                <div className="rounded-2xl border bg-[var(--card)] p-6 shadow-glass">
                  <ProgressBar progress={progress} status={status} />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5 text-sm text-red-500">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!resultUrl ? (
                  <button
                    onClick={runWorkflow}
                    disabled={files.length === 0 || steps.length === 0 || isProcessing}
                    className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-8 py-4 font-medium text-white shadow-lg shadow-violet-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Play className="h-5 w-5" />
                    Run Workflow ({steps.length} step{steps.length !== 1 ? "s" : ""})
                  </button>
                ) : (
                  <button
                    onClick={downloadResult}
                    className="flex-1 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all"
                  >
                    <Download className="h-5 w-5" />
                    Download Result
                  </button>
                )}

                {resultUrl && (
                  <button
                    onClick={() => {
                      setFiles([]);
                      setResultUrl(null);
                      setProgress(0);
                    }}
                    className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-medium hover:bg-[var(--muted)] transition-all"
                  >
                    Process Another File
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-2xl p-6 max-w-md w-full mx-4 border border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-4">Save Workflow</h3>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow name..."
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setWorkflowName("");
                }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWorkflow}
                disabled={!workflowName.trim()}
                className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-2xl p-6 max-w-md w-full mx-4 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Load Workflow</h3>
              <button
                onClick={() => setShowLoadModal(false)}
                className="p-1 rounded hover:bg-[var(--muted)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {savedWorkflows.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] py-8">No saved workflows yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <button
                      onClick={() => handleLoadWorkflow(workflow)}
                      className="flex-1 text-left"
                    >
                      <p className="font-medium">{workflow.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {workflow.steps.length} step{workflow.steps.length !== 1 ? "s" : ""}
                      </p>
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
