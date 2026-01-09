import { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowRight, CheckCircle, Zap, Shield, Type } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF to Word Converter - Convert PDF to DOCX Free | PDFflow",
  description:
    "Convert PDF documents to editable Word files. Free online PDF to DOCX converter - preserves formatting, fast and secure. No registration required.",
  keywords: [
    "pdf to word",
    "pdf to docx",
    "convert pdf to word",
    "pdf converter",
    "pdf to doc",
    "edit pdf as word",
    "pdf to word converter free",
  ],
  openGraph: {
    title: "PDF to Word Converter - Convert PDF to DOCX Free",
    description: "Convert PDF documents to editable Word files. Preserves formatting.",
    type: "website",
  },
};

const features = [
  {
    icon: Type,
    title: "Preserves Formatting",
    description: "Maintains fonts, layouts, tables, and images from your original PDF.",
  },
  {
    icon: Shield,
    title: "Secure Conversion",
    description: "Your documents are processed locally. No data is sent to external servers.",
  },
  {
    icon: Zap,
    title: "Fully Editable",
    description: "Output Word documents are fully editable in Microsoft Word or Google Docs.",
  },
];

const faqs = [
  {
    question: "Will my formatting be preserved?",
    answer: "We do our best to preserve formatting including fonts, tables, and layouts. Complex PDFs may require minor adjustments after conversion.",
  },
  {
    question: "Can I convert scanned PDFs?",
    answer: "Basic scanned PDFs can be converted, but for best results with scanned documents, OCR (text recognition) may be needed.",
  },
  {
    question: "What Word format is supported?",
    answer: "We convert to DOCX format, which is compatible with Microsoft Word 2007 and later, as well as Google Docs and LibreOffice.",
  },
  {
    question: "Is there a file size limit?",
    answer: "Free users can convert PDFs up to 10MB. Pro users enjoy up to 100MB per file.",
  },
];

export default function PDFToWordPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg shadow-blue-500/25 mb-8">
            <FileText className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Convert PDF to Word{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Transform your PDF documents into editable Word files.
            Edit, update, and share your content with ease.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pdf-to-word"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-medium shadow-lg shadow-blue-500/25 hover:opacity-90 transition-all"
            >
              Convert to Word
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Converter?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/10 to-blue-400/10 mb-4">
                  <feature.icon className="h-7 w-7 text-blue-500" />
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
          <h2 className="text-3xl font-bold text-center mb-12">Common Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Edit contracts and legal documents",
              "Update resumes and CVs",
              "Modify reports and proposals",
              "Edit academic papers and essays",
              "Update marketing materials",
              "Revise business documents",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--border)]">
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

      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Convert?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Transform your PDF into an editable Word document.</p>
          <Link
            href="/pdf-to-word"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-medium shadow-lg shadow-blue-500/25 hover:opacity-90 transition-all"
          >
            Convert PDF Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
