import { Metadata } from "next";
import Link from "next/link";
import { Hash, ArrowRight, CheckCircle, Zap, Shield, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF - Free Online Tool | PDFflow",
  description:
    "Add page numbers to PDF documents. Customize position, format, and style. Free online PDF page numbering tool - fast, secure, and easy to use.",
  keywords: [
    "add page numbers to pdf",
    "pdf page numbers",
    "number pdf pages",
    "pdf pagination",
    "add page numbers free",
    "pdf page numbering",
    "insert page numbers pdf",
  ],
  openGraph: {
    title: "Add Page Numbers to PDF - Free Online Tool",
    description: "Add page numbers to PDF documents. Customize position and format.",
    type: "website",
  },
};

const features = [
  {
    icon: Settings,
    title: "Flexible Positioning",
    description: "Place numbers at top or bottom, left, center, or right of pages.",
  },
  {
    icon: Shield,
    title: "Browser-Based",
    description: "All processing happens locally. Your documents stay private.",
  },
  {
    icon: Zap,
    title: "Custom Formats",
    description: "Choose from multiple formats like 1, 2, 3 or Page 1 of 10.",
  },
];

const positionOptions = [
  { position: "Bottom Center", description: "Most common placement for documents" },
  { position: "Bottom Right", description: "Popular for reports and books" },
  { position: "Top Right", description: "Great for headers and manuscripts" },
];

const faqs = [
  {
    question: "Can I start numbering from a specific page?",
    answer: "Yes! You can skip initial pages (like cover pages) and start numbering from any page number you choose.",
  },
  {
    question: "What number formats are available?",
    answer: "We support various formats: simple numbers (1, 2, 3), 'Page X', 'Page X of Y', Roman numerals (i, ii, iii), and more.",
  },
  {
    question: "Can I customize the font and size?",
    answer: "Yes, you can adjust font family, size, color, and add optional prefixes or suffixes to your page numbers.",
  },
  {
    question: "Is there a page limit?",
    answer: "Free users can add page numbers to PDFs with up to 50 pages. Pro users enjoy unlimited pages.",
  },
];

export default function PageNumbersPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-slate-500/20 to-gray-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-gray-500/10 to-slate-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-500 to-gray-400 shadow-lg shadow-slate-500/25 mb-8">
            <Hash className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Add Page Numbers{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Add professional page numbers to your PDF documents.
            Customize position, format, and style to match your needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/page-numbers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-slate-500 to-gray-400 text-white font-medium shadow-lg shadow-slate-500/25 hover:opacity-90 transition-all"
            >
              Add Page Numbers
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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-500/10 to-gray-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-slate-500" />
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
          <h2 className="text-3xl font-bold text-center mb-12">Position Options</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {positionOptions.map((option) => (
              <div key={option.position} className="p-6 rounded-2xl bg-[var(--card)] border text-center">
                <h3 className="text-xl font-semibold text-slate-600 mb-2">{option.position}</h3>
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
              "Add pagination to reports and proposals",
              "Number pages in legal documents",
              "Prepare manuscripts for publishing",
              "Add page numbers to printed materials",
              "Number pages in academic papers",
              "Organize multi-page contracts",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-bold mb-4">Ready to Add Page Numbers?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Add professional pagination in seconds.</p>
          <Link
            href="/page-numbers"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-slate-500 to-gray-400 text-white font-medium shadow-lg shadow-slate-500/25 hover:opacity-90 transition-all"
          >
            Add Page Numbers Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
