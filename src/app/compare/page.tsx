import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Zap, DollarSign } from "lucide-react";

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
    highlight: "Save $275/year",
  },
  {
    name: "Smallpdf",
    slug: "smallpdf",
    description: "Popular online tool, but limited to 2 free tasks per day.",
    color: "from-red-400 to-red-500",
    highlight: "Unlimited tasks",
  },
  {
    name: "iLovePDF",
    slug: "ilovepdf",
    description: "Feature-rich but uploads files to their servers.",
    color: "from-rose-500 to-rose-600",
    highlight: "100% private",
  },
  {
    name: "PDF24",
    slug: "pdf24",
    description: "Free but ad-supported with a dated interface.",
    color: "from-orange-500 to-orange-600",
    highlight: "Modern & ad-free",
  },
];

const whyPDFflow = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "Files are processed locally in your browser. Nothing is uploaded to external servers.",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "No upload or download wait times. Everything happens instantly on your device.",
  },
  {
    icon: DollarSign,
    title: "Generous Free Tier",
    description: "No daily limits, no feature restrictions. Use all basic tools completely free.",
  },
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
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Compare PDFflow
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            See how PDFflow stacks up against popular PDF tools.
            Discover why thousands are making the switch.
          </p>
        </div>
      </section>

      {/* Why PDFflow */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">Why Choose PDFflow?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whyPDFflow.map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 mb-4">
                  <item.icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Cards */}
      <section className="py-16 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">Compare With Popular Tools</h2>

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
                  <ArrowRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                </div>

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${comparison.color}`}>
                  {comparison.highlight}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Comparison Table */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">At a Glance</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-[var(--primary)]">PDFflow</th>
                  <th className="text-center py-4 px-4 font-semibold">Adobe</th>
                  <th className="text-center py-4 px-4 font-semibold">Smallpdf</th>
                  <th className="text-center py-4 px-4 font-semibold">iLovePDF</th>
                  <th className="text-center py-4 px-4 font-semibold">PDF24</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 px-4">Free Tier</td>
                  <td className="text-center py-3 px-4 text-green-500">✓ Unlimited</td>
                  <td className="text-center py-3 px-4">7-day trial</td>
                  <td className="text-center py-3 px-4">2 tasks/day</td>
                  <td className="text-center py-3 px-4">Limited</td>
                  <td className="text-center py-3 px-4">✓ Ad-supported</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 px-4">Local Processing</td>
                  <td className="text-center py-3 px-4 text-green-500">✓</td>
                  <td className="text-center py-3 px-4">Desktop only</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">Desktop only</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 px-4">No Account Required</td>
                  <td className="text-center py-3 px-4 text-green-500">✓</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 px-4">Ad-Free</td>
                  <td className="text-center py-3 px-4 text-green-500">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">Pro only</td>
                  <td className="text-center py-3 px-4">Pro only</td>
                  <td className="text-center py-3 px-4">✗</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 px-4">Starting Price</td>
                  <td className="text-center py-3 px-4 text-[var(--primary)] font-semibold">$9/mo</td>
                  <td className="text-center py-3 px-4">$12.99/mo</td>
                  <td className="text-center py-3 px-4">$12/mo</td>
                  <td className="text-center py-3 px-4">$7/mo</td>
                  <td className="text-center py-3 px-4">Free</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--muted)]/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Try PDFflow?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Join thousands who switched to PDFflow. No credit card, no signup required.
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
