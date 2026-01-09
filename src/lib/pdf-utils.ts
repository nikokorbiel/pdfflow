// Cache the pdfjsLib instance
let pdfjsLibInstance: any = null;
let pdfjsLoadPromise: Promise<any> | null = null;

const PDFJS_VERSION = "3.11.174";
const PDFJS_CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

// Load pdfjs-dist from CDN using script tag to avoid webpack bundling issues
const loadPdfJsFromCDN = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    // Create script element for the main library
    const script = document.createElement("script");
    script.src = `${PDFJS_CDN_BASE}/pdf.min.js`;
    script.async = true;

    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        // Set worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN_BASE}/pdf.worker.min.js`;
        resolve(pdfjsLib);
      } else {
        reject(new Error("pdfjsLib not found after script load"));
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load PDF.js from CDN"));
    };

    document.head.appendChild(script);
  });
};

// Utility for loading pdfjs-dist only on client side
export const loadPdfJs = async (): Promise<any> => {
  if (typeof window === "undefined") {
    throw new Error("pdfjs-dist can only be used on the client side");
  }

  // Return cached instance if available
  if (pdfjsLibInstance) {
    return pdfjsLibInstance;
  }

  // Prevent multiple simultaneous loads
  if (pdfjsLoadPromise) {
    return pdfjsLoadPromise;
  }

  pdfjsLoadPromise = loadPdfJsFromCDN();
  pdfjsLibInstance = await pdfjsLoadPromise;
  return pdfjsLibInstance;
};

// Generate page thumbnails from a PDF file
export const generatePdfThumbnails = async (
  file: File,
  scale: number = 0.3
): Promise<string[]> => {
  try {
    console.log("[PDF Utils] Loading pdfjs-dist from CDN...");
    const pdfjsLib = await loadPdfJs();
    console.log("[PDF Utils] pdfjs-dist loaded, version:", pdfjsLib.version);

    console.log("[PDF Utils] Reading file buffer...");
    const fileBuffer = await file.arrayBuffer();
    console.log("[PDF Utils] File buffer size:", fileBuffer.byteLength);

    console.log("[PDF Utils] Loading PDF document...");
    const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    console.log("[PDF Utils] PDF loaded, pages:", pdf.numPages);

    const images: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`[PDF Utils] Rendering page ${i}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;

      await page.render({ canvasContext: ctx, viewport }).promise;
      images.push(canvas.toDataURL("image/jpeg", 0.7));
    }

    console.log("[PDF Utils] All pages rendered successfully");
    return images;
  } catch (error) {
    console.error("[PDF Utils] Error:", error);
    throw error;
  }
};

// Extract text from PDF
export const extractPdfText = async (file: File): Promise<{ text: string; numPages: number }> => {
  const pdfjsLib = await loadPdfJs();
  const fileBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;

  let fullText = "";
  const totalPages = pdf.numPages;

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    let pageText = "";
    let lastY = -1;

    for (const item of textContent.items) {
      if ("str" in item) {
        const textItem = item as { str: string; transform: number[] };
        const currentY = textItem.transform[5];

        if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
          pageText += "\n";
        } else if (lastY !== -1 && pageText.length > 0 && !pageText.endsWith(" ")) {
          pageText += " ";
        }

        pageText += textItem.str;
        lastY = currentY;
      }
    }

    fullText += pageText + "\n\n--- Page " + i + " ---\n\n";
  }

  return { text: fullText, numPages: totalPages };
};
