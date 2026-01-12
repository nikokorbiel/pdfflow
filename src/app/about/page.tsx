"use client";

import Link from "next/link";
import {
  Zap,
  Shield,
  Heart,
  Globe,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is yours. We built PDFflow so your files never leave your device. No exceptions.",
  },
  {
    icon: Zap,
    title: "Speed Matters",
    description: "We obsess over milliseconds. Every interaction should feel instant and responsive.",
  },
  {
    icon: Heart,
    title: "User Obsessed",
    description: "We build what users need, not what looks good in pitch decks. Real problems, real solutions.",
  },
  {
    icon: Globe,
    title: "Accessible to All",
    description: "Great tools shouldn&apos;t require expensive subscriptions. Core features are free, forever.",
  },
];

const stats = [
  { value: "20+", label: "PDF Tools" },
  { value: "100%", label: "Local Processing" },
  { value: "0", label: "Files Uploaded" },
  { value: "Free", label: "Core Features" },
];

const milestones = [
  {
    year: "2024",
    title: "PDFflow Launches",
    description: "Started with a simple mission: make PDF tools that respect privacy.",
  },
  {
    year: "2024",
    title: "Core Tools Complete",
    description: "Launched merge, split, compress, and convert functionality.",
  },
  {
    year: "2025",
    title: "Pro Launch",
    description: "Introduced Pro plans with advanced features for power users.",
  },
  {
    year: "2025",
    title: "Enterprise Ready",
    description: "Launched team features and enterprise security compliance.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030304]">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            PDF tools that
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
              respect your privacy
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            We started PDFflow because we were tired of uploading sensitive documents to random websites.
            There had to be a better way.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-white/60 mb-6">
                Every day, millions of people upload confidential documents to online PDF tools.
                Bank statements, contracts, medical records — all sent to servers they don&apos;t control.
              </p>
              <p className="text-lg text-white/60 mb-6">
                We built PDFflow to change that. Using modern browser technology, we process
                everything locally on your device. Your files never leave your computer.
              </p>
              <p className="text-lg text-white/60">
                It&apos;s not just about privacy — it&apos;s about building software the right way.
                Fast, secure, and respectful of your data.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center"
                >
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What we believe
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              These principles guide every decision we make
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-white/50 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our journey
            </h2>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {milestone.year.slice(2)}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-px h-full bg-white/10 mt-4" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="text-sm text-violet-400 font-medium mb-1">{milestone.year}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{milestone.title}</h3>
                  <p className="text-white/50">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built by a small team
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              We&apos;re a lean team obsessed with building the best PDF tools on the planet.
              No bloated organization, no bureaucracy — just shipping great software.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] max-w-md text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">We&apos;re Hiring</h3>
              <p className="text-white/50 mb-6">
                Passionate about privacy and great software? We&apos;d love to hear from you.
              </p>
              <Link
                href="/careers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
              >
                View Open Roles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to try PDFflow?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Start editing PDFs in seconds. No account required.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/merge"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
