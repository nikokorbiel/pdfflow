import { Metadata } from "next";
import Link from "next/link";
import { Combine, ArrowRight, CheckCircle, Zap, Shield, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Merge PDF Files Online - Free PDF Combiner | PDFflow",
  description:
    "Combine multiple PDF files into one document for free. Fast, secure, and easy to use. No registration required. Merge PDFs in seconds with our online tool.",
  keywords: [
    "merge pdf",
    "combine pdf",
    "pdf merger",
    "join pdf files",
    "merge pdf online",
    "free pdf combiner",
    "pdf joiner",
  ],
  openGraph: {
    title: "Merge PDF Files Online - Free PDF Combiner",
    description:
      "Combine multiple PDF files into one document for free. Fast, secure, and easy to use.",
    type: "website",
  },
};

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Merge PDFs in seconds, not minutes. Our optimized engine handles files instantly.",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "Your files are processed locally in your browser. Nothing is uploaded to our servers.",
  },
  {
    icon: Clock,
    title: "No Registration",
    description: "Start merging immediately. No account required, no email needed.",
  },
];

const steps = [
  { step: 1, title: "Upload Files", description: "Drag and drop or click to select multiple PDF files" },
  { step: 2, title: "Arrange Order", description: "Reorder files by dragging them into your preferred sequence" },
  { step: 3, title: "Merge & Download", description: "Click merge and download your combined PDF instantly" },
];

const faqs = [
  {
    question: "Is this PDF merger really free?",
    answer: "Yes! You can merge up to 2 PDFs per day for free. Upgrade to Pro for unlimited merges and larger file sizes.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. All PDF processing happens directly in your browser. Your files never leave your device, ensuring complete privacy and security.",
  },
  {
    question: "What's the maximum file size?",
    answer: "Free users can merge PDFs up to 10MB each. Pro users enjoy up to 100MB per file.",
  },
  {
    question: "Can I merge password-protected PDFs?",
    answer: "Yes, you can merge protected PDFs if you know the password. Use our Unlock PDF tool first if needed.",
  },
];

export default function MergePDFPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25 mb-8">
            <Combine className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Merge PDF Files{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Combine multiple PDF documents into a single file in seconds.
            No registration, no watermarks, completely free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/merge"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all"
            >
              Merge PDFs Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-all"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our PDF Merger?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-violet-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            How to Merge PDFs in 3 Easy Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-violet-500/20 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-[var(--text-secondary)]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/merge"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all"
            >
              Start Merging PDFs
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Perfect For Every Use Case
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-12 max-w-2xl mx-auto">
            Whether you&apos;re a student, professional, or business owner, our PDF merger adapts to your needs.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Combine multiple reports into a single document",
              "Merge scanned documents and forms",
              "Create portfolios from separate PDF files",
              "Consolidate invoices and receipts",
              "Compile research papers and articles",
              "Join presentation slides from different sources",
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
            Ready to Merge Your PDFs?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Join thousands of users who trust PDFflow for their PDF needs.
          </p>
          <Link
            href="/merge"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all"
          >
            Merge PDFs Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
