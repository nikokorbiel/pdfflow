"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Combine,
  Split,
  FileDown,
  Image,
  FileImage,
  RotateCw,
  Zap,
  Shield,
  Gift,
  ArrowRight,
  FileText,
  Droplets,
  Hash,
  ArrowUpDown,
  PenTool,
  Lock,
  Unlock,
  Sparkles,
  Check,
  X,
  Mail,
  Table,
  Presentation,
  Code,
  Crop,
  Trash2,
  ImageIcon,
  EyeOff,
  FileCheck,
  Wrench,
  Layers,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";
import { ParticleBackground } from "@/components/ParticleBackground";
import { useAuth } from "@/contexts/AuthContext";
import { GlowingBorder } from "@/components/GlowingBorder";
import { ToolRequestModal } from "@/components/ToolRequestModal";

const tools = [
  // Core tools
  {
    name: "Merge PDF",
    description: "Combine multiple PDFs into one",
    href: "/merge",
    icon: Combine,
  },
  {
    name: "Split PDF",
    description: "Extract or divide your PDF",
    href: "/split",
    icon: Split,
  },
  {
    name: "Compress PDF",
    description: "Reduce file size, keep quality",
    href: "/compress",
    icon: FileDown,
  },
  // Convert
  {
    name: "PDF to Image",
    description: "Convert pages to PNG/JPG",
    href: "/pdf-to-image",
    icon: Image,
  },
  {
    name: "Image to PDF",
    description: "Create PDF from images",
    href: "/image-to-pdf",
    icon: FileImage,
  },
  {
    name: "PDF to Word",
    description: "Convert to editable DOCX",
    href: "/pdf-to-word",
    icon: FileText,
  },
  {
    name: "PDF to Excel",
    description: "Extract tables to spreadsheet",
    href: "/pdf-to-excel",
    icon: Table,
  },
  {
    name: "PDF to PowerPoint",
    description: "Convert to slide images",
    href: "/pdf-to-powerpoint",
    icon: Presentation,
  },
  {
    name: "Word to PDF",
    description: "Convert DOCX to PDF",
    href: "/word-to-pdf",
    icon: FileText,
  },
  {
    name: "Excel to PDF",
    description: "Convert spreadsheets to PDF",
    href: "/excel-to-pdf",
    icon: Table,
  },
  {
    name: "PowerPoint to PDF",
    description: "Convert presentations to PDF",
    href: "/powerpoint-to-pdf",
    icon: Presentation,
  },
  {
    name: "HTML to PDF",
    description: "Convert web pages to PDF",
    href: "/html-to-pdf",
    icon: Code,
  },
  // Edit
  {
    name: "Rotate PDF",
    description: "Rotate pages any direction",
    href: "/rotate",
    icon: RotateCw,
  },
  {
    name: "Crop PDF",
    description: "Trim and resize pages",
    href: "/crop",
    icon: Crop,
  },
  {
    name: "Delete Pages",
    description: "Remove unwanted pages",
    href: "/delete-pages",
    icon: Trash2,
  },
  {
    name: "Extract Images",
    description: "Pull images from PDF",
    href: "/extract-images",
    icon: ImageIcon,
  },
  {
    name: "Watermark",
    description: "Add text or image watermarks",
    href: "/watermark",
    icon: Droplets,
  },
  {
    name: "Page Numbers",
    description: "Add page numbering",
    href: "/page-numbers",
    icon: Hash,
  },
  {
    name: "Reorder Pages",
    description: "Drag & drop to rearrange",
    href: "/reorder",
    icon: ArrowUpDown,
  },
  {
    name: "Sign PDF",
    description: "Add signatures & initials",
    href: "/sign",
    icon: PenTool,
  },
  // Security
  {
    name: "Protect PDF",
    description: "Password-protect your PDF",
    href: "/protect",
    icon: Lock,
  },
  {
    name: "Unlock PDF",
    description: "Remove PDF password",
    href: "/unlock",
    icon: Unlock,
  },
  {
    name: "Redact PDF",
    description: "Hide sensitive information",
    href: "/redact",
    icon: EyeOff,
  },
  // Advanced
  {
    name: "PDF to PDF/A",
    description: "Convert to archive format",
    href: "/pdf-to-pdfa",
    icon: FileCheck,
  },
  {
    name: "Repair PDF",
    description: "Fix corrupted PDFs",
    href: "/repair",
    icon: Wrench,
  },
  {
    name: "Flatten PDF",
    description: "Flatten forms & layers",
    href: "/flatten",
    icon: Layers,
  },
];

const features = [
  {
    name: "Lightning Fast",
    description: "Instant results with browser-based processing.",
    icon: Zap,
  },
  {
    name: "100% Private",
    description: "Files never leave your device. Fully local.",
    icon: Shield,
  },
  {
    name: "Free to Start",
    description: "Try all tools free. Upgrade for more.",
    icon: Gift,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "Finally, PDF tools that just work. No bloated software, no sketchy uploads.",
  },
  {
    name: "Marcus Johnson",
    role: "Freelance Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content: "I use PDFflow daily. The privacy aspect is huge - my clients' data stays on my machine.",
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "Merged 50+ PDFs for our annual report in seconds. Incredibly intuitive.",
  },
  {
    name: "David Park",
    role: "Startup Founder",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "Switched from Adobe Acrobat. PDFflow is faster and I don't need a subscription for basic tasks.",
  },
  {
    name: "Rachel Thompson",
    role: "Legal Assistant",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    content: "The compression tool saved me hours. Reduced a 50MB contract to under 5MB without losing quality.",
  },
  {
    name: "Alex Rivera",
    role: "Operations Manager",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face",
    content: "Our team processes hundreds of PDFs weekly. PDFflow cut our workflow time in half. Game changer.",
  },
];

const competitors = [
  { name: "PDFflow", highlight: true },
  { name: "Adobe Acrobat", highlight: false },
  { name: "Smallpdf", highlight: false },
  { name: "iLovePDF", highlight: false },
];

const comparisonFeatures = [
  { feature: "100% Browser-based", pdfflow: true, adobe: false, smallpdf: false, ilovepdf: false },
  { feature: "Files Stay Local", pdfflow: true, adobe: false, smallpdf: false, ilovepdf: false },
  { feature: "No Account Required", pdfflow: true, adobe: false, smallpdf: true, ilovepdf: true },
  { feature: "Free Tools", pdfflow: true, adobe: false, smallpdf: true, ilovepdf: true },
  { feature: "No Watermarks (Free)", pdfflow: true, adobe: false, smallpdf: false, ilovepdf: false },
  { feature: "Modern UI", pdfflow: true, adobe: false, smallpdf: true, ilovepdf: false },
  { feature: "No Ads", pdfflow: true, adobe: true, smallpdf: false, ilovepdf: false },
  { feature: "Batch Processing", pdfflow: true, adobe: true, smallpdf: false, ilovepdf: false },
];

// Animated counter
function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}+</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

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
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ParticleBackground />
        </div>

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(14, 165, 233, 0.25) 0%, rgba(6, 182, 212, 0.12) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <motion.div
          className="mx-auto max-w-4xl text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="hero-heading" variants={itemVariants}>
            PDF tools that <span className="text-gradient">flow</span>.
          </motion.h1>

          <motion.p className="mt-6 text-lg sm:text-xl text-[#94a3b8] max-w-xl mx-auto leading-relaxed" variants={itemVariants}>
            Fast, private, browser-based PDF editing.
            <br className="hidden sm:block" />
            No uploads. No hassle.
          </motion.p>

          {/* Privacy trust statement */}
          <motion.div
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0a0f]/80 border border-[#1e293b] text-sm text-[#94a3b8]"
            variants={itemVariants}
          >
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Everything stays in your browser. No uploads. No tracking.</span>
          </motion.div>

          <motion.div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4" variants={itemVariants}>
            <button
              onClick={handleGetStarted}
              className="px-8 py-3.5 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
            >
              {user ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link href="#tools" className="px-6 py-3 text-sm font-medium text-white border border-[#334155] rounded-lg hover:bg-white/5 transition-colors">
              All Tools
            </Link>
          </motion.div>
        </motion.div>

        <GlowingBorder delay={0} />
      </section>

      {/* Social Proof with Avatars */}
      <section className="py-10 border-b border-[#1e293b] bg-[#050508]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="flex -space-x-2">
              {testimonials.map((t, i) => (
                <img key={i} src={t.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-[#050508] bg-[#1e293b]" />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-[#050508] bg-[#1e293b] flex items-center justify-center text-[10px] font-medium text-[#94a3b8]">
                +9k
              </div>
            </div>
          </div>
          <p className="text-sm text-[#94a3b8]">
            Trusted by <span className="text-white font-semibold"><AnimatedCounter target={10000} /></span> users worldwide
          </p>
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-[#fbbf24]">★★★★★</span>
            <span className="text-xs text-[#64748b] ml-1">4.9/5</span>
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <section className="py-16 bg-black border-b border-[#1e293b]">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-[#64748b] text-sm mb-10 uppercase tracking-wider">
            Trusted by teams at leading companies
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-60 grayscale brightness-200">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-7 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" alt="Microsoft" className="h-7 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" alt="Salesforce" className="h-7 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" alt="Amazon" className="h-7 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png" alt="Tesla" className="h-5 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Spotify_logo.svg" alt="Spotify" className="h-7 object-contain" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#050508] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Three simple steps</h2>
            <p className="mt-4 text-[#94a3b8] max-w-2xl mx-auto">No sign up required. Start editing PDFs in seconds.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Select your tool",
                description: "Choose from 20+ PDF tools. Merge, split, compress, convert, and more.",
                icon: Sparkles,
              },
              {
                step: "02",
                title: "Drop your files",
                description: "Drag and drop your PDFs. Everything is processed locally in your browser.",
                icon: Shield,
              },
              {
                step: "03",
                title: "Download result",
                description: "Get your processed PDF instantly. No watermarks, no email required.",
                icon: Zap,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative p-8 rounded-2xl bg-[#0a0a0f] border border-[#1e293b] hover:border-[#334155] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center mb-4 mt-2">
                  <item.icon className="w-6 h-6 text-[#0ea5e9]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-[#94a3b8]">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              href="#tools"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition-colors"
            >
              Browse All Tools <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
        <GlowingBorder delay={1.5} />
      </section>

      {/* Tools Grid */}
      <section id="tools" className="py-20 bg-black relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-widest mb-3">PDF Tools</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Every tool you need</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {tools.map((tool, index) => (
              <motion.div key={tool.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index * 0.03, 0.5) }}>
                <Link href={tool.href} className="flex flex-col h-full p-3 sm:p-4 rounded-xl bg-[#0a0a0f] border border-[#1e293b] hover:border-[#334155] transition-all group">
                  <tool.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#64748b] group-hover:text-[#0ea5e9] transition-colors mb-2 flex-shrink-0" />
                  <h3 className="text-xs sm:text-sm font-medium text-white mb-0.5 leading-tight">{tool.name}</h3>
                  <p className="text-[10px] sm:text-xs text-[#64748b] leading-snug line-clamp-2">{tool.description}</p>
                </Link>
              </motion.div>
            ))}
            {/* CTA Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
              <button
                onClick={() => setToolRequestOpen(true)}
                className="flex flex-col h-full w-full text-left p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#0ea5e9]/10 to-[#06b6d4]/10 border border-[#0ea5e9]/20 hover:border-[#0ea5e9]/40 transition-all group"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0ea5e9] group-hover:text-[#22d3ee] transition-colors mb-2 flex-shrink-0" />
                <h3 className="text-xs sm:text-sm font-medium text-white mb-0.5">Request a Tool</h3>
                <p className="text-[10px] sm:text-xs text-[#64748b] leading-snug">Need something else?</p>
              </button>
            </motion.div>
          </div>
        </div>
        <GlowingBorder delay={2.5} />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#050508] relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.p className="text-xs font-medium text-[#64748b] uppercase tracking-widest mb-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                Why PDFflow
              </motion.p>
              <motion.h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                Built for speed and privacy
              </motion.h2>

              <div className="space-y-5">
                {features.map((feature, index) => (
                  <motion.div key={feature.name} className="flex gap-4" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#0a0a0f] border border-[#1e293b] flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-[#0ea5e9]" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white mb-1">{feature.name}</h3>
                      <p className="text-sm text-[#94a3b8] leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Browser mockup */}
            <motion.div className="relative" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <div className="bg-[#0a0a0f] border border-[#1e293b] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]/60" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-[#1e293b] rounded px-3 py-1 text-xs text-[#64748b] text-center">pdfflow.app</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-xs text-[#64748b] mb-3">Drop your files here</p>
                    <motion.div
                      className="w-full h-24 border-2 border-dashed border-[#1e293b] rounded-lg flex items-center justify-center"
                      animate={{ borderColor: ["#1e293b", "#0ea5e9", "#1e293b"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <FileText className="w-6 h-6 text-[#64748b]" />
                      </motion.div>
                    </motion.div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-[#64748b]">
                      <span>Processing...</span>
                      <span>100%</span>
                    </div>
                    <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] rounded-full"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 2 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <GlowingBorder delay={5} />
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Loved by thousands</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, index) => (
              <motion.div key={t.name} className="p-5 rounded-xl bg-[#0a0a0f] border border-[#1e293b]" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <div className="flex items-center gap-3 mb-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full bg-[#1e293b]" />
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-[#64748b]">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-[#94a3b8] leading-relaxed">&ldquo;{t.content}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
        <GlowingBorder delay={7.5} />
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-[#050508] relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-widest mb-3">Comparison</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Why choose PDFflow?</h2>
            <p className="mt-4 text-[#94a3b8] max-w-2xl mx-auto">See how we stack up against the competition</p>
          </motion.div>

          <motion.div
            className="overflow-x-auto rounded-xl border border-[#1e293b]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left p-4 text-sm font-medium text-[#64748b]">Feature</th>
                  {competitors.map((c) => (
                    <th
                      key={c.name}
                      className={`p-4 text-sm font-medium text-center ${c.highlight ? "text-[#0ea5e9] bg-[#0ea5e9]/5" : "text-white"}`}
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, index) => (
                  <tr key={row.feature} className={index < comparisonFeatures.length - 1 ? "border-b border-[#1e293b]" : ""}>
                    <td className="p-4 text-sm text-[#94a3b8]">{row.feature}</td>
                    <td className="p-4 text-center bg-[#0ea5e9]/5">
                      {row.pdfflow ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-[#475569] mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {row.adobe ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-[#475569] mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {row.smallpdf ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-[#475569] mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {row.ilovepdf ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-[#475569] mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 text-sm text-[#0ea5e9] hover:text-[#22d3ee] transition-colors"
            >
              View detailed comparisons
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
        <GlowingBorder delay={10} />
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black relative">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(14, 165, 233, 0.08) 0%, transparent 70%)", filter: "blur(40px)" }}
          />
          <motion.div className="relative" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-6">Ready to streamline your PDFs?</h2>
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 text-base font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-20 bg-[#050508] border-t border-[#1e293b]">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#06b6d4]/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-[#0ea5e9]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">Stay in the loop</h2>
            <p className="text-[#94a3b8] mb-8">Get notified about new tools, features, and tips. No spam, ever.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
                if (emailInput.value) {
                  const subscribers = JSON.parse(localStorage.getItem("emailSubscribers") || "[]");
                  subscribers.push({ email: emailInput.value, timestamp: new Date().toISOString() });
                  localStorage.setItem("emailSubscribers", JSON.stringify(subscribers));
                  emailInput.value = "";
                  alert("Thanks for subscribing!");
                }
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#1e293b] text-white placeholder:text-[#64748b] focus:border-[#0ea5e9] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>

            <p className="mt-4 text-xs text-[#64748b]">Join 5,000+ subscribers. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="signup" />
      <ToolRequestModal isOpen={toolRequestOpen} onClose={() => setToolRequestOpen(false)} />
    </div>
  );
}
