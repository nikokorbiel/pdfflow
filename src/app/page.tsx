"use client";

import Link from "next/link";
import {
  Combine,
  Split,
  FileDown,
  Image,
  FileImage,
  RotateCw,
  Shield,
  ArrowRight,
  FileText,
  Droplets,
  Hash,
  ArrowUpDown,
  PenTool,
  Unlock,
  Sparkles,
  Table,
  Presentation,
  Code,
  Crop,
  Trash2,
  ImageIcon,
  EyeOff,
  Wrench,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { ToolRequestModal } from "@/components/ToolRequestModal";

const tools = [
  { name: "Merge PDF", description: "Combine multiple PDFs", href: "/merge", icon: Combine },
  { name: "Split PDF", description: "Extract pages", href: "/split", icon: Split },
  { name: "Compress PDF", description: "Reduce file size", href: "/compress", icon: FileDown },
  { name: "PDF to Image", description: "Convert to PNG/JPG", href: "/pdf-to-image", icon: Image },
  { name: "Image to PDF", description: "Images to PDF", href: "/image-to-pdf", icon: FileImage },
  { name: "PDF to Word", description: "Convert to DOCX", href: "/pdf-to-word", icon: FileText },
  { name: "PDF to Excel", description: "Extract tables", href: "/pdf-to-excel", icon: Table },
  { name: "PDF to PowerPoint", description: "Convert to PPTX", href: "/pdf-to-powerpoint", icon: Presentation },
  { name: "HTML to PDF", description: "Web to PDF", href: "/html-to-pdf", icon: Code },
  { name: "Rotate PDF", description: "Rotate pages", href: "/rotate", icon: RotateCw },
  { name: "Crop PDF", description: "Trim pages", href: "/crop", icon: Crop },
  { name: "Delete Pages", description: "Remove pages", href: "/delete-pages", icon: Trash2 },
  { name: "Extract Images", description: "Pull images out", href: "/extract-images", icon: ImageIcon },
  { name: "Watermark", description: "Add watermarks", href: "/watermark", icon: Droplets },
  { name: "Page Numbers", description: "Number pages", href: "/page-numbers", icon: Hash },
  { name: "Reorder Pages", description: "Rearrange pages", href: "/reorder", icon: ArrowUpDown },
  { name: "Sign PDF", description: "Add signatures", href: "/sign", icon: PenTool },
  { name: "Unlock PDF", description: "Remove password", href: "/unlock", icon: Unlock },
  { name: "Redact PDF", description: "Hide content", href: "/redact", icon: EyeOff },
  { name: "Repair PDF", description: "Fix corrupted files", href: "/repair", icon: Wrench },
  { name: "Flatten PDF", description: "Flatten layers", href: "/flatten", icon: Layers },
];

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toolRequestOpen, setToolRequestOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero - Simple, direct */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight">
            21 PDF tools.
            <br />
            <span className="text-[#64748b]">Zero uploads.</span>
          </h1>

          <p className="mt-6 text-lg text-[#94a3b8] max-w-lg mx-auto">
            Everything runs in your browser. Your files never leave your device.
            No accounts, no limits, no BS.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="#tools"
              className="px-8 py-3.5 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Use a Tool
            </Link>
            <button
              onClick={handleGetStarted}
              className="px-8 py-3.5 text-white font-medium rounded-lg border border-[#334155] hover:bg-white/5 transition-colors"
            >
              {user ? "Dashboard" : "Sign Up"}
            </button>
          </div>

          {/* Trust line - not a badge wall, just facts */}
          <p className="mt-12 text-sm text-[#64748b]">
            Free forever for basic use. No watermarks. No email required. Just use it.
          </p>
        </div>
      </section>

      {/* Tools Grid - The actual product */}
      <section id="tools" className="py-16 px-4 border-t border-[#1e293b]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-white">All Tools</h2>
            <button
              onClick={() => setToolRequestOpen(true)}
              className="text-sm text-[#64748b] hover:text-white transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Request a tool
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group p-4 rounded-xl bg-[#0a0a0f] border border-[#1e293b] hover:border-[#334155] hover:bg-[#0f0f14] transition-all"
              >
                <tool.icon className="w-5 h-5 text-[#64748b] group-hover:text-white transition-colors mb-3" />
                <div className="font-medium text-white text-sm">{tool.name}</div>
                <div className="text-xs text-[#64748b] mt-0.5">{tool.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why PDFflow - Substance, not fluff */}
      <section className="py-16 px-4 border-t border-[#1e293b]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-8">Why PDFflow?</h2>

          <div className="space-y-6 text-[#94a3b8]">
            <div className="flex gap-4">
              <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white font-medium">Actually private</div>
                <p className="mt-1 text-sm">
                  Not &ldquo;we delete your files after processing&rdquo; private. Actually private.
                  Your PDFs are processed by JavaScript in your browser. We couldn&apos;t see your files if we wanted to.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-center font-bold text-blue-400">21</div>
              <div>
                <div className="text-white font-medium">More tools than you&apos;ll ever need</div>
                <p className="mt-1 text-sm">
                  Merge, split, compress, convert, rotate, crop, sign, watermark, redact, repair...
                  If you can do it to a PDF, we probably have a tool for it.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-center font-bold text-amber-400">$0</div>
              <div>
                <div className="text-white font-medium">Free. For real.</div>
                <p className="mt-1 text-sm">
                  No &ldquo;free trial&rdquo; that expires. No watermarks on free tier. No daily limits.
                  Pro exists for power users who want batch processing and extra features, but most people don&apos;t need it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Pitch - Honest, not pushy */}
      <section className="py-16 px-4 border-t border-[#1e293b]">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl bg-[#0a0a0f] border border-[#1e293b]">
            <div className="flex items-start justify-between gap-8 flex-wrap">
              <div>
                <h3 className="text-xl font-semibold text-white">PDFflow Pro</h3>
                <p className="mt-2 text-[#94a3b8] text-sm max-w-md">
                  Unlimited batch processing, advanced compression, image watermarks,
                  analytics, and no branding. $9/month if you need it.
                </p>
              </div>
              <Link
                href="/pricing"
                className="px-6 py-2.5 text-sm font-medium text-white border border-[#334155] rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
              >
                See Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Confident */}
      <section className="py-20 px-4 border-t border-[#1e293b]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-white">
            Stop uploading your PDFs to random websites.
          </h2>
          <p className="mt-4 text-[#94a3b8]">
            Use PDFflow. It&apos;s better.
          </p>
          <div className="mt-8">
            <Link
              href="#tools"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="signup" />
      <ToolRequestModal isOpen={toolRequestOpen} onClose={() => setToolRequestOpen(false)} />
    </div>
  );
}
