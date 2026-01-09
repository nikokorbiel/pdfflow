import { Metadata } from "next";
import Link from "next/link";
import { FileImage, ArrowRight, CheckCircle, Zap, Shield, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Image to PDF Converter - Convert JPG/PNG to PDF Free | PDFflow",
  description:
    "Convert images to PDF documents. Combine multiple JPG, PNG, or other images into a single PDF. Free online converter - fast and secure.",
  keywords: [
    "image to pdf",
    "jpg to pdf",
    "png to pdf",
    "convert image to pdf",
    "photo to pdf",
    "picture to pdf",
    "images to pdf converter",
  ],
  openGraph: {
    title: "Image to PDF Converter - Convert JPG/PNG to PDF Free",
    description: "Convert images to PDF documents. Combine multiple images into a single PDF.",
    type: "website",
  },
};

const features = [
  {
    icon: Layers,
    title: "Multiple Images",
    description: "Combine multiple images into a single PDF document with drag-and-drop ordering.",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "All conversion happens locally in your browser. Your images stay private.",
  },
  {
    icon: Zap,
    title: "Instant Conversion",
    description: "Convert images to PDF in seconds with our optimized processing engine.",
  },
];

const supportedFormats = ["JPG / JPEG", "PNG", "WebP", "GIF", "BMP", "TIFF"];

const faqs = [
  {
    question: "What image formats are supported?",
    answer: "We support all common image formats including JPG, PNG, WebP, GIF, BMP, and TIFF.",
  },
  {
    question: "Can I combine multiple images into one PDF?",
    answer: "Yes! You can add multiple images and arrange them in any order. Each image becomes a page in the final PDF.",
  },
  {
    question: "Will the image quality be preserved?",
    answer: "Yes, we maintain the original image quality. You can also choose compression options if you need smaller file sizes.",
  },
  {
    question: "Is there a limit on the number of images?",
    answer: "Free users can combine up to 10 images per PDF. Pro users enjoy unlimited images.",
  },
];

export default function ImageToPDFPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-400 shadow-lg shadow-indigo-500/25 mb-8">
            <FileImage className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Convert Images to PDF{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Transform your JPG, PNG, and other images into professional PDF documents.
            Combine multiple images into a single file.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/image-to-pdf"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-medium shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all"
            >
              Convert Images to PDF
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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-indigo-500" />
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
          <h2 className="text-3xl font-bold text-center mb-12">Supported Formats</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {supportedFormats.map((format) => (
              <div key={format} className="px-6 py-3 rounded-full bg-[var(--card)] border font-medium">
                {format}
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
              "Create photo albums and portfolios",
              "Combine scanned documents into one file",
              "Convert screenshots for documentation",
              "Create PDF presentations from images",
              "Archive photos in document format",
              "Prepare image collections for printing",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
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
          <p className="text-[var(--text-secondary)] mb-8">Transform your images into PDF in seconds.</p>
          <Link
            href="/image-to-pdf"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-medium shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all"
          >
            Convert Images Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
