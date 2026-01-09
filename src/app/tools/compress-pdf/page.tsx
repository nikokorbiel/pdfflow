import { Metadata } from "next";
import Link from "next/link";
import { FileDown, ArrowRight, CheckCircle, Zap, Shield, Gauge } from "lucide-react";

export const metadata: Metadata = {
  title: "Compress PDF Online - Reduce PDF File Size Free | PDFflow",
  description:
    "Reduce PDF file size without losing quality. Free online PDF compressor - fast, secure, and easy to use. Compress PDFs instantly in your browser.",
  keywords: [
    "compress pdf",
    "reduce pdf size",
    "pdf compressor",
    "shrink pdf",
    "compress pdf online",
    "free pdf compressor",
    "pdf size reducer",
  ],
  openGraph: {
    title: "Compress PDF Online - Reduce PDF File Size Free",
    description:
      "Reduce PDF file size without losing quality. Free online PDF compressor.",
    type: "website",
  },
};

const features = [
  {
    icon: Gauge,
    title: "Smart Compression",
    description: "Our algorithm finds the perfect balance between file size and quality.",
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "Files are compressed locally in your browser. Your data stays with you.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "See compressed file size immediately. No waiting for server processing.",
  },
];

const compressionLevels = [
  {
    level: "Light",
    reduction: "Up to 40%",
    quality: "Highest quality",
    useCase: "Best for documents with important images",
  },
  {
    level: "Medium",
    reduction: "Up to 60%",
    quality: "Good quality",
    useCase: "Perfect for most documents",
  },
  {
    level: "Maximum",
    reduction: "Up to 80%",
    quality: "Acceptable quality",
    useCase: "Best for email attachments",
  },
];

const faqs = [
  {
    question: "Will compressing reduce the quality of my PDF?",
    answer: "Our smart compression optimizes file size while maintaining readability. You can choose from different compression levels based on your needs.",
  },
  {
    question: "What's the maximum file size I can compress?",
    answer: "Free users can compress PDFs up to 10MB. Pro users enjoy up to 100MB per file with faster processing.",
  },
  {
    question: "How much can I reduce my PDF size?",
    answer: "Depending on your PDF content and chosen compression level, you can reduce file size by 40-80%. PDFs with many images compress more.",
  },
  {
    question: "Is my PDF safe during compression?",
    answer: "Yes! All compression happens directly in your browser. Your files are never uploaded to any server.",
  },
];

export default function CompressPDFPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/25 mb-8">
            <FileDown className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Compress PDF Files{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Reduce PDF file size without losing quality. Perfect for email,
            uploads, and storage. Fast, secure, and completely free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/compress"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all"
            >
              Compress PDF Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#compression-levels"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-all"
            >
              View Compression Options
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our PDF Compressor?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compression Levels */}
      <section id="compression-levels" className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Choose Your Compression Level
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-12 max-w-2xl mx-auto">
            Select the right balance between file size and quality for your needs.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {compressionLevels.map((item) => (
              <div
                key={item.level}
                className="p-6 rounded-2xl bg-[var(--card)] border hover:border-emerald-500/50 transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">{item.level}</h3>
                <div className="text-3xl font-bold text-emerald-500 mb-2">
                  {item.reduction}
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {item.quality}
                </p>
                <p className="text-sm text-[var(--text-muted)]">{item.useCase}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/compress"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all"
            >
              Start Compressing
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Common Use Cases
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Reduce PDF size for email attachments",
              "Optimize documents for web uploads",
              "Save storage space on your device",
              "Speed up document sharing and transfers",
              "Prepare files for online form submissions",
              "Compress scanned documents and images",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-[var(--text-secondary)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Compress Your PDFs?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Start reducing file sizes in seconds. No registration required.
          </p>
          <Link
            href="/compress"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all"
          >
            Compress PDF Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
