"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Infinity } from "lucide-react";
import Link from "next/link";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { getFreeToolsCount, getPremiumToolsCount } from "@/config/tools";

const freeToolsCount = getFreeToolsCount();
const premiumToolsCount = getPremiumToolsCount();

export default function Pricing() {
  const [billingType, setBillingType] = useState<"monthly" | "lifetime">("lifetime");

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[#0ea5e9]/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/10 to-[#0ea5e9]/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e293b] border border-[#334155] mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm text-[#94a3b8]">
                7-day money-back guarantee
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
              Simple, transparent
              <br />
              <span className="bg-gradient-to-r from-[#0ea5e9] to-purple-500 bg-clip-text text-transparent">pricing</span>
            </h1>
            <p className="mt-6 text-xl text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
              {freeToolsCount} tools completely free. Upgrade for {premiumToolsCount} premium tools.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {/* Free Plan */}
            <div className="relative flex flex-col rounded-3xl border border-[#1e293b] bg-[#0a0a0f] p-8 transition-all hover:shadow-lg">
              <div className="mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-400 mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Free</h2>
                <p className="mt-1 text-sm text-[#94a3b8]">
                  Perfect for everyday PDF tasks
                </p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-semibold text-white">$0</span>
                <span className="text-[#94a3b8] ml-1">forever</span>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {[
                  `${freeToolsCount} tools completely free`,
                  "Unlimited usage on free tools",
                  `4 free uses on ${premiumToolsCount} premium tools`,
                  "Max 10MB per file",
                  "Client-side processing",
                  "No registration required",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span className="text-sm text-[#e2e8f0]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/"
                className="flex items-center justify-center rounded-full px-6 py-4 font-medium transition-all border-2 border-[#334155] text-white hover:bg-[#1e293b]"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col rounded-3xl border border-[#0ea5e9] bg-gradient-to-b from-[#0ea5e9]/5 to-purple-500/5 p-8 transition-all shadow-[0_0_40px_rgba(14,165,233,0.15)] lg:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-[#0ea5e9] to-purple-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-[#0ea5e9]/25">
                  Best Value
                </span>
              </div>

              <div className="mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-purple-500 mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Pro</h2>
                <p className="mt-1 text-sm text-[#94a3b8]">
                  Unlimited access to all tools
                </p>
              </div>

              {/* Billing Toggle */}
              <div className="mb-6">
                <div className="relative flex items-center justify-center mb-5">
                  <div className="relative bg-[#1c1c1e] p-[3px] rounded-[10px] w-[220px]">
                    <div
                      className={`absolute top-[3px] bottom-[3px] w-[calc(50%-3px)] rounded-[8px] bg-[#636366] shadow-sm transition-transform duration-200 ease-out ${
                        billingType === "lifetime" ? "translate-x-[calc(100%+3px)]" : "translate-x-0"
                      }`}
                    />
                    <div className="relative grid grid-cols-2">
                      <button
                        onClick={() => setBillingType("monthly")}
                        className={`py-2 text-[13px] font-semibold rounded-[8px] transition-colors duration-200 z-10 text-center ${
                          billingType === "monthly" ? "text-white" : "text-[#8e8e93]"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingType("lifetime")}
                        className={`py-2 text-[13px] font-semibold rounded-[8px] transition-colors duration-200 z-10 text-center ${
                          billingType === "lifetime" ? "text-white" : "text-[#8e8e93]"
                        }`}
                      >
                        Lifetime
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center h-[80px] flex flex-col justify-center">
                  {billingType === "monthly" ? (
                    <>
                      <div>
                        <span className="text-5xl font-semibold text-white">$4.99</span>
                        <span className="text-[#94a3b8] ml-1">/month</span>
                      </div>
                      <p className="text-sm text-[#94a3b8] mt-1">Cancel anytime</p>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-5xl font-semibold text-white">$24.99</span>
                        <span className="text-[#94a3b8] ml-1">one-time</span>
                      </div>
                      <p className="text-sm text-[#94a3b8] flex items-center justify-center gap-2 mt-1">
                        <Infinity className="h-4 w-4" />
                        Forever access
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500 text-white">
                          Save 58%
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {[
                  "All 100 tools unlimited",
                  "Max 100MB per file",
                  "Unlimited batch processing",
                  "Advanced compression options",
                  "Priority processing",
                  "No branding on outputs",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span className="text-sm text-[#e2e8f0]">{feature}</span>
                  </li>
                ))}
              </ul>

              <StripeCheckoutButton isLifetime={billingType === "lifetime"} />
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-24 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-center text-3xl font-semibold mb-12 text-white">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
              {[
                {
                  q: "Which tools are free?",
                  a: `${freeToolsCount} essential tools are completely free with unlimited usage, including Merge, Split, Compress, Rotate, and more basic PDF operations.`
                },
                {
                  q: "What are premium tools?",
                  a: `Premium tools include advanced features like OCR, PDF to Word/Excel, security tools, and image effects. Free users get 4 uses, Pro users get unlimited.`
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, monthly subscriptions can be cancelled anytime. You'll keep access until the end of your billing period. Lifetime is a one-time purchase."
                },
                {
                  q: "Is my data secure?",
                  a: "Yes! All processing happens in your browser - your files never leave your device. We can't see or access your documents."
                },
              ].map((faq, index) => (
                <div
                  key={faq.q}
                  className="rounded-3xl border border-[#1e293b] bg-[#0a0a0f] p-6 hover:shadow-lg transition-all animate-scale-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <h3 className="font-semibold text-lg text-white">{faq.q}</h3>
                  <p className="mt-3 text-[#94a3b8] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-24 text-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <p className="text-[#94a3b8]">
              Have questions?{" "}
              <a href="mailto:hello@pdfflow.space" className="text-[#0ea5e9] font-medium hover:opacity-80 transition-opacity">
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
