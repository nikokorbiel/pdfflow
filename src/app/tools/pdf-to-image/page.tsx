import { Metadata } from "next";
import Link from "next/link";
import { Image, ArrowRight, CheckCircle, Zap, Shield, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF to Image Converter - Convert PDF to PNG/JPG Free | PDFflow",
  description:
    "Convert PDF pages to high-quality PNG or JPG images. Free online PDF to image converter - fast, secure, and easy to use. No registration required.",
  keywords: [
    "pdf to image",
    "pdf to png",
    "pdf to jpg",
    "convert pdf to image",
    "pdf converter",
    "pdf to picture",
    "extract images from pdf",
  ],
  openGraph: {
    title: "PDF to Image Converter - Convert PDF to PNG/JPG Free",
    description: "Convert PDF pages to high-quality PNG or JPG images. Free online converter.",
    type: "website",
  },
};

const features = [
  {
    icon: Settings,
    title: "Multiple Formats",
    description: "Export to PNG for transparency or JPG for smaller file sizes.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Conversion happens in your browser. Files never leave your device.",
  },
  {
    icon: Zap,
    title: "High Quality",
    description: "Maintain crisp text and images with adjustable resolution settings.",
  },
];

const outputOptions = [
  { format: "PNG", description: "Best for documents with transparency or sharp text", size: "Larger files" },
  { format: "JPG", description: "Best for photos and smaller file sizes", size: "Smaller files" },
];

const faqs = [
  {
    question: "What image quality can I expect?",
    answer: "Our converter maintains high quality by default. You can adjust DPI settings for even higher resolution output suitable for printing.",
  },
  {
    question: "Can I convert all pages at once?",
    answer: "Yes! You can convert all pages or select specific pages. Each page becomes a separate image file.",
  },
  {
    question: "What's the difference between PNG and JPG?",
    answer: "PNG supports transparency and is better for text-heavy documents. JPG creates smaller files and is better for photos or when file size matters.",
  },
  {
    question: "Is there a page limit?",
    answer: "Free users can convert PDFs with up to 20 pages. Pro users enjoy unlimited pages.",
  },
];

export default function PDFToImagePage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-500/25 mb-8">
            <Image className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Convert PDF to Image{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Transform PDF pages into high-quality PNG or JPG images.
            Perfect for presentations, social media, or archiving.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pdf-to-image"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-white font-medium shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all"
            >
              Convert PDF to Image
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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-orange-500" />
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
          <h2 className="text-3xl font-bold text-center mb-12">Output Formats</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {outputOptions.map((option) => (
              <div key={option.format} className="p-6 rounded-2xl bg-[var(--card)] border">
                <h3 className="text-2xl font-bold text-orange-500 mb-2">{option.format}</h3>
                <p className="text-[var(--text-secondary)] mb-2">{option.description}</p>
                <p className="text-sm text-[var(--text-muted)]">{option.size}</p>
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
              "Create images for presentations and slides",
              "Share PDF content on social media",
              "Extract charts and diagrams from documents",
              "Create thumbnails for document previews",
              "Archive documents as image files",
              "Prepare content for image editing software",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-bold mb-4">Ready to Convert?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Transform your PDFs into images in seconds.</p>
          <Link
            href="/pdf-to-image"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-white font-medium shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all"
          >
            Convert PDF Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
