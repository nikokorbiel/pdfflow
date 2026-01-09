import { Metadata } from "next";
import Link from "next/link";
import { Split, ArrowRight, CheckCircle, Zap, Shield, Scissors } from "lucide-react";

export const metadata: Metadata = {
  title: "Split PDF Online - Extract Pages from PDF Free | PDFflow",
  description:
    "Split PDF files into separate documents or extract specific pages. Free online PDF splitter - fast, secure, and easy to use. No registration required.",
  keywords: [
    "split pdf",
    "extract pdf pages",
    "pdf splitter",
    "separate pdf pages",
    "split pdf online",
    "free pdf splitter",
    "pdf page extractor",
  ],
  openGraph: {
    title: "Split PDF Online - Extract Pages from PDF Free",
    description:
      "Split PDF files into separate documents or extract specific pages. Free online PDF splitter.",
    type: "website",
  },
};

const features = [
  {
    icon: Scissors,
    title: "Precise Extraction",
    description: "Extract specific pages, page ranges, or split into individual pages.",
  },
  {
    icon: Shield,
    title: "Fully Secure",
    description: "All processing happens in your browser. Your files never leave your device.",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "Split PDFs in seconds with our optimized browser-based engine.",
  },
];

const splitOptions = [
  {
    title: "Extract Pages",
    description: "Select specific pages to extract into a new PDF",
    example: "e.g., pages 1, 3, 5-10",
  },
  {
    title: "Split by Range",
    description: "Divide your PDF into multiple documents by page ranges",
    example: "e.g., 1-5, 6-10, 11-15",
  },
  {
    title: "Split Every N Pages",
    description: "Automatically split into chunks of equal size",
    example: "e.g., every 5 pages",
  },
];

const faqs = [
  {
    question: "Can I extract specific pages from a PDF?",
    answer: "Yes! You can select individual pages, page ranges, or any combination. For example, extract pages 1, 3, and 7-10 from a document.",
  },
  {
    question: "Will the original PDF be modified?",
    answer: "No, the original file remains unchanged. We create new PDF files with your selected pages.",
  },
  {
    question: "Can I split a password-protected PDF?",
    answer: "You'll need to unlock the PDF first. Use our Unlock PDF tool if you know the password, then split the document.",
  },
  {
    question: "Is there a page limit?",
    answer: "Free users can split PDFs with up to 50 pages. Pro users enjoy unlimited pages and larger file sizes.",
  },
];

export default function SplitPDFPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25 mb-8">
            <Split className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Split PDF Files{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Extract pages from PDF documents or split into separate files.
            Fast, secure, and completely free to use.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/split"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium shadow-lg shadow-blue-500/25 hover:opacity-90 transition-all"
            >
              Split PDF Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#split-options"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-all"
            >
              View Split Options
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our PDF Splitter?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Split Options */}
      <section id="split-options" className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Flexible Split Options
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-12 max-w-2xl mx-auto">
            Choose how you want to split your PDF document.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {splitOptions.map((option) => (
              <div
                key={option.title}
                className="p-6 rounded-2xl bg-[var(--card)] border hover:border-blue-500/50 transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  {option.description}
                </p>
                <p className="text-sm text-blue-500 font-mono">{option.example}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/split"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium shadow-lg shadow-blue-500/25 hover:opacity-90 transition-all"
            >
              Start Splitting
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
              "Extract specific chapters from e-books",
              "Separate individual pages for signing",
              "Remove unwanted pages from documents",
              "Create handouts from presentation PDFs",
              "Split invoices for individual processing",
              "Extract forms from multi-page documents",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
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
            Ready to Split Your PDF?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Extract pages or split documents in seconds. No registration required.
          </p>
          <Link
            href="/split"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium shadow-lg shadow-blue-500/25 hover:opacity-90 transition-all"
          >
            Split PDF Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
