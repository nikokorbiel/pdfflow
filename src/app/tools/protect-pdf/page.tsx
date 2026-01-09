import { Metadata } from "next";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle, Zap, Shield, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Protect PDF - Add Password to PDF Free Online | PDFflow",
  description:
    "Password-protect your PDF documents. Add encryption and restrict printing, copying, and editing. Free online PDF protection tool - fast and secure.",
  keywords: [
    "protect pdf",
    "password protect pdf",
    "encrypt pdf",
    "pdf password",
    "secure pdf",
    "lock pdf",
    "pdf encryption free",
  ],
  openGraph: {
    title: "Protect PDF - Add Password to PDF Free Online",
    description: "Password-protect your PDF documents. Free online tool.",
    type: "website",
  },
};

const features = [
  {
    icon: Key,
    title: "Strong Encryption",
    description: "128-bit or 256-bit AES encryption keeps your documents secure.",
  },
  {
    icon: Shield,
    title: "Permission Controls",
    description: "Restrict printing, copying, editing, and other actions.",
  },
  {
    icon: Zap,
    title: "Instant Protection",
    description: "Add password protection in seconds with browser-based processing.",
  },
];

const protectionOptions = [
  { option: "Open Password", description: "Require password to open and view the document" },
  { option: "Permission Password", description: "Allow viewing but restrict other actions" },
  { option: "Both", description: "Maximum security with dual password protection" },
];

const faqs = [
  {
    question: "What's the difference between open and permission passwords?",
    answer: "An open password is required to view the document. A permission password allows viewing but restricts actions like printing, copying, or editing.",
  },
  {
    question: "How secure is the encryption?",
    answer: "We use industry-standard AES encryption (128-bit or 256-bit). This is the same encryption used by banks and government agencies.",
  },
  {
    question: "Can I restrict specific actions?",
    answer: "Yes! You can individually restrict printing, copying text, editing, commenting, and form filling.",
  },
  {
    question: "What if I forget the password?",
    answer: "Passwords cannot be recovered. Make sure to store your passwords securely. For your own documents, you can use our Unlock tool if you know the password.",
  },
];

export default function ProtectPDFPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/25 mb-8">
            <Lock className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Protect Your PDF{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Add password protection and encryption to your PDF documents.
            Control who can view, print, or edit your files.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/protect"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium shadow-lg shadow-amber-500/25 hover:opacity-90 transition-all"
            >
              Protect PDF Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Protection Tool?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-amber-500" />
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
          <h2 className="text-3xl font-bold text-center mb-12">Protection Options</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {protectionOptions.map((item) => (
              <div key={item.option} className="p-6 rounded-2xl bg-[var(--card)] border text-center">
                <h3 className="text-xl font-semibold text-amber-500 mb-2">{item.option}</h3>
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
              "Protect confidential business documents",
              "Secure financial reports and statements",
              "Lock legal contracts and agreements",
              "Protect intellectual property",
              "Secure personal documents",
              "Share documents with restricted access",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-bold mb-4">Ready to Protect?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Secure your PDF documents in seconds.</p>
          <Link
            href="/protect"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium shadow-lg shadow-amber-500/25 hover:opacity-90 transition-all"
          >
            Protect PDF Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
