import { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight, Zap, DollarSign, Shield, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "PDFflow vs iLovePDF - Free Alternative Comparison | PDFflow",
  description:
    "Compare PDFflow with iLovePDF. See why PDFflow is the best free alternative to iLovePDF for PDF editing, merging, splitting, and more.",
  keywords: [
    "pdfflow vs ilovepdf",
    "ilovepdf alternative",
    "free ilovepdf alternative",
    "ilovepdf free alternative",
    "pdf editor comparison",
    "ilovepdf vs",
  ],
  openGraph: {
    title: "PDFflow vs iLovePDF - Free Alternative Comparison",
    description: "Compare PDFflow with iLovePDF. See why PDFflow is the best free alternative.",
    type: "website",
  },
};

const comparisonFeatures = [
  { feature: "Merge PDFs", pdfflow: true, competitor: true },
  { feature: "Split PDFs", pdfflow: true, competitor: true },
  { feature: "Compress PDFs", pdfflow: true, competitor: true },
  { feature: "Convert PDF to Word", pdfflow: true, competitor: true },
  { feature: "Convert PDF to Image", pdfflow: true, competitor: true },
  { feature: "Add Watermarks", pdfflow: true, competitor: true },
  { feature: "E-Signatures", pdfflow: true, competitor: true },
  { feature: "Password Protection", pdfflow: true, competitor: true },
  { feature: "No File Upload Required", pdfflow: true, competitor: false },
  { feature: "Local Processing (Privacy)", pdfflow: true, competitor: false },
  { feature: "Ad-Free Experience", pdfflow: true, competitor: false },
  { feature: "No Signup Required", pdfflow: true, competitor: true },
  { feature: "Desktop App", pdfflow: false, competitor: true },
  { feature: "API Access", pdfflow: false, competitor: true },
];

const pricingComparison = [
  { plan: "Free", pdfflow: "36 tools unlimited", competitor: "Limited features" },
  { plan: "Pro", pdfflow: "$4.99/month or $24.99 lifetime", competitor: "$7/month" },
];

const advantages = [
  {
    icon: Shield,
    title: "Complete Privacy",
    description: "iLovePDF uploads your files to their servers. PDFflow processes everything locally in your browser - your files never leave your device.",
  },
  {
    icon: Zap,
    title: "No Upload/Download Wait",
    description: "Skip the upload and download times. PDFflow processes files instantly without any server round-trips.",
  },
  {
    icon: Globe,
    title: "Clean, Ad-Free Interface",
    description: "No banner ads, no pop-ups, no distractions. PDFflow offers a clean, focused experience.",
  },
  {
    icon: DollarSign,
    title: "Truly Free Core Features",
    description: "Access all essential PDF tools without hitting paywalls or feature restrictions.",
  },
];

export default function ILovePDFComparisonPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-500/20 to-[var(--primary)]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-[var(--primary)]/10 to-rose-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--muted)] text-sm font-medium mb-6">
            <span>Comparison</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            PDFflow vs{" "}
            <span className="text-rose-500">iLovePDF</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Want a privacy-focused iLovePDF alternative? Compare features and
            see why PDFflow keeps your files safe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-medium shadow-lg hover:opacity-90 transition-all"
            >
              Try PDFflow Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#comparison"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-all"
            >
              See Full Comparison
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-[var(--primary)]">0</div>
              <div className="text-sm text-[var(--text-secondary)]">Files Uploaded</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-[var(--primary)]">0</div>
              <div className="text-sm text-[var(--text-secondary)]">Ads Shown</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-[var(--primary)]">100%</div>
              <div className="text-sm text-[var(--text-secondary)]">Local Processing</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-[var(--primary)]">Free</div>
              <div className="text-sm text-[var(--text-secondary)]">Core Features</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose PDFflow */}
      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose PDFflow Over iLovePDF?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {advantages.map((advantage) => (
              <div key={advantage.title} className="p-6 rounded-2xl bg-[var(--card)] border">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 mb-4">
                  <advantage.icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{advantage.title}</h3>
                <p className="text-[var(--text-secondary)]">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section id="comparison" className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>

          <div className="rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-3 bg-[var(--muted)] p-4 font-semibold">
              <div>Feature</div>
              <div className="text-center text-[var(--primary)]">PDFflow</div>
              <div className="text-center text-rose-500">iLovePDF</div>
            </div>

            {comparisonFeatures.map((item, i) => (
              <div
                key={item.feature}
                className={`grid grid-cols-3 p-4 items-center ${
                  i % 2 === 0 ? "bg-[var(--card)]" : "bg-[var(--muted)]/30"
                }`}
              >
                <div className="text-sm sm:text-base">{item.feature}</div>
                <div className="flex justify-center">
                  {item.pdfflow ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-[var(--text-muted)]" />
                  )}
                </div>
                <div className="flex justify-center">
                  {item.competitor ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-[var(--text-muted)]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing Comparison</h2>

          <div className="rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-3 bg-[var(--muted)] p-4 font-semibold">
              <div>Plan</div>
              <div className="text-center text-[var(--primary)]">PDFflow</div>
              <div className="text-center text-rose-500">iLovePDF</div>
            </div>

            {pricingComparison.map((item, i) => (
              <div
                key={item.plan}
                className={`grid grid-cols-3 p-4 items-center ${
                  i % 2 === 0 ? "bg-[var(--card)]" : "bg-[var(--muted)]/30"
                }`}
              >
                <div className="font-medium">{item.plan}</div>
                <div className="text-center text-[var(--primary)] font-semibold">{item.pdfflow}</div>
                <div className="text-center text-[var(--text-secondary)]">{item.competitor}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When to Choose Each */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">When to Choose Each</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl border-2 border-[var(--primary)] bg-[var(--card)]">
              <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Choose PDFflow if you...</h3>
              <ul className="space-y-3">
                {[
                  "Care about document privacy",
                  "Want to avoid file uploads",
                  "Prefer an ad-free experience",
                  "Need fast, instant processing",
                  "Work with confidential files",
                  "Want a modern, clean interface",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl border bg-[var(--card)]">
              <h3 className="text-xl font-bold text-rose-500 mb-4">Choose iLovePDF if you...</h3>
              <ul className="space-y-3">
                {[
                  "Need a desktop application",
                  "Require API integration",
                  "Need OCR functionality",
                  "Want cloud storage integration",
                  "Need batch processing for large volumes",
                  "Require PDF/A conversion",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Keep Your Files Private
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Switch to PDFflow for a privacy-first PDF experience.
            No uploads, no servers, just you and your documents.
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-medium shadow-lg hover:opacity-90 transition-all"
          >
            Start Using PDFflow Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
