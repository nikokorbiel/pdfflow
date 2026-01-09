import { Metadata } from "next";
import Link from "next/link";
import { Droplets, ArrowRight, CheckCircle, Zap, Shield, Type } from "lucide-react";

export const metadata: Metadata = {
  title: "Add Watermark to PDF - Text & Image Watermarks Free | PDFflow",
  description:
    "Add text or image watermarks to PDF documents. Customize position, opacity, and size. Free online PDF watermark tool - fast and secure.",
  keywords: [
    "watermark pdf",
    "add watermark to pdf",
    "pdf watermark",
    "text watermark pdf",
    "image watermark pdf",
    "pdf stamp",
    "watermark pdf free",
  ],
  openGraph: {
    title: "Add Watermark to PDF - Text & Image Watermarks Free",
    description: "Add text or image watermarks to PDF documents. Free online tool.",
    type: "website",
  },
};

const features = [
  {
    icon: Type,
    title: "Text & Image",
    description: "Add custom text watermarks or upload your logo as an image watermark.",
  },
  {
    icon: Shield,
    title: "Protect Your Work",
    description: "Mark documents as confidential, draft, or with your brand identity.",
  },
  {
    icon: Zap,
    title: "Full Customization",
    description: "Adjust position, rotation, opacity, size, and color of your watermarks.",
  },
];

const watermarkTypes = [
  { type: "Text Watermark", description: "Add custom text like 'CONFIDENTIAL' or 'DRAFT'", icon: "Aa" },
  { type: "Image Watermark", description: "Add your logo or any image as a watermark", icon: "📷" },
  { type: "Diagonal Stamp", description: "Classic diagonal watermark across pages", icon: "↗" },
];

const faqs = [
  {
    question: "Can I customize the watermark appearance?",
    answer: "Yes! You can adjust font, size, color, opacity, rotation, and position. For image watermarks, you can resize and position them anywhere on the page.",
  },
  {
    question: "Will the watermark appear on all pages?",
    answer: "By default, watermarks are applied to all pages. You can also choose to apply them only to specific pages.",
  },
  {
    question: "Can I add multiple watermarks?",
    answer: "Yes, you can add multiple watermarks to the same document, each with different settings.",
  },
  {
    question: "Is there a page limit?",
    answer: "Free users can watermark PDFs with up to 30 pages. Pro users enjoy unlimited pages.",
  },
];

export default function WatermarkPDFPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25 mb-8">
            <Droplets className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Add Watermark to PDF{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Protect and brand your PDF documents with custom watermarks.
            Add text or image watermarks with full customization.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/watermark"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:opacity-90 transition-all"
            >
              Add Watermark Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Watermark Tool?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 mb-4">
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
          <h2 className="text-3xl font-bold text-center mb-12">Watermark Types</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {watermarkTypes.map((item) => (
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
              "Mark documents as CONFIDENTIAL or DRAFT",
              "Add company logo to official documents",
              "Protect intellectual property with branding",
              "Add copyright notices to documents",
              "Watermark preview copies before final delivery",
              "Brand marketing materials and reports",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-bold mb-4">Ready to Add Watermarks?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Protect and brand your documents in seconds.</p>
          <Link
            href="/watermark"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:opacity-90 transition-all"
          >
            Add Watermark Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
