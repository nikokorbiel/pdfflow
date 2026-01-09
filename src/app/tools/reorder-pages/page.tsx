import { Metadata } from "next";
import Link from "next/link";
import { ArrowUpDown, ArrowRight, CheckCircle, Zap, Shield, MousePointer } from "lucide-react";

export const metadata: Metadata = {
  title: "Reorder PDF Pages - Rearrange Pages Free Online | PDFflow",
  description:
    "Rearrange PDF pages with drag and drop. Reorder, move, and organize pages in your PDF documents. Free online tool - fast, secure, and easy to use.",
  keywords: [
    "reorder pdf pages",
    "rearrange pdf",
    "move pdf pages",
    "organize pdf pages",
    "pdf page order",
    "sort pdf pages",
    "reorder pdf free",
  ],
  openGraph: {
    title: "Reorder PDF Pages - Rearrange Pages Free Online",
    description: "Rearrange PDF pages with drag and drop. Free online tool.",
    type: "website",
  },
};

const features = [
  {
    icon: MousePointer,
    title: "Drag & Drop",
    description: "Simply drag pages to rearrange them in any order you want.",
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "All processing happens in your browser. Files never leave your device.",
  },
  {
    icon: Zap,
    title: "Visual Preview",
    description: "See thumbnail previews of all pages while reordering.",
  },
];

const faqs = [
  {
    question: "How do I reorder pages?",
    answer: "Simply drag and drop page thumbnails to rearrange them. The new order is applied instantly when you save.",
  },
  {
    question: "Can I move multiple pages at once?",
    answer: "Yes! Select multiple pages by holding Ctrl/Cmd and clicking, then drag them all together.",
  },
  {
    question: "Will reordering affect the content?",
    answer: "No, page content remains unchanged. Only the page order is modified.",
  },
  {
    question: "Is there a page limit?",
    answer: "Free users can reorder PDFs with up to 50 pages. Pro users enjoy unlimited pages.",
  },
];

export default function ReorderPagesPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/25 mb-8">
            <ArrowUpDown className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Reorder PDF Pages{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Rearrange pages in your PDF documents with simple drag and drop.
            Organize your documents exactly how you want them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reorder"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-lg shadow-pink-500/25 hover:opacity-90 transition-all"
            >
              Reorder Pages Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Tool?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-pink-500" />
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
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Upload PDF", description: "Select and upload your PDF document" },
              { step: "2", title: "Drag & Drop", description: "Rearrange page thumbnails to your desired order" },
              { step: "3", title: "Download", description: "Save your reordered PDF document" },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-2xl bg-[var(--card)] border text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-[var(--text-secondary)]">{item.description}</p>
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
              "Reorganize scanned documents",
              "Fix page order mistakes",
              "Arrange presentation slides",
              "Organize photo collections in PDFs",
              "Reorder report sections",
              "Customize document flow",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-bold mb-4">Ready to Reorder?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Rearrange your PDF pages in seconds.</p>
          <Link
            href="/reorder"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-lg shadow-pink-500/25 hover:opacity-90 transition-all"
          >
            Reorder Pages Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
