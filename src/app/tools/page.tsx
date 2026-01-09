import { Metadata } from "next";
import Link from "next/link";
import {
  Combine,
  Split,
  FileDown,
  Image,
  FileImage,
  RotateCw,
  Droplets,
  Hash,
  ArrowUpDown,
  PenTool,
  Lock,
  Unlock,
  FileText,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "All PDF Tools - Free Online PDF Editor | PDFflow",
  description:
    "Complete collection of free PDF tools. Merge, split, compress, convert, edit, and secure your PDFs online. No registration required.",
  keywords: [
    "pdf tools",
    "pdf editor",
    "online pdf tools",
    "free pdf tools",
    "pdf converter",
    "pdf merger",
    "pdf splitter",
  ],
};

const tools = [
  {
    name: "Merge PDF",
    description: "Combine multiple PDF files into one document",
    href: "/tools/merge-pdf",
    toolHref: "/merge",
    icon: Combine,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "Split PDF",
    description: "Extract pages or split into separate files",
    href: "/tools/split-pdf",
    toolHref: "/split",
    icon: Split,
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    name: "Compress PDF",
    description: "Reduce PDF file size without losing quality",
    href: "/tools/compress-pdf",
    toolHref: "/compress",
    icon: FileDown,
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    name: "PDF to Image",
    description: "Convert PDF pages to PNG or JPG images",
    href: "/tools/pdf-to-image",
    toolHref: "/pdf-to-image",
    icon: Image,
    gradient: "from-orange-500 to-amber-400",
  },
  {
    name: "Image to PDF",
    description: "Create PDF from images",
    href: "/tools/image-to-pdf",
    toolHref: "/image-to-pdf",
    icon: FileImage,
    gradient: "from-indigo-500 to-blue-400",
  },
  {
    name: "PDF to Word",
    description: "Convert PDF to editable Word document",
    href: "/tools/pdf-to-word",
    toolHref: "/pdf-to-word",
    icon: FileText,
    gradient: "from-blue-600 to-blue-400",
  },
  {
    name: "Rotate PDF",
    description: "Rotate pages in any direction",
    href: "/tools/rotate-pdf",
    toolHref: "/rotate",
    icon: RotateCw,
    gradient: "from-teal-500 to-cyan-400",
  },
  {
    name: "Watermark PDF",
    description: "Add text or image watermarks",
    href: "/tools/watermark-pdf",
    toolHref: "/watermark",
    icon: Droplets,
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    name: "Page Numbers",
    description: "Add page numbers to your PDF",
    href: "/tools/page-numbers",
    toolHref: "/page-numbers",
    icon: Hash,
    gradient: "from-slate-500 to-gray-400",
  },
  {
    name: "Reorder Pages",
    description: "Drag and drop to rearrange pages",
    href: "/tools/reorder-pages",
    toolHref: "/reorder",
    icon: ArrowUpDown,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    name: "Sign PDF",
    description: "Add signatures and initials",
    href: "/tools/sign-pdf",
    toolHref: "/sign",
    icon: PenTool,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Protect PDF",
    description: "Password-protect your PDF",
    href: "/tools/protect-pdf",
    toolHref: "/protect",
    icon: Lock,
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    name: "Unlock PDF",
    description: "Remove PDF password protection",
    href: "/tools/unlock-pdf",
    toolHref: "/unlock",
    icon: Unlock,
    gradient: "from-cyan-500 to-sky-500",
  },
];

export default function AllToolsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--primary)]/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            All PDF Tools
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Everything you need to work with PDFs. Fast, free, and secure.
            All processing happens in your browser.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.toolHref}
                className="group p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg hover:border-[var(--border-hover)] transition-all"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg mb-4`}
                >
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-lg font-semibold mb-2 group-hover:text-[var(--primary)] transition-colors">
                  {tool.name}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  {tool.description}
                </p>
                <span className="inline-flex items-center text-sm text-[var(--primary)] font-medium">
                  Use Tool
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need More Power?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Upgrade to Pro for unlimited processing, larger files, and priority support.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-medium shadow-lg hover:opacity-90 transition-all"
          >
            View Pricing
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
