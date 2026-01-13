import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how PDFflow handles your data and protects your privacy.",
};

const sections = [
  {
    title: "1. Introduction",
    content: `Welcome to PDFflow ("we," "our," or "us"). We are committed to protecting your privacy and handling your data responsibly. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.`,
  },
  {
    title: "2. Information We Collect",
    content: null,
    subsections: [
      {
        title: "Files You Process",
        content: "All PDF processing happens directly in your browser. Your files are never uploaded to our servers. We use client-side technology (JavaScript and WebAssembly) to process your documents locally on your device.",
      },
      {
        title: "Account Information",
        content: "If you create an account or subscribe to Pro, we collect your email address and payment information (processed securely through Stripe).",
      },
      {
        title: "Usage Data",
        content: "We collect anonymous usage statistics to improve our services, including pages visited, features used, and general geographic location (country level only).",
      },
    ],
  },
  {
    title: "3. How We Use Your Information",
    content: "We use the information we collect to:",
    list: [
      "Provide and maintain our services",
      "Process your transactions",
      "Send you service-related communications",
      "Improve and optimize our website",
      "Comply with legal obligations",
    ],
  },
  {
    title: "4. Data Security",
    content: "We implement appropriate security measures to protect your information. All data transmissions are encrypted using SSL/TLS. For Pro users, files processed on our servers are encrypted at rest and automatically deleted after processing.",
  },
  {
    title: "5. Cookies",
    content: "We use cookies and similar technologies to:",
    list: [
      "Remember your preferences (like dark mode)",
      "Track usage limits for free tier",
      "Analyze website traffic (via Google Analytics)",
    ],
    footer: "You can control cookies through your browser settings.",
  },
  {
    title: "6. Third-Party Services",
    content: "We use the following third-party services:",
    list: [
      "Stripe: For payment processing",
      "Google Analytics: For usage analytics",
      "Vercel: For hosting",
    ],
    footer: "These services have their own privacy policies governing the use of your information.",
  },
  {
    title: "7. Your Rights",
    content: "Depending on your location, you may have rights to:",
    list: [
      "Access your personal data",
      "Correct inaccurate data",
      "Request deletion of your data",
      "Object to data processing",
      "Data portability",
    ],
    footer: "To exercise these rights, please contact us at privacy@pdfflow.com.",
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.`,
  },
  {
    title: "9. Contact Us",
    content: "If you have questions about this Privacy Policy, please contact us at:",
    footer: "Email: privacy@pdfflow.com",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-500 mb-6 shadow-lg shadow-[var(--accent)]/25">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 text-[var(--muted-foreground)]">
              Last updated: January 2025
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {sections.map((section, index) => (
              <div
                key={section.title}
                className="rounded-3xl border bg-[var(--card)] p-6 sm:p-8 hover:shadow-glass transition-all"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>

                {section.content && (
                  <p className="text-[var(--muted-foreground)] leading-relaxed">
                    {section.content}
                  </p>
                )}

                {section.subsections && (
                  <div className="space-y-4 mt-4">
                    {section.subsections.map((sub) => (
                      <div key={sub.title}>
                        <h3 className="font-medium text-[var(--foreground)]">{sub.title}</h3>
                        <p className="mt-1 text-[var(--muted-foreground)] leading-relaxed">
                          {sub.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {section.list && (
                  <ul className="mt-4 space-y-2">
                    {section.list.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[var(--muted-foreground)]">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.footer && (
                  <p className="mt-4 text-[var(--muted-foreground)]">
                    {section.footer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
