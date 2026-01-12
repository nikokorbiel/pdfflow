"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Building,
  Users,
  Lock,
  HeadphonesIcon,
  FileCheck,
  Globe,
  ArrowRight,
  CheckCircle,
  Server,
  Key,
  BarChart3,
} from "lucide-react";

const enterpriseFeatures = [
  {
    icon: Shield,
    title: "Advanced Security",
    description: "SOC 2 Type II compliant infrastructure with end-to-end encryption and audit logs.",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Centralized admin dashboard, role-based access control, and user provisioning.",
  },
  {
    icon: Lock,
    title: "SSO Integration",
    description: "SAML 2.0 and OAuth support for Okta, Azure AD, Google Workspace, and more.",
  },
  {
    icon: Server,
    title: "On-Premise Option",
    description: "Deploy PDFflow in your own infrastructure for complete data sovereignty.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description: "24/7 priority support with a dedicated customer success manager.",
  },
  {
    icon: Key,
    title: "API Access",
    description: "Full REST API access for custom integrations and workflow automation.",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description: "Detailed insights into team usage, popular tools, and processing volumes.",
  },
  {
    icon: FileCheck,
    title: "Compliance Ready",
    description: "HIPAA BAA available. GDPR, CCPA, and SOX compliant by design.",
  },
];

const logos = ["Google", "Microsoft", "Salesforce", "Adobe", "Stripe", "Shopify"];

const plans = [
  {
    name: "Team",
    price: "29",
    description: "For growing teams",
    features: [
      "Up to 25 team members",
      "Shared workspace",
      "Team analytics",
      "Priority support",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited team members",
      "SSO integration",
      "Dedicated support",
      "On-premise option",
      "Custom contracts",
      "SLA guarantee",
    ],
    highlighted: true,
  },
];

const faqs = [
  {
    question: "What security certifications do you have?",
    answer: "We are SOC 2 Type II compliant and undergo regular third-party security audits. We also offer HIPAA BAAs for healthcare organizations.",
  },
  {
    question: "Can we deploy PDFflow on our own servers?",
    answer: "Yes, our Enterprise plan includes an on-premise deployment option. Contact our sales team for details.",
  },
  {
    question: "Do you offer volume discounts?",
    answer: "Absolutely. We offer significant discounts for large teams. Contact us for a custom quote.",
  },
  {
    question: "How does SSO integration work?",
    answer: "We support SAML 2.0 and OAuth 2.0, compatible with Okta, Azure AD, Google Workspace, OneLogin, and other identity providers.",
  },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#030304]">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <Building className="w-4 h-4" />
            Enterprise
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            PDF tools built for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              enterprise scale
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Deploy PDFflow across your organization with enterprise-grade security,
            compliance, and dedicated support.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Contact Sales <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/security"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Security Overview
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <motion.p
            className="text-center text-white/40 text-sm mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            TRUSTED BY TEAMS AT LEADING COMPANIES
          </motion.p>
          <div className="flex items-center justify-center gap-10 md:gap-14 flex-wrap">
            {logos.map((company, index) => (
              <motion.span
                key={index}
                className="text-white/30 text-xl md:text-2xl font-semibold tracking-tight cursor-default select-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  scale: 1.1,
                  color: "rgba(255, 255, 255, 0.8)",
                  transition: { duration: 0.2 }
                }}
              >
                {company}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Enterprise-grade features
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Everything you need to deploy PDFflow across your organization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {enterpriseFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-white/60">
              Choose the plan that works for your team
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/30"
                    : "bg-white/[0.02] border-white/[0.06]"
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-white/50 mb-4">{plan.description}</p>
                <div className="mb-6">
                  {plan.price === "Custom" ? (
                    <span className="text-4xl font-bold text-white">Custom</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-white/50">/user/month</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3 text-white/70">
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  Contact Sales <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Highlights */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Security you can trust
              </h2>
              <p className="text-lg text-white/60 mb-8">
                PDFflow is built with security at its core. Your files are processed locally
                in the browser, never touching our servers. For enterprise deployments,
                we offer additional security controls and compliance certifications.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <Shield className="w-8 h-8 text-emerald-400 mb-2" />
                  <div className="font-semibold text-white">SOC 2 Type II</div>
                  <div className="text-sm text-white/50">Certified</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <Globe className="w-8 h-8 text-blue-400 mb-2" />
                  <div className="font-semibold text-white">GDPR</div>
                  <div className="text-sm text-white/50">Compliant</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <Lock className="w-8 h-8 text-violet-400 mb-2" />
                  <div className="font-semibold text-white">HIPAA</div>
                  <div className="text-sm text-white/50">BAA Available</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <FileCheck className="w-8 h-8 text-orange-400 mb-2" />
                  <div className="font-semibold text-white">99.9%</div>
                  <div className="text-sm text-white/50">Uptime SLA</div>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-xl font-semibold text-white mb-6">Security Checklist</h3>
              <ul className="space-y-4">
                {[
                  "End-to-end encryption for all data",
                  "Local processing - files never leave your device",
                  "Regular third-party security audits",
                  "Role-based access control (RBAC)",
                  "Detailed audit logs and reporting",
                  "Data residency options available",
                  "Penetration testing by certified firms",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Enterprise FAQ
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-white/50">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Talk to our sales team about your organization&apos;s needs.
              We&apos;ll help you find the right solution.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
              >
                Contact Sales <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
              >
                View All Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
