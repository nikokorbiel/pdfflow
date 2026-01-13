// PDFflow branding for free tier users
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const BRAND_TEXT = "Processed with PDFflow.space";
const BRAND_FONT_SIZE = 8;
const BRAND_MARGIN = 15;
const BRAND_COLOR = { r: 0.6, g: 0.6, b: 0.6 }; // Light gray

// Helper to safely convert to ArrayBuffer for Blob
function toArrayBuffer(data: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (data instanceof ArrayBuffer) return data;
  // Create a proper ArrayBuffer copy
  return (data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength);
}

/**
 * Adds a subtle PDFflow branding watermark to PDFs for free tier users.
 * Pro users bypass this to get clean outputs.
 */
export async function addFreeTierBranding(
  pdfBytes: Uint8Array | ArrayBuffer,
  isPro: boolean
): Promise<Blob> {
  // Pro users get clean output
  if (isPro) {
    return new Blob([toArrayBuffer(pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes))], { type: "application/pdf" });
  }

  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    // Only add branding to the last page
    const lastPage = pages[pages.length - 1];
    const { width } = lastPage.getSize();

    const textWidth = font.widthOfTextAtSize(BRAND_TEXT, BRAND_FONT_SIZE);
    const x = (width - textWidth) / 2; // Center horizontally

    lastPage.drawText(BRAND_TEXT, {
      x,
      y: BRAND_MARGIN,
      size: BRAND_FONT_SIZE,
      font,
      color: rgb(BRAND_COLOR.r, BRAND_COLOR.g, BRAND_COLOR.b),
    });

    const resultBytes = await pdfDoc.save();
    return new Blob([toArrayBuffer(resultBytes)], { type: "application/pdf" });
  } catch (error) {
    console.warn("Failed to add branding:", error);
    // Return original bytes if branding fails
    const bytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    return new Blob([toArrayBuffer(bytes)], { type: "application/pdf" });
  }
}

/**
 * Wrapper that handles Blob conversion with branding
 */
export async function createBrandedPdfBlob(
  pdfBytes: Uint8Array,
  isPro: boolean
): Promise<Blob> {
  return addFreeTierBranding(pdfBytes, isPro);
}
