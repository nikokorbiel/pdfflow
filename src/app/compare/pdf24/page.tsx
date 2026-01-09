import { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight, Zap, DollarSign, Shield, Smartphone } from "lucide-react";

export const metadata: Metadata = {
  title: "PDFflow vs PDF24 - Free Alternative Comparison | PDFflow",
  description:
    "Compare PDFflow with PDF24. See why PDFflow is the best alternative to PDF24 for PDF editing, merging, splitting, and more.",
  keywords: [
    "pdfflow vs pdf24",
    "pdf24 alternative",
    "free pdf24 alternative",
    "pdf24 free alternative",
    "pdf editor comparison",
    "pdf24 vs",
  ],
  openGraph: {
    title: "PDFflow vs PDF24 - Free Alternative Comparison",
    description: "Compare PDFflow with PDF24. See why PDFflow is the best alternative.",
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
  { feature: "Modern UI/UX", pdfflow: true, competitor: false },
  { feature: "Local Processing (Privacy)", pdfflow: true, competitor: false },
  { feature: "Mobile-Optimized", pdfflow: true, competitor: false },
  { feature: "No Software Install", pdfflow: true, competitor: true },
  { feature: "Desktop Application", pdfflow: false, competitor: true },
  { feature: "PDF Printer Driver", pdfflow: false, competitor: true },
];

const pricingComparison = [
  { plan: "Free", pdfflow: "Full features", competitor: "Full features" },
  { plan: "Pro", pdfflow: "$9/month", competitor: "Free (ad-supported)" },
  { plan: "Desktop App", pdfflow: "N/A", competitor: "Free download" },
];

const advantages = [
  {
    icon: Smartphone,
    title: "Modern, Mobile-First Design",
    description: "PDFflow features a sleek, modern interface optimized for both desktop and mobile. PDF24's interface feels dated by comparison.",
  },
  {
    icon: Shield,
    title: "True Browser Privacy",
    description: "PDFflow processes files entirely in your browser. PDF24's online tools upload files to their servers.",
  },
  {
    icon: Zap,
    title: "Faster Experience",
    description: "No waiting for uploads or downloads. PDFflow processes everything instantly on your device.",
  },
  {
    icon: DollarSign,
    title: "No Ads on Free Tier",
    description: "PDFflow's free tier is completely ad-free. PDF24's desktop app shows advertisements.",
  },
];

export default function PDF24ComparisonPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-[var(--primary)]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-[var(--primary)]/10 to-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--muted)] text-sm font-medium mb-6">
            <span>Comparison</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            PDFflow vs{" "}
            <span className="text-orange-500">PDF24</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Looking for a modern PDF24 alternative? Compare features and
            see why PDFflow offers a better user experience.
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
              <div className="text-3xl font-bold text-[var(--primary)]">Modern</div>
              <div className="text-sm text-[var(--text-secondary)]">User Interface</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-[var(--primary)]">0</div>
              <div className="text-sm text-[var(--text-secondary)]">Ads Shown</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-[var(--primary)]">100%</div>
              <div className="text-sm text-[var(--text-secondary)]">Mobile-Friendly</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-[var(--primary)]">Local</div>
              <div className="text-sm text-[var(--text-secondary)]">Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose PDFflow */}
      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose PDFflow Over PDF24?
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
              <div className="text-center text-orange-500">PDF24</div>
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
              <div className="text-center text-orange-500">PDF24</div>
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

          <p className="text-center text-[var(--text-secondary)] mt-6 text-sm">
            * PDF24 is free but supported by advertisements in their desktop app.
          </p>
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
                  "Prefer a modern, clean interface",
                  "Use mobile devices frequently",
                  "Care about privacy",
                  "Want an ad-free experience",
                  "Need fast, local processing",
                  "Prefer web-based tools",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl border bg-[var(--card)]">
              <h3 className="text-xl font-bold text-orange-500 mb-4">Choose PDF24 if you...</h3>
              <ul className="space-y-3">
                {[
                  "Need a PDF printer driver",
                  "Prefer desktop applications",
                  "Need offline functionality",
                  "Want a fax service",
                  "Need PDF/A archival format",
                  "Don't mind advertisements",
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
            Experience Modern PDF Tools
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Try PDFflow&apos;s modern, privacy-focused approach to PDF editing.
            No downloads, no ads, just powerful tools.
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
