import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions for using PDFflow services.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using PDFflow ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.`,
  },
  {
    title: "2. Description of Service",
    content: "PDFflow provides online tools for PDF manipulation, including but not limited to merging, splitting, compressing, rotating, and converting PDF files. We offer both free and paid tiers of service.",
  },
  {
    title: "3. User Responsibilities",
    content: "You agree to:",
    list: [
      "Use the Service only for lawful purposes",
      "Not upload files containing malware or malicious content",
      "Not attempt to circumvent usage limits or security measures",
      "Not use the Service to process illegal or infringing content",
      "Maintain the security of your account credentials",
    ],
  },
  {
    title: "4. Intellectual Property",
    content: "You retain all rights to the files you upload and process through our Service. We do not claim ownership of your content. However, you grant us a limited license to process your files as necessary to provide the Service.",
    footer: "The PDFflow name, logo, and all related trademarks are our property. You may not use these without our written permission.",
  },
  {
    title: "5. Free Tier Limitations",
    content: "The free tier is subject to the following limitations:",
    list: [
      "2 file operations per day",
      "Maximum file size of 10MB",
      "Processing happens client-side (in your browser)",
    ],
    footer: "We reserve the right to modify these limitations at any time.",
  },
  {
    title: "6. Paid Subscriptions",
    content: null,
    subsections: [
      {
        title: "Billing",
        content: "Paid subscriptions are billed monthly or annually, depending on your chosen plan. Payment is processed through Stripe.",
      },
      {
        title: "Cancellation",
        content: "You may cancel your subscription at any time. Your access will continue until the end of your current billing period.",
      },
      {
        title: "Refunds",
        content: "We offer a 7-day money-back guarantee for new subscribers. Refund requests after this period are handled on a case-by-case basis.",
      },
    ],
  },
  {
    title: "7. Service Availability",
    content: "We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may perform maintenance or updates that temporarily affect availability.",
  },
  {
    title: "8. Disclaimer of Warranties",
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE OR UNINTERRUPTED.`,
    isLegal: true,
  },
  {
    title: "9. Limitation of Liability",
    content: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.",
    isLegal: true,
  },
  {
    title: "10. Indemnification",
    content: "You agree to indemnify and hold harmless PDFflow and its affiliates from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.",
  },
  {
    title: "11. Changes to Terms",
    content: "We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.",
  },
  {
    title: "12. Governing Law",
    content: "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which PDFflow operates, without regard to conflict of law principles.",
  },
  {
    title: "13. Contact",
    content: "For questions about these Terms, please contact us at:",
    footer: "Email: legal@pdfflow.com",
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-6 shadow-lg shadow-emerald-500/25">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Terms of Service
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
                  <p className={`leading-relaxed ${section.isLegal ? "text-sm text-[var(--muted-foreground)] font-mono" : "text-[var(--muted-foreground)]"}`}>
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
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
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
