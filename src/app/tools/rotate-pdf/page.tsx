import { Metadata } from "next";
import Link from "next/link";
import { RotateCw, ArrowRight, CheckCircle, Zap, Shield, RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Rotate PDF Online - Turn PDF Pages Free | PDFflow",
  description:
    "Rotate PDF pages in any direction. Turn pages 90°, 180°, or 270°. Free online PDF rotator - fast, secure, and easy to use. No registration required.",
  keywords: [
    "rotate pdf",
    "turn pdf pages",
    "pdf rotator",
    "rotate pdf online",
    "flip pdf pages",
    "pdf page rotation",
    "rotate pdf free",
  ],
  openGraph: {
    title: "Rotate PDF Online - Turn PDF Pages Free",
    description: "Rotate PDF pages in any direction. Free online PDF rotator.",
    type: "website",
  },
};

const features = [
  {
    icon: RotateCcw,
    title: "Any Direction",
    description: "Rotate pages 90° clockwise, counter-clockwise, or flip 180°.",
  },
  {
    icon: Shield,
    title: "Secure Processing",
    description: "All rotation happens in your browser. Your files stay private.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Rotate single pages or entire documents in seconds.",
  },
];

const rotationOptions = [
  { angle: "90° CW", description: "Rotate clockwise by 90 degrees" },
  { angle: "90° CCW", description: "Rotate counter-clockwise by 90 degrees" },
  { angle: "180°", description: "Flip pages upside down" },
];

const faqs = [
  {
    question: "Can I rotate individual pages?",
    answer: "Yes! You can select specific pages to rotate while leaving others unchanged. Perfect for fixing scanned documents with mixed orientations.",
  },
  {
    question: "Will rotation affect the content quality?",
    answer: "No, rotation is lossless. Text, images, and all content remain at their original quality after rotation.",
  },
  {
    question: "Can I preview before saving?",
    answer: "Yes, you can preview rotated pages before downloading. Make adjustments until everything looks right.",
  },
  {
    question: "Is there a page limit?",
    answer: "Free users can rotate PDFs with up to 50 pages. Pro users enjoy unlimited pages.",
  },
];

export default function RotatePDFPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-400 shadow-lg shadow-teal-500/25 mb-8">
            <RotateCw className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Rotate PDF Pages{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Fix page orientation in your PDF documents.
            Rotate single pages or entire documents with one click.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rotate"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 text-white font-medium shadow-lg shadow-teal-500/25 hover:opacity-90 transition-all"
            >
              Rotate PDF Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our PDF Rotator?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-teal-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Rotation Options</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {rotationOptions.map((option) => (
              <div key={option.angle} className="p-6 rounded-2xl bg-[var(--card)] border text-center">
                <h3 className="text-2xl font-bold text-teal-500 mb-2">{option.angle}</h3>
                <p className="text-[var(--text-secondary)]">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Common Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Fix scanned documents with wrong orientation",
              "Correct landscape pages in portrait documents",
              "Rotate photos embedded in PDFs",
              "Fix upside-down pages from scanning",
              "Prepare documents for printing",
              "Correct mixed-orientation pages",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span>{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
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

      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Rotate?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Fix page orientation in seconds.</p>
          <Link
            href="/rotate"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 text-white font-medium shadow-lg shadow-teal-500/25 hover:opacity-90 transition-all"
          >
            Rotate PDF Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
