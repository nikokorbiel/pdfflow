"use client";

import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  Server,
  FileCheck,
  CheckCircle,
  Globe,
  HardDrive,
  ShieldCheck,
  ArrowRight,
  Laptop,
} from "lucide-react";

const securityFeatures = [
  {
    icon: Laptop,
    title: "100% Client-Side Processing",
    description: "Your files are processed entirely in your browser using WebAssembly and JavaScript. No data ever touches our servers.",
  },
  {
    icon: HardDrive,
    title: "Files Stay on Your Device",
    description: "Documents remain on your local machine throughout the entire process. We literally cannot see your files.",
  },
  {
    icon: Lock,
    title: "No File Uploads",
    description: "Unlike other PDF tools, we don't upload your files to process them. Everything happens locally.",
  },
  {
    icon: Eye,
    title: "Zero Data Collection",
    description: "We don't collect, store, or analyze the contents of your documents. Your data is your data.",
  },
  {
    icon: Globe,
    title: "HTTPS Everywhere",
    description: "All connections are encrypted with TLS 1.3. Your browsing is secure from end to end.",
  },
  {
    icon: Server,
    title: "No Server Storage",
    description: "We have no servers storing your PDFs. When you close the tab, your files exist only on your device.",
  },
];

const complianceItems = [
  {
    title: "GDPR Friendly",
    description: "Privacy by design - files never leave your device",
    icon: ShieldCheck,
  },
  {
    title: "CCPA Friendly",
    description: "No personal data collection from document contents",
    icon: ShieldCheck,
  },
  {
    title: "100% Local",
    description: "All processing happens in your browser",
    icon: FileCheck,
  },
  {
    title: "Zero Storage",
    description: "We never store or access your documents",
    icon: FileCheck,
  },
];

const faqs = [
  {
    question: "Do you store my files on your servers?",
    answer: "No. PDFflow processes all files directly in your browser. Your files never leave your device and are never uploaded to any server.",
  },
  {
    question: "Can PDFflow employees see my documents?",
    answer: "No. Since files are processed locally in your browser, we have no technical ability to access your documents. We literally cannot see them.",
  },
  {
    question: "What happens to my files after processing?",
    answer: "Nothing - they remain on your device. When you close the browser tab, any temporary data is cleared. We recommend saving your processed files to your preferred location.",
  },
  {
    question: "Is PDFflow safe for confidential documents?",
    answer: "Yes. Our client-side architecture makes PDFflow ideal for sensitive documents like legal contracts, medical records, and financial statements.",
  },
  {
    question: "Do you use third-party services that might access my files?",
    answer: "No. We don't use any third-party services for file processing. Analytics are limited to anonymous usage patterns and never include document contents.",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#030304]">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <Shield className="w-4 h-4" />
            Security First
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your files never leave
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              your device
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            PDFflow processes everything locally in your browser. No uploads, no servers, no risk.
            Your sensitive documents stay exactly where they should — with you.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/merge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Try It Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How local processing works
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our architecture is fundamentally different from other PDF tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mt-4 mb-3">You select files</h3>
              <p className="text-white/50">
                Files are loaded into your browser&apos;s memory. They never leave your computer.
              </p>
            </div>

            <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mt-4 mb-3">Browser processes locally</h3>
              <p className="text-white/50">
                Using PDF.js and pdf-lib, your browser handles all the heavy lifting. Zero server involvement.
              </p>
            </div>

            <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mt-4 mb-3">Download result</h3>
              <p className="text-white/50">
                The processed file is saved directly to your device. Close the tab and all temporary data is gone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Security by design
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              We built PDFflow from the ground up with privacy as the core principle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Compliance & certifications
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Meeting the highest standards for data protection and security
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceItems.map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-white/40 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              PDFflow vs traditional PDF tools
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-white/60 font-medium">Feature</th>
                  <th className="p-4 text-emerald-400 font-semibold">PDFflow</th>
                  <th className="p-4 text-white/40 font-medium">Others</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr className="bg-white/[0.01]">
                  <td className="p-4 text-white/80">Files uploaded to servers</td>
                  <td className="p-4 text-center"><span className="text-emerald-400 font-semibold">Never</span></td>
                  <td className="p-4 text-center"><span className="text-red-400">Always</span></td>
                </tr>
                <tr>
                  <td className="p-4 text-white/80">Data collection</td>
                  <td className="p-4 text-center"><span className="text-emerald-400 font-semibold">None</span></td>
                  <td className="p-4 text-center"><span className="text-red-400">Extensive</span></td>
                </tr>
                <tr className="bg-white/[0.01]">
                  <td className="p-4 text-white/80">Works offline</td>
                  <td className="p-4 text-center"><CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><span className="text-red-400">✕</span></td>
                </tr>
                <tr>
                  <td className="p-4 text-white/80">Third-party access risk</td>
                  <td className="p-4 text-center"><span className="text-emerald-400 font-semibold">Zero</span></td>
                  <td className="p-4 text-center"><span className="text-red-400">High</span></td>
                </tr>
                <tr className="bg-white/[0.01]">
                  <td className="p-4 text-white/80">GDPR compliant by design</td>
                  <td className="p-4 text-center"><CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><span className="text-yellow-400">Varies</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Security FAQ
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
          <div className="p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to process PDFs securely?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Join thousands of users who trust PDFflow with their sensitive documents.
            </p>
            <Link
              href="/merge"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
