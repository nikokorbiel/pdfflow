// Template management system for watermarks and signatures
// Supports local storage for free users and cloud sync for Pro users

import { createClient } from "@/lib/supabase/client";

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

// ==================== Cloud Sync for Pro Users ====================

const CLOUD_TEMPLATES_TABLE = "templates";
const SYNC_TIMESTAMP_KEY = "pdfflow_templates_last_sync";

interface CloudTemplate {
  id: string;
  user_id: string;
  name: string;
  type: "watermark" | "signature" | "page-numbers";
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Check if user is Pro and logged in
 */
async function canSyncToCloud(): Promise<{ canSync: boolean; userId?: string }> {
  if (typeof window === "undefined") return { canSync: false };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { canSync: false };

  // Check Pro status
  const isPro = localStorage.getItem("pdf-tools-pro-cached") === "true";
  return { canSync: isPro, userId: user.id };
}

/**
 * Sync local templates to cloud (Pro only)
 */
export async function syncTemplatesToCloud(): Promise<boolean> {
  const { canSync, userId } = await canSyncToCloud();
  if (!canSync || !userId) return false;

  const supabase = createClient();

  try {
    // Get local templates
    const watermarks = getWatermarkTemplates();
    const signatures = getSignatureTemplates();

    // Prepare cloud templates
    const cloudTemplates: Omit<CloudTemplate, "id" | "created_at" | "updated_at">[] = [
      ...watermarks.map(w => ({
        user_id: userId,
        name: w.name,
        type: "watermark" as const,
        config: w as unknown as Record<string, unknown>,
      })),
      ...signatures.map(s => ({
        user_id: userId,
        name: s.name,
        type: "signature" as const,
        config: s as unknown as Record<string, unknown>,
      })),
    ];

    // Upsert to cloud (delete existing and insert new)
    await supabase
      .from(CLOUD_TEMPLATES_TABLE)
      .delete()
      .eq("user_id", userId);

    if (cloudTemplates.length > 0) {
      const { error } = await supabase
        .from(CLOUD_TEMPLATES_TABLE)
        .insert(cloudTemplates);

      if (error) throw error;
    }

    localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
    return true;
  } catch (error) {
    console.error("Failed to sync templates to cloud:", error);
    return false;
  }
}

/**
 * Load templates from cloud (Pro only)
 */
export async function loadTemplatesFromCloud(): Promise<boolean> {
  const { canSync, userId } = await canSyncToCloud();
  if (!canSync || !userId) return false;

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from(CLOUD_TEMPLATES_TABLE)
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    if (data && data.length > 0) {
      // Separate by type
      const watermarks: WatermarkTemplate[] = [];
      const signatures: SignatureTemplate[] = [];

      for (const item of data) {
        const config = item.config as Record<string, unknown>;
        if (item.type === "watermark") {
          watermarks.push({
            ...config,
            id: config.id as string || item.id,
            name: item.name,
          } as WatermarkTemplate);
        } else if (item.type === "signature") {
          signatures.push({
            ...config,
            id: config.id as string || item.id,
            name: item.name,
          } as SignatureTemplate);
        }
      }

      // Save to local storage
      if (watermarks.length > 0) {
        localStorage.setItem(WATERMARK_TEMPLATES_KEY, JSON.stringify(watermarks));
      }
      if (signatures.length > 0) {
        localStorage.setItem(SIGNATURE_TEMPLATES_KEY, JSON.stringify(signatures));
      }

      localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
    }

    return true;
  } catch (error) {
    console.error("Failed to load templates from cloud:", error);
    return false;
  }
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTimestamp(): number | null {
  if (typeof window === "undefined") return null;
  const timestamp = localStorage.getItem(SYNC_TIMESTAMP_KEY);
  return timestamp ? parseInt(timestamp, 10) : null;
}

/**
 * Check if templates need syncing (not synced in last hour)
 */
export function needsSync(): boolean {
  const lastSync = getLastSyncTimestamp();
  if (!lastSync) return true;
  const oneHour = 60 * 60 * 1000;
  return Date.now() - lastSync > oneHour;
}

/**
 * Auto-sync on login/app load for Pro users
 */
export async function autoSyncTemplates(): Promise<void> {
  const { canSync } = await canSyncToCloud();
  if (!canSync) return;

  if (needsSync()) {
    // Load from cloud first (cloud is source of truth)
    await loadTemplatesFromCloud();
  }
}
