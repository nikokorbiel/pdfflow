import { Metadata } from "next";
import Link from "next/link";
import { Unlock, ArrowRight, CheckCircle, Zap, Shield, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Unlock PDF - Remove Password from PDF Free | PDFflow",
  description:
    "Remove password protection from PDF documents. Unlock PDFs to edit, print, or copy content. Free online PDF unlocker - fast, secure, and easy to use.",
  keywords: [
    "unlock pdf",
    "remove pdf password",
    "pdf unlocker",
    "decrypt pdf",
    "unlock pdf free",
    "remove pdf protection",
    "pdf password remover",
  ],
  openGraph: {
    title: "Unlock PDF - Remove Password from PDF Free",
    description: "Remove password protection from PDF documents. Free online tool.",
    type: "website",
  },
};

const features = [
  {
    icon: KeyRound,
    title: "Remove All Restrictions",
    description: "Remove open passwords and permission restrictions from your PDFs.",
  },
  {
    icon: Shield,
    title: "Secure Processing",
    description: "Decryption happens in your browser. Your password stays private.",
  },
  {
    icon: Zap,
    title: "Instant Unlock",
    description: "Unlock protected PDFs in seconds with our fast processing.",
  },
];

const faqs = [
  {
    question: "Do I need to know the password?",
    answer: "For PDFs with an open password, yes - you must enter the correct password. For PDFs with only permission restrictions, you may be able to unlock without the password.",
  },
  {
    question: "Is it legal to unlock PDFs?",
    answer: "You should only unlock PDFs that you own or have permission to unlock. Removing protection from documents you don't have rights to may violate copyright laws.",
  },
  {
    question: "What types of protection can be removed?",
    answer: "We can remove open passwords (with correct password), permission passwords, and various permission restrictions like printing or copying limitations.",
  },
  {
    question: "Will unlocking affect the document content?",
    answer: "No, the content remains exactly the same. Only the password protection and restrictions are removed.",
  },
];

export default function UnlockPDFPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-sky-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-sky-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-sky-500 shadow-lg shadow-cyan-500/25 mb-8">
            <Unlock className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Unlock PDF Files{" "}
            <span className="text-gradient">Online Free</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Remove password protection from your PDF documents.
            Unlock to edit, print, or copy content freely.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/unlock"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-medium shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all"
            >
              Unlock PDF Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our PDF Unlocker?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-sky-500/10 mb-4">
                  <feature.icon className="h-7 w-7 text-cyan-500" />
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
              { step: "1", title: "Upload PDF", description: "Select your password-protected PDF file" },
              { step: "2", title: "Enter Password", description: "Enter the document password if required" },
              { step: "3", title: "Download", description: "Get your unlocked PDF ready to use" },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-2xl bg-[var(--card)] border text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-sky-500 text-white font-bold text-xl mb-4">
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
              "Unlock old documents with forgotten restrictions",
              "Remove print restrictions from your files",
              "Enable copying text from restricted PDFs",
              "Unlock PDFs for editing and annotation",
              "Remove owner passwords from your documents",
              "Access your own protected files",
            ].map((useCase, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border">
                <CheckCircle className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-bold mb-4">Ready to Unlock?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Remove PDF protection in seconds.</p>
          <Link
            href="/unlock"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-medium shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all"
          >
            Unlock PDF Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
