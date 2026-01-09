import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the right plan for your PDF processing needs. Free tier available.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for occasional use",
    icon: Sparkles,
    gradient: "from-gray-500 to-gray-400",
    features: [
      "2 files per day",
      "Max 10MB per file",
      "All basic tools",
      "Client-side processing",
      "No registration required",
    ],
    cta: "Get Started",
    href: "/",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For power users and professionals",
    icon: Zap,
    gradient: "from-[var(--accent)] to-purple-500",
    features: [
      "Unlimited files",
      "Max 100MB per file",
      "All tools unlocked",
      "Batch processing",
      "Priority support",
      "No watermarks",
      "API access (coming soon)",
    ],
    cta: "Upgrade to Pro",
    href: "#checkout",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    description: "For teams and businesses",
    icon: Building2,
    gradient: "from-emerald-500 to-teal-400",
    features: [
      "Everything in Pro",
      "5 team members",
      "500MB per file",
      "Admin dashboard",
      "Usage analytics",
      "SSO integration",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@pdftools.com",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/10 to-[var(--accent)]/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--muted)] border border-[var(--border)] mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                7-day money-back guarantee
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
              Simple, transparent
              <br />
              <span className="text-gradient">pricing</span>
            </h1>
            <p className="mt-6 text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
              Choose the plan that works best for you. Upgrade or downgrade anytime.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all hover-lift ${
                  plan.highlighted
                    ? "border-[var(--accent)] bg-gradient-to-b from-[var(--accent)]/5 to-purple-500/5 shadow-glow lg:scale-105"
                    : "bg-[var(--card)] hover:shadow-glass"
                } animate-scale-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-[var(--accent)] to-purple-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-[var(--accent)]/25">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${plan.gradient} mb-4`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-semibold">{plan.price}</span>
                  <span className="text-[var(--muted-foreground)] ml-1">{plan.period}</span>
                </div>

                <ul className="mb-8 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 mt-0.5">
                        <Check className="h-3 w-3 text-emerald-500" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.name === "Pro" ? (
                  <StripeCheckoutButton />
                ) : (
                  <Link
                    href={plan.href}
                    className={`flex items-center justify-center rounded-full px-6 py-4 font-medium transition-all press-effect ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white shadow-lg shadow-[var(--accent)]/25 hover:opacity-90"
                        : "border-2 hover:bg-[var(--muted)]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-24 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-center text-3xl font-semibold mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {[
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
                },
                {
                  q: "Is my data secure?",
                  a: "Yes! Free tier processing happens entirely in your browser - your files never leave your device. Pro features use encrypted connections."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards through our secure payment provider, Stripe. We also support Apple Pay and Google Pay."
                },
                {
                  q: "Do you offer refunds?",
                  a: "We offer a 7-day money-back guarantee. If you're not satisfied, contact us within 7 days of purchase for a full refund."
                }
              ].map((faq, index) => (
                <div
                  key={faq.q}
                  className="rounded-3xl border bg-[var(--card)] p-6 hover:shadow-glass transition-all animate-scale-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <h3 className="font-semibold text-lg">{faq.q}</h3>
                  <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-24 text-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <p className="text-[var(--muted-foreground)]">
              Have questions?{" "}
              <a href="mailto:support@pdfflow.com" className="text-[var(--accent)] font-medium hover:opacity-80 transition-opacity">
                Contact us
              </a>
              {" "}and we&apos;ll get back to you within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
