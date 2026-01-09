import { Metadata } from "next";
import Link from "next/link";
import { PenTool, ArrowRight, CheckCircle, Zap, Shield, Edit } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign PDF Online - Add Signatures Free | PDFflow",
  description:
    "Add signatures and initials to PDF documents. Draw, type, or upload your signature. Free online PDF signing tool - fast, secure, and legally binding.",
  keywords: [
    "sign pdf",
    "pdf signature",
    "add signature to pdf",
    "e-sign pdf",
    "electronic signature pdf",
    "sign pdf free",
    "pdf signer online",
  ],
  openGraph: {
    title: "Sign PDF Online - Add Signatures Free",
    description: "Add signatures and initials to PDF documents. Free online tool.",
    type: "website",
  },
};

const features = [
  {
    icon: Edit,
    title: "Multiple Methods",
    description: "Draw your signature, type it, or upload an image of your signature.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "All signing happens in your browser. Your documents stay confidential.",
  },
  {
    icon: Zap,
    title: "Place Anywhere",
    description: "Position your signature anywhere on the document with precision.",
  },
];

const signatureTypes = [
  { type: "Draw", description: "Draw your signature with mouse or touch", icon: "✏️" },
  { type: "Type", description: "Type your name and choose a signature font", icon: "⌨️" },
  { type: "Upload", description: "Upload an image of your existing signature", icon: "📤" },
];

const faqs = [
  {
    question: "Is this a legally binding signature?",
    answer: "Yes, electronic signatures created with our tool are legally valid in most countries under laws like eIDAS (EU) and ESIGN (US). For highly sensitive documents, you may want additional verification.",
  },
  {
    question: "Can I add multiple signatures?",
    answer: "Yes! You can add multiple signatures and initials to different pages and locations in the same document.",
  },
  {
    question: "Will my signature be saved?",
    answer: "Your signature is only stored in your browser's local storage for convenience. It never leaves your device unless you choose to use it on a document.",
  },
  {
    question: "Can I also add dates and text?",
    answer: "Yes, you can add the current date, custom text fields, and checkboxes alongside your signature.",
  },
];

export default function SignPDFPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 mb-8">
            <PenTool className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Sign PDF Documents{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Add your signature to any PDF document.
            Draw, type, or upload your signature for a professional finish.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg shadow-purple-500/25 hover:opacity-90 transition-all"
            >
              Sign PDF Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our PDF Signer?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-purple-500" />
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
          <h2 className="text-3xl font-bold text-center mb-12">Signature Options</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {signatureTypes.map((item) => (
              <div key={item.type} className="p-6 rounded-2xl bg-[var(--card)] border text-center">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.type}</h3>
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
              "Sign contracts and agreements",
              "Add signatures to legal documents",
              "Sign forms and applications",
              "Initial multi-page documents",
              "Sign invoices and receipts",
              "Authorize business documents",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-bold mb-4">Ready to Sign?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Add your signature to PDFs in seconds.</p>
          <Link
            href="/sign"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg shadow-purple-500/25 hover:opacity-90 transition-all"
          >
            Sign PDF Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
