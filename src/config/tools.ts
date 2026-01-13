import {
  Combine,
  Split,
  FileDown,
  Image,
  FileImage,
  RotateCw,
  FileText,
  Table,
  Presentation,
  Code,
  Crop,
  Trash2,
  ImageIcon,
  Droplets,
  Hash,
  ArrowUpDown,
  PenTool,
  Unlock,
  EyeOff,
  Wrench,
  Layers,
  Palette,
  Type,
  FilePlus,
  Copy,
  Info,
  Grid,
  Scissors,
  ScanLine,
  Contrast,
  FileCode,
  FileOutput,
  ArrowDownUp,
  Maximize2,
  Square,
  GitCompare,
  MinusSquare,
  Sun,
  ImagePlus,
  ListOrdered,
  SunMedium,
  SplitSquareVertical,
  Shuffle,
  ZoomIn,
  Code2,
  CircleDot,
  ShieldOff,
  Tag,
  HardDrive,
  Stamp,
  Layers3,
  Focus,
  Globe,
  RotateCcw,
  ArrowUpAZ,
  AlignCenter,
  BookOpen,
  FileX,
  Binary,
  QrCode,
  Lock,
  Shapes,
  LayoutGrid,
  Expand,
  FlipHorizontal2,
  GitCompareArrows,
  Paperclip,
  Scaling,
  Minimize2,
  Grid3X3,
  FlipVertical2,
  Link2Off,
  CircleOff,
  Grid2X2,
  Frame,
  FileCode2,
  Braces,
  Droplet,
  Rainbow,
  MessageSquareOff,
  List,
  Bookmark,
  Circle,
  Tv,
  Layers2,
  LucideIcon,
} from "lucide-react";

export type ToolCategory =
  | "core"
  | "convert"
  | "edit"
  | "security"
  | "images"
  | "optimize"
  | "advanced"
  | "documents";

export interface Tool {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: ToolCategory;
}

export const categories: Record<ToolCategory, { name: string; description: string }> = {
  core: { name: "Core PDF", description: "Essential PDF operations" },
  convert: { name: "Convert", description: "Format conversions" },
  edit: { name: "Edit & Enhance", description: "Modify and enhance PDFs" },
  security: { name: "Security", description: "Protect and secure PDFs" },
  images: { name: "Image Tools", description: "Image manipulation" },
  optimize: { name: "Optimize", description: "Improve PDF quality" },
  advanced: { name: "Advanced", description: "Power user tools" },
  documents: { name: "Documents", description: "Document utilities" },
};

export const tools: Tool[] = [
  // Core PDF
  { name: "Merge PDF", description: "Combine multiple PDFs into one", href: "/merge", icon: Combine, category: "core" },
  { name: "Split PDF", description: "Extract or divide your PDF", href: "/split", icon: Split, category: "core" },
  { name: "Compress PDF", description: "Reduce file size, keep quality", href: "/compress", icon: FileDown, category: "core" },
  { name: "Rotate PDF", description: "Rotate pages any direction", href: "/rotate", icon: RotateCw, category: "core" },
  { name: "Reorder Pages", description: "Drag & drop to rearrange", href: "/reorder", icon: ArrowUpDown, category: "core" },
  { name: "Delete Pages", description: "Remove unwanted pages", href: "/delete-pages", icon: Trash2, category: "core" },
  { name: "Extract Pages", description: "Save specific pages as new PDF", href: "/extract-pages", icon: FileOutput, category: "core" },
  { name: "Reverse Pages", description: "Flip page order", href: "/reverse-pages", icon: ArrowDownUp, category: "core" },
  { name: "Duplicate Pages", description: "Copy specific pages", href: "/duplicate-pages", icon: Copy, category: "core" },
  { name: "Add Blank Pages", description: "Insert blank pages anywhere", href: "/add-blank-pages", icon: FilePlus, category: "core" },
  { name: "Remove Blank Pages", description: "Detect and remove blank pages", href: "/remove-blank-pages", icon: FileX, category: "core" },
  { name: "Page Count", description: "Count pages in PDFs", href: "/page-count", icon: Hash, category: "core" },

  // Convert
  { name: "PDF to Image", description: "Convert pages to PNG/JPG", href: "/pdf-to-image", icon: Image, category: "convert" },
  { name: "Image to PDF", description: "Create PDF from images", href: "/image-to-pdf", icon: FileImage, category: "convert" },
  { name: "PDF to Word", description: "Convert to editable DOCX", href: "/pdf-to-word", icon: FileText, category: "convert" },
  { name: "PDF to Excel", description: "Extract tables to spreadsheet", href: "/pdf-to-excel", icon: Table, category: "convert" },
  { name: "PDF to PowerPoint", description: "Convert to slide images", href: "/pdf-to-powerpoint", icon: Presentation, category: "convert" },
  { name: "PDF to HTML", description: "Convert PDF to HTML", href: "/pdf-to-html", icon: Code2, category: "convert" },
  { name: "PDF to Markdown", description: "Convert to Markdown format", href: "/pdf-to-markdown", icon: FileCode, category: "convert" },
  { name: "PDF to TXT", description: "Extract plain text", href: "/pdf-to-txt", icon: FileText, category: "convert" },
  { name: "PDF to SVG", description: "Convert to vector format", href: "/pdf-to-svg", icon: Shapes, category: "convert" },
  { name: "PDF to Base64", description: "Convert PDF to Base64 string", href: "/pdf-to-base64", icon: Binary, category: "convert" },
  { name: "PDF to TIFF", description: "Convert PDF to high-quality images", href: "/pdf-to-tiff", icon: Image, category: "convert" },
  { name: "HTML to PDF", description: "Convert web pages to PDF", href: "/html-to-pdf", icon: Code, category: "convert" },
  { name: "Markdown to PDF", description: "Convert Markdown to PDF", href: "/markdown-to-pdf", icon: FileCode2, category: "convert" },
  { name: "Text to PDF", description: "Convert text to PDF", href: "/text-to-pdf", icon: FileText, category: "convert" },

  // Edit & Enhance
  { name: "Crop PDF", description: "Trim and resize pages", href: "/crop", icon: Crop, category: "edit" },
  { name: "Watermark", description: "Add text or image watermarks", href: "/watermark", icon: Droplets, category: "edit" },
  { name: "Sign PDF", description: "Add signatures & initials", href: "/sign", icon: PenTool, category: "edit" },
  { name: "Page Numbers", description: "Add page numbering", href: "/page-numbers", icon: Hash, category: "edit" },
  { name: "Headers & Footers", description: "Add custom headers/footers", href: "/headers-footers", icon: Type, category: "edit" },
  { name: "Add Background", description: "Add color or image background", href: "/add-background", icon: ImagePlus, category: "edit" },
  { name: "Add Border", description: "Add decorative borders", href: "/add-border", icon: Square, category: "edit" },
  { name: "Add Margins", description: "Add space around pages", href: "/add-margins", icon: Square, category: "edit" },
  { name: "Stamp PDF", description: "Add rubber stamp annotations", href: "/stamp", icon: Stamp, category: "edit" },
  { name: "Add QR Code", description: "Add QR codes to PDF pages", href: "/add-qr-code", icon: QrCode, category: "edit" },
  { name: "Add Grid", description: "Add grid overlay to PDFs", href: "/add-grid", icon: Grid3X3, category: "edit" },
  { name: "Add Bookmarks", description: "Add navigation bookmarks", href: "/add-bookmarks", icon: Bookmark, category: "edit" },
  { name: "Bates Numbering", description: "Add legal Bates numbers", href: "/bates-numbering", icon: ListOrdered, category: "edit" },
  { name: "Add Page Labels", description: "Custom page numbering", href: "/add-page-labels", icon: Tag, category: "edit" },
  { name: "Overlay PDFs", description: "Layer PDFs on top of each other", href: "/overlay", icon: Layers3, category: "edit" },
  { name: "Center Content", description: "Center content on new page size", href: "/center-content", icon: AlignCenter, category: "edit" },
  { name: "Edit Metadata", description: "View & edit PDF properties", href: "/metadata", icon: FileText, category: "edit" },

  // Security
  { name: "Encrypt PDF", description: "Add password protection", href: "/encrypt", icon: Lock, category: "security" },
  { name: "Unlock PDF", description: "Remove PDF password", href: "/unlock", icon: Unlock, category: "security" },
  { name: "Redact PDF", description: "Hide sensitive information", href: "/redact", icon: EyeOff, category: "security" },
  { name: "Remove Metadata", description: "Strip all PDF metadata", href: "/remove-metadata", icon: ShieldOff, category: "security" },
  { name: "Remove Links", description: "Remove hyperlinks from PDF", href: "/remove-links", icon: Link2Off, category: "security" },
  { name: "Remove Annotations", description: "Strip PDF annotations", href: "/remove-annotations", icon: MessageSquareOff, category: "security" },

  // Image Tools
  { name: "Grayscale Images", description: "Convert images to B&W", href: "/grayscale-images", icon: Palette, category: "images" },
  { name: "Resize Images", description: "Batch resize images", href: "/resize-images", icon: Scaling, category: "images" },
  { name: "Rotate Images", description: "Batch rotate images", href: "/rotate-images", icon: RotateCw, category: "images" },
  { name: "Crop Images", description: "Batch crop images", href: "/crop-images", icon: Crop, category: "images" },
  { name: "Flip Images", description: "Mirror images horizontally/vertically", href: "/flip-images", icon: FlipVertical2, category: "images" },
  { name: "Compress Images", description: "Reduce image file sizes", href: "/compress-images", icon: Minimize2, category: "images" },
  { name: "Negative Images", description: "Invert image colors", href: "/negative-images", icon: CircleOff, category: "images" },
  { name: "Pixelate Images", description: "Apply pixelation effect", href: "/pixelate-images", icon: Grid2X2, category: "images" },
  { name: "Add Text to Images", description: "Overlay text on images", href: "/add-text-to-images", icon: Type, category: "images" },
  { name: "Add Frame", description: "Add decorative frames", href: "/add-frame", icon: Frame, category: "images" },
  { name: "Image Saturation", description: "Adjust color saturation", href: "/image-saturation", icon: Droplet, category: "images" },
  { name: "Shift Hue", description: "Shift image colors", href: "/image-hue", icon: Rainbow, category: "images" },
  { name: "Vignette", description: "Add vignette effect", href: "/vignette", icon: Circle, category: "images" },
  { name: "Add Noise", description: "Add film grain noise", href: "/image-noise", icon: Tv, category: "images" },
  { name: "Posterize", description: "Reduce color levels", href: "/image-posterize", icon: Layers2, category: "images" },
  { name: "Image to Base64", description: "Convert images to Base64", href: "/image-to-base64", icon: Binary, category: "images" },
  { name: "Extract Images", description: "Pull images from PDF", href: "/extract-images", icon: ImageIcon, category: "images" },
  { name: "Sepia PDF", description: "Apply vintage sepia tone", href: "/sepia", icon: Sun, category: "images" },

  // Optimize
  { name: "Flatten PDF", description: "Flatten forms & layers", href: "/flatten", icon: Layers, category: "optimize" },
  { name: "Repair PDF", description: "Fix corrupted PDFs", href: "/repair", icon: Wrench, category: "optimize" },
  { name: "Web Optimize", description: "Optimize for fast web viewing", href: "/linearize", icon: Globe, category: "optimize" },
  { name: "Deskew PDF", description: "Straighten scanned pages", href: "/deskew", icon: RotateCw, category: "optimize" },
  { name: "Auto Rotate", description: "Fix page orientation automatically", href: "/auto-rotate", icon: RotateCcw, category: "optimize" },
  { name: "Sharpen PDF", description: "Enhance edges and details", href: "/sharpen", icon: Focus, category: "optimize" },
  { name: "Blur PDF", description: "Add blur effect to pages", href: "/blur", icon: CircleDot, category: "optimize" },
  { name: "Brightness/Contrast", description: "Adjust brightness & contrast", href: "/brightness", icon: SunMedium, category: "optimize" },
  { name: "Grayscale PDF", description: "Convert to black & white", href: "/grayscale", icon: Palette, category: "optimize" },
  { name: "Invert Colors", description: "Create negative/inverted PDF", href: "/invert-colors", icon: Contrast, category: "optimize" },

  // Advanced
  { name: "N-Up Layout", description: "Multiple pages per sheet", href: "/n-up", icon: Grid, category: "advanced" },
  { name: "Tile PDF", description: "Split pages into tiles", href: "/tile", icon: LayoutGrid, category: "advanced" },
  { name: "Create Poster", description: "Split page for large prints", href: "/poster", icon: Expand, category: "advanced" },
  { name: "Create Booklet", description: "Reorder pages for booklet printing", href: "/booklet", icon: BookOpen, category: "advanced" },
  { name: "Mirror PDF", description: "Flip pages horizontally/vertically", href: "/mirror", icon: FlipHorizontal2, category: "advanced" },
  { name: "Interleave PDFs", description: "Alternate pages from two PDFs", href: "/interleave", icon: Shuffle, category: "advanced" },
  { name: "Scale PDF", description: "Scale pages by percentage", href: "/scale", icon: ZoomIn, category: "advanced" },
  { name: "Resize PDF", description: "Change page dimensions", href: "/resize", icon: Maximize2, category: "advanced" },
  { name: "Sort Pages", description: "Sort pages by size", href: "/sort-pages", icon: ArrowUpAZ, category: "advanced" },
  { name: "Split Every N", description: "Split by page count", href: "/split-every-n", icon: Scissors, category: "advanced" },
  { name: "Split by Size", description: "Split by file size limit", href: "/split-by-size", icon: HardDrive, category: "advanced" },
  { name: "Compare PDFs", description: "Side-by-side comparison", href: "/compare-pdfs", icon: GitCompare, category: "advanced" },
  { name: "PDF Diff", description: "Compare two PDFs", href: "/pdf-diff", icon: GitCompareArrows, category: "advanced" },
  { name: "PDF Outline", description: "View table of contents", href: "/pdf-outline", icon: List, category: "advanced" },
  { name: "Odd/Even Pages", description: "Extract odd or even pages", href: "/odd-even-pages", icon: SplitSquareVertical, category: "advanced" },
  { name: "Remove Pages", description: "Delete specific pages", href: "/remove-pages", icon: MinusSquare, category: "advanced" },

  // Documents
  { name: "JSON to PDF", description: "Convert JSON to PDF", href: "/json-to-pdf", icon: Braces, category: "documents" },
  { name: "CSV to PDF", description: "Convert CSV to PDF tables", href: "/csv-to-pdf", icon: Table, category: "documents" },
  { name: "OCR PDF", description: "Extract text from scans", href: "/ocr", icon: ScanLine, category: "documents" },
  { name: "Word Count", description: "Count words in PDFs", href: "/word-count", icon: FileText, category: "documents" },
  { name: "Add Attachment", description: "Embed files in PDF", href: "/add-attachment", icon: Paperclip, category: "documents" },
  { name: "Extract Text", description: "Pull text from PDF", href: "/extract-text", icon: FileText, category: "documents" },
  { name: "Page Info", description: "View PDF details & metadata", href: "/page-info", icon: Info, category: "documents" },
];

export const getToolsByCategory = (category: ToolCategory | "all"): Tool[] => {
  if (category === "all") return tools;
  return tools.filter(tool => tool.category === category);
};

export const searchTools = (query: string): Tool[] => {
  const lowerQuery = query.toLowerCase();
  return tools.filter(tool =>
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery)
  );
};

export const getCategoryCount = (category: ToolCategory | "all"): number => {
  if (category === "all") return tools.length;
  return tools.filter(tool => tool.category === category).length;
};
