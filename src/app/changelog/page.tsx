import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Workflow,
  FileText,
  Shield,
  Palette,
  History,
  ArrowRight,
  Calendar,
  Zap,
  Lock,
  RotateCw,
  Droplets,
  PenTool,
  Hash,
  ArrowUpDown,
  FileDown,
  Combine,
  Split,
  Image,
  FileImage,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog - What's New | PDFflow",
  description: "See the latest updates, new features, and improvements to PDFflow.",
};

interface Update {
  version: string;
  date: string;
  title: string;
  description: string;
  features: {
    title: string;
    description: string;
    icon: React.ElementType;
    link?: string;
    isNew?: boolean;
  }[];
}

const updates: Update[] = [
  {
    version: "1.3.0",
    date: "January 2025",
    title: "Workflow Builder & Templates",
    description: "Chain multiple tools together and save your settings for reuse.",
    features: [
      {
        title: "Workflow Builder",
        description: "Chain multiple PDF tools together in a single workflow. Add compress, watermark, rotate, page numbers, and more - then process files through all steps at once.",
        icon: Workflow,
        link: "/workflow",
        isNew: true,
      },
      {
        title: "Watermark Templates",
        description: "Save your watermark settings as reusable templates. Includes default templates like Confidential, Draft, and Do Not Copy.",
        icon: Droplets,
        link: "/watermark",
        isNew: true,
      },
      {
        title: "Signature Templates",
        description: "Save your signatures for quick reuse. Draw once, use anywhere - your signatures are stored locally for privacy.",
        icon: PenTool,
        link: "/sign",
        isNew: true,
      },
      {
        title: "Comparison Pages",
        description: "See how PDFflow compares to Adobe Acrobat, Smallpdf, iLovePDF, and PDF24 with detailed feature comparisons.",
        icon: FileText,
        link: "/compare",
        isNew: true,
      },
    ],
  },
  {
    version: "1.2.0",
    date: "January 2025",
    title: "SEO Pages & Dark Mode",
    description: "Better discoverability and theme customization.",
    features: [
      {
        title: "Dark/Light Mode",
        description: "Switch between dark and light themes with the toggle in the header. Your preference is saved automatically.",
        icon: Palette,
        isNew: false,
      },
      {
        title: "File History",
        description: "Track your recently processed files in the dashboard. See what you worked on and quickly access tools again.",
        icon: History,
        link: "/dashboard",
        isNew: false,
      },
      {
        title: "SEO Landing Pages",
        description: "Dedicated pages for each tool with detailed information, use cases, and FAQs to help you find the right tool.",
        icon: FileText,
        link: "/tools",
        isNew: false,
      },
    ],
  },
  {
    version: "1.1.0",
    date: "December 2024",
    title: "Authentication & Security",
    description: "User accounts and secure document handling.",
    features: [
      {
        title: "Google Sign-In",
        description: "Sign in with your Google account for a seamless experience. Your settings and preferences sync across devices.",
        icon: Shield,
        isNew: false,
      },
      {
        title: "Protect PDF",
        description: "Add password protection to your PDF documents with industry-standard encryption.",
        icon: Lock,
        link: "/protect",
        isNew: false,
      },
      {
        title: "Unlock PDF",
        description: "Remove password protection from PDFs when you know the password.",
        icon: Lock,
        link: "/unlock",
        isNew: false,
      },
    ],
  },
  {
    version: "1.0.0",
    date: "November 2024",
    title: "Initial Launch",
    description: "PDFflow launches with a full suite of PDF tools.",
    features: [
      {
        title: "Merge PDF",
        description: "Combine multiple PDF files into a single document with drag-and-drop ordering.",
        icon: Combine,
        link: "/merge",
        isNew: false,
      },
      {
        title: "Split PDF",
        description: "Extract pages or split PDFs into separate files by page ranges.",
        icon: Split,
        link: "/split",
        isNew: false,
      },
      {
        title: "Compress PDF",
        description: "Reduce PDF file size without significant quality loss.",
        icon: FileDown,
        link: "/compress",
        isNew: false,
      },
      {
        title: "PDF to Image",
        description: "Convert PDF pages to high-quality PNG or JPG images.",
        icon: Image,
        link: "/pdf-to-image",
        isNew: false,
      },
      {
        title: "Image to PDF",
        description: "Create PDFs from multiple images with customizable ordering.",
        icon: FileImage,
        link: "/image-to-pdf",
        isNew: false,
      },
      {
        title: "Rotate PDF",
        description: "Rotate pages 90°, 180°, or 270° individually or in bulk.",
        icon: RotateCw,
        link: "/rotate",
        isNew: false,
      },
      {
        title: "Add Watermark",
        description: "Add text or image watermarks with full customization.",
        icon: Droplets,
        link: "/watermark",
        isNew: false,
      },
      {
        title: "Page Numbers",
        description: "Add page numbers with customizable position and format.",
        icon: Hash,
        link: "/page-numbers",
        isNew: false,
      },
      {
        title: "Reorder Pages",
        description: "Drag and drop to rearrange pages in your PDF.",
        icon: ArrowUpDown,
        link: "/reorder",
        isNew: false,
      },
      {
        title: "Sign PDF",
        description: "Add signatures by drawing, typing, or uploading an image.",
        icon: PenTool,
        link: "/sign",
        isNew: false,
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--primary)]/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Always Improving
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            What&apos;s New in PDFflow
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            We&apos;re constantly adding new features and improvements.
            Here&apos;s what&apos;s been happening.
          </p>
        </div>
      </section>

      {/* Updates */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {updates.map((update, index) => (
              <div key={update.version} className="relative">
                {/* Version badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)] text-white text-sm font-medium">
                    <Zap className="h-4 w-4" />
                    v{update.version}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                    <Calendar className="h-4 w-4" />
                    {update.date}
                  </div>
                  {index === 0 && (
                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                      Latest
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h2 className="text-2xl font-bold mb-2">{update.title}</h2>
                <p className="text-[var(--text-secondary)] mb-8">{update.description}</p>

                {/* Features grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {update.features.map((feature) => (
                    <div
                      key={feature.title}
                      className="relative p-5 rounded-2xl border bg-[var(--card)] hover:shadow-lg hover:border-[var(--border-hover)] transition-all group"
                    >
                      {feature.isNew && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                          New
                        </span>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10">
                          <feature.icon className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">{feature.title}</h3>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {feature.description}
                          </p>
                          {feature.link && (
                            <Link
                              href={feature.link}
                              className="inline-flex items-center gap-1 mt-3 text-sm text-[var(--primary)] font-medium hover:opacity-80 transition-opacity"
                            >
                              Try it now
                              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                {index < updates.length - 1 && (
                  <div className="mt-16 border-b border-[var(--border)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have a Feature Request?</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            We&apos;re always looking for ways to improve PDFflow.
            Let us know what features you&apos;d like to see.
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-medium shadow-lg hover:opacity-90 transition-all"
          >
            Explore All Tools
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
