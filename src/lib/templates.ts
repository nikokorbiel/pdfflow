// Template management system for watermarks and signatures

export interface WatermarkTemplate {
  id: string;
  name: string;
  type: "text" | "image";
  // Text watermark settings
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  opacity?: number;
  rotation?: number;
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "diagonal";
  // Image watermark settings (stored as base64)
  imageData?: string;
  imageWidth?: number;
  imageHeight?: number;
  // Metadata
  createdAt: number;
  updatedAt: number;
}

export interface SignatureTemplate {
  id: string;
  name: string;
  type: "draw" | "type" | "image";
  // Drawn signature (stored as base64 data URL)
  signatureData?: string;
  // Typed signature
  typedText?: string;
  fontFamily?: string;
  // Common settings
  color?: string;
  width?: number;
  height?: number;
  // Metadata
  createdAt: number;
  updatedAt: number;
}

const WATERMARK_TEMPLATES_KEY = "pdfflow_watermark_templates";
const SIGNATURE_TEMPLATES_KEY = "pdfflow_signature_templates";

// ==================== Watermark Templates ====================

export function getWatermarkTemplates(): WatermarkTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WATERMARK_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveWatermarkTemplate(template: Omit<WatermarkTemplate, "id" | "createdAt" | "updatedAt">): WatermarkTemplate {
  const templates = getWatermarkTemplates();
  const newTemplate: WatermarkTemplate = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  templates.push(newTemplate);
  localStorage.setItem(WATERMARK_TEMPLATES_KEY, JSON.stringify(templates));
  return newTemplate;
}

export function updateWatermarkTemplate(id: string, updates: Partial<WatermarkTemplate>): WatermarkTemplate | null {
  const templates = getWatermarkTemplates();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return null;

  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: Date.now(),
  };
  localStorage.setItem(WATERMARK_TEMPLATES_KEY, JSON.stringify(templates));
  return templates[index];
}

export function deleteWatermarkTemplate(id: string): boolean {
  const templates = getWatermarkTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return false;
  localStorage.setItem(WATERMARK_TEMPLATES_KEY, JSON.stringify(filtered));
  return true;
}

// ==================== Signature Templates ====================

export function getSignatureTemplates(): SignatureTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SIGNATURE_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveSignatureTemplate(template: Omit<SignatureTemplate, "id" | "createdAt" | "updatedAt">): SignatureTemplate {
  const templates = getSignatureTemplates();
  const newTemplate: SignatureTemplate = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  templates.push(newTemplate);
  localStorage.setItem(SIGNATURE_TEMPLATES_KEY, JSON.stringify(templates));
  return newTemplate;
}

export function updateSignatureTemplate(id: string, updates: Partial<SignatureTemplate>): SignatureTemplate | null {
  const templates = getSignatureTemplates();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return null;

  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: Date.now(),
  };
  localStorage.setItem(SIGNATURE_TEMPLATES_KEY, JSON.stringify(templates));
  return templates[index];
}

export function deleteSignatureTemplate(id: string): boolean {
  const templates = getSignatureTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return false;
  localStorage.setItem(SIGNATURE_TEMPLATES_KEY, JSON.stringify(filtered));
  return true;
}

// ==================== Default Templates ====================

export const defaultWatermarkTemplates: Omit<WatermarkTemplate, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Confidential",
    type: "text",
    text: "CONFIDENTIAL",
    fontSize: 48,
    fontFamily: "Arial",
    color: "#ff0000",
    opacity: 0.3,
    rotation: -45,
    position: "diagonal",
  },
  {
    name: "Draft",
    type: "text",
    text: "DRAFT",
    fontSize: 72,
    fontFamily: "Arial",
    color: "#888888",
    opacity: 0.2,
    rotation: -45,
    position: "diagonal",
  },
  {
    name: "Do Not Copy",
    type: "text",
    text: "DO NOT COPY",
    fontSize: 36,
    fontFamily: "Arial",
    color: "#ff6600",
    opacity: 0.25,
    rotation: -30,
    position: "diagonal",
  },
  {
    name: "Sample",
    type: "text",
    text: "SAMPLE",
    fontSize: 64,
    fontFamily: "Arial",
    color: "#0066ff",
    opacity: 0.15,
    rotation: -45,
    position: "center",
  },
];

export function initializeDefaultWatermarkTemplates(): void {
  const templates = getWatermarkTemplates();
  if (templates.length === 0) {
    defaultWatermarkTemplates.forEach((template) => {
      saveWatermarkTemplate(template);
    });
  }
}
