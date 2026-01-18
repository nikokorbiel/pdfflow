import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Infinity, Check, X, Sparkles, Lock, Globe, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare PDFflow - Best Free PDF Tool Alternatives | PDFflow",
  description:
    "Compare PDFflow with Adobe Acrobat, Smallpdf, iLovePDF, and PDF24. See why PDFflow is the best free alternative for PDF editing.",
  keywords: [
    "pdf tool comparison",
    "adobe acrobat alternative",
    "smallpdf alternative",
    "ilovepdf alternative",
    "pdf24 alternative",
    "free pdf editor",
    "best pdf tools",
  ],
  openGraph: {
    title: "Compare PDFflow - Best Free PDF Tool Alternatives",
    description: "Compare PDFflow with popular PDF tools and see why it's the best free alternative.",
    type: "website",
  },
};

const comparisons = [
  {
    name: "Adobe Acrobat",
    slug: "adobe-acrobat",
    description: "The industry standard, but expensive and requires installation.",
    color: "from-red-500 to-red-600",
    highlight: "Save £200+/year",
    theirPrice: "£18/mo",
  },
  {
    name: "Smallpdf",
    slug: "smallpdf",
    description: "Popular online tool, but uploads your files to their servers.",
    color: "from-red-400 to-red-500",
    highlight: "100% Private",
    theirPrice: "£10/mo",
  },
  {
    name: "iLovePDF",
    slug: "ilovepdf",
    description: "Feature-rich but limited free tier and server-side processing.",
    color: "from-rose-500 to-rose-600",
    highlight: "No Upload Needed",
    theirPrice: "£5.50/mo",
  },
  {
    name: "PDF24",
    slug: "pdf24",
    description: "Free but ad-supported with a dated interface.",
    color: "from-orange-500 to-orange-600",
    highlight: "Modern & Ad-free",
    theirPrice: "Free (ads)",
  },
];

const pdfflowFeatures = [
  {
    icon: Shield,
    title: "100% Privacy",
    description: "Your files never leave your device. All processing happens locally in your browser - no uploads, no servers, no data collection.",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "No waiting for uploads or downloads. Everything processes instantly on your device, regardless of file size.",
  },
  {
    icon: Infinity,
    title: "100 Professional Tools",
    description: "Merge, split, compress, convert, sign, watermark, protect, and more. All the tools you need in one place.",
  },
  {
    icon: Lock,
    title: "No Account Required",
    description: "Start using PDFflow immediately. No signup, no email, no credit card. Just open and go.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Browser-based means it works on Windows, Mac, Linux, and mobile. No installation needed.",
  },
  {
    icon: Cpu,
    title: "Offline Capable",
    description: "Once loaded, PDFflow works without an internet connection. Your data stays completely offline.",
  },
];

const detailedComparison = [
  { feature: "Browser-based (no install)", pdfflow: true, adobe: false, smallpdf: true, ilovepdf: true, pdf24: true },
  { feature: "Files stay on your device", pdfflow: true, adobe: false, smallpdf: false, ilovepdf: false, pdf24: false },
  { feature: "No account required", pdfflow: true, adobe: false, smallpdf: false, ilovepdf: true, pdf24: true },
  { feature: "Free tools", pdfflow: "36 unlimited", adobe: "7-day trial", smallpdf: "2 tasks/day", ilovepdf: "Limited", pdf24: "Unlimited" },
  { feature: "Ad-free experience", pdfflow: true, adobe: true, smallpdf: "Pro only", ilovepdf: "Pro only", pdf24: false },
  { feature: "Batch processing", pdfflow: "Pro", adobe: true, smallpdf: "Pro", ilovepdf: "Pro", pdf24: true },
  { feature: "Max file size (free)", pdfflow: "10MB", adobe: "N/A", smallpdf: "5MB", ilovepdf: "15MB", pdf24: "Unlimited" },
  { feature: "Max file size (paid)", pdfflow: "100MB", adobe: "Unlimited", smallpdf: "5GB", ilovepdf: "4GB", pdf24: "N/A" },
  { feature: "Works offline", pdfflow: true, adobe: true, smallpdf: false, ilovepdf: false, pdf24: false },
  { feature: "Starting price", pdfflow: "$4.99/mo", adobe: "$18/mo", smallpdf: "$10/mo", ilovepdf: "$5.50/mo", pdf24: "Free" },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--primary)]/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            The Privacy-First PDF Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Why PDFflow?
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            Unlike other PDF tools, PDFflow processes everything locally in your browser.
            Your files never touch our servers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-medium shadow-lg hover:opacity-90 transition-all"
            >
              Try PDFflow Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] hover:bg-[var(--muted)] transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* What PDFflow Offers */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-4">What You Get With PDFflow</h2>
          <p className="text-center text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            A complete PDF toolkit that respects your privacy
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfflowFeatures.map((item) => (
              <div key={item.title} className="p-6 rounded-2xl border bg-[var(--card)] hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 mb-4">
                  <item.icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Highlight */}
      <section className="py-16 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-6">Simple, Honest Pricing</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl border bg-[var(--card)]">
              <p className="text-sm text-[var(--text-secondary)] mb-2">Free Forever</p>
              <p className="text-4xl font-bold mb-2">$0</p>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2 text-left">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 36 tools unlimited</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 4 free uses on 64 premium tools</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Up to 10MB files</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> No account needed</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl border-2 border-[var(--primary)] bg-[var(--card)] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--primary)] text-white text-xs font-medium">
                Best Value
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-2">Pro</p>
              <p className="text-4xl font-bold mb-1">$4.99<span className="text-lg font-normal text-[var(--text-secondary)]">/mo</span></p>
              <p className="text-xs text-[var(--text-secondary)] mb-4">or $24.99 lifetime (save 58%)</p>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2 text-left">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> All 100 tools unlimited</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Up to 100MB files</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Batch processing</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Cards */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-4">Compare With Alternatives</h2>
          <p className="text-center text-[var(--text-secondary)] mb-10">
            See how PDFflow stacks up against popular PDF tools
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {comparisons.map((comparison) => (
              <Link
                key={comparison.slug}
                href={`/compare/${comparison.slug}`}
                className="group p-6 rounded-2xl bg-[var(--card)] border hover:shadow-lg hover:border-[var(--border-hover)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-[var(--primary)] transition-colors">
                      PDFflow vs {comparison.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {comparison.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${comparison.color}`}>
                    {comparison.highlight}
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">
                    They charge: <span className="font-medium text-[var(--foreground)]">{comparison.theirPrice}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-16 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">Feature Comparison</h2>

          <div className="overflow-x-auto rounded-2xl border bg-[var(--card)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-[var(--primary)] bg-[var(--primary)]/5">PDFflow</th>
                  <th className="text-center py-4 px-4 font-semibold">Adobe</th>
                  <th className="text-center py-4 px-4 font-semibold">Smallpdf</th>
                  <th className="text-center py-4 px-4 font-semibold">iLovePDF</th>
                  <th className="text-center py-4 px-4 font-semibold">PDF24</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                {detailedComparison.map((row, index) => (
                  <tr key={row.feature} className={index < detailedComparison.length - 1 ? "border-b border-[var(--border)]" : ""}>
                    <td className="py-3 px-4 font-medium text-[var(--foreground)]">{row.feature}</td>
                    <td className="text-center py-3 px-4 bg-[var(--primary)]/5">
                      {row.pdfflow === true ? <Check className="h-5 w-5 text-green-500 mx-auto" /> :
                       row.pdfflow === false ? <X className="h-5 w-5 text-red-400 mx-auto" /> :
                       <span className="text-[var(--primary)] font-medium">{row.pdfflow}</span>}
                    </td>
                    <td className="text-center py-3 px-4">
                      {row.adobe === true ? <Check className="h-5 w-5 text-green-500 mx-auto" /> :
                       row.adobe === false ? <X className="h-5 w-5 text-red-400 mx-auto" /> :
                       <span>{row.adobe}</span>}
                    </td>
                    <td className="text-center py-3 px-4">
                      {row.smallpdf === true ? <Check className="h-5 w-5 text-green-500 mx-auto" /> :
                       row.smallpdf === false ? <X className="h-5 w-5 text-red-400 mx-auto" /> :
                       <span>{row.smallpdf}</span>}
                    </td>
                    <td className="text-center py-3 px-4">
                      {row.ilovepdf === true ? <Check className="h-5 w-5 text-green-500 mx-auto" /> :
                       row.ilovepdf === false ? <X className="h-5 w-5 text-red-400 mx-auto" /> :
                       <span>{row.ilovepdf}</span>}
                    </td>
                    <td className="text-center py-3 px-4">
                      {row.pdf24 === true ? <Check className="h-5 w-5 text-green-500 mx-auto" /> :
                       row.pdf24 === false ? <X className="h-5 w-5 text-red-400 mx-auto" /> :
                       <span>{row.pdf24}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Try PDFflow?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Join thousands who switched to PDFflow. Start free, no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-medium shadow-lg hover:opacity-90 transition-all"
            >
              Start Using PDFflow Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-[var(--border)] hover:bg-[var(--muted)] font-medium transition-all"
            >
              View All Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
