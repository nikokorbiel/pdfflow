"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Building,
  HelpCircle,
  Zap,
} from "lucide-react";

const contactOptions = [
  {
    icon: MessageSquare,
    title: "General Inquiries",
    description: "Questions about PDFflow or feedback",
    email: "hello@pdfflow.com",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Building,
    title: "Enterprise Sales",
    description: "Custom plans for your organization",
    email: "sales@pdfflow.com",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: HelpCircle,
    title: "Support",
    description: "Technical help and troubleshooting",
    email: "support@pdfflow.com",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "Partnerships",
    description: "Integration and partnership opportunities",
    email: "partners@pdfflow.com",
    color: "from-orange-500 to-amber-500",
  },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#030304]">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in touch
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Have a question, feedback, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactOptions.map((option, index) => (
              <a
                key={index}
                href={`mailto:${option.email}`}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-4`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{option.title}</h3>
                <p className="text-white/50 text-sm mb-3">{option.description}</p>
                <span className="text-sm text-blue-400 group-hover:text-blue-300 transition-colors flex items-center gap-1">
                  {option.email}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Send us a message
              </h2>

              {isSubmitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message sent!</h3>
                  <p className="text-white/60 mb-6">
                    Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormState({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none transition-colors resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white/60" />
                  Response Time
                </h3>
                <p className="text-white/60">
                  We typically respond within <span className="text-white font-medium">24 hours</span> on business days.
                  For urgent matters, email us directly with &quot;URGENT&quot; in the subject line.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-white/60" />
                  Location
                </h3>
                <p className="text-white/60">
                  PDFflow is a remote-first company with team members across the globe.
                  We&apos;re headquartered in <span className="text-white font-medium">San Francisco, CA</span>.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Looking for help?
                </h3>
                <p className="text-white/60 mb-4">
                  Check out our help center for instant answers to common questions.
                </p>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
                >
                  Visit Help Center <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-white/60" />
                  Email Directly
                </h3>
                <div className="space-y-2 text-white/60">
                  <p>General: <a href="mailto:hello@pdfflow.com" className="text-blue-400 hover:text-blue-300">hello@pdfflow.com</a></p>
                  <p>Support: <a href="mailto:support@pdfflow.com" className="text-blue-400 hover:text-blue-300">support@pdfflow.com</a></p>
                  <p>Sales: <a href="mailto:sales@pdfflow.com" className="text-blue-400 hover:text-blue-300">sales@pdfflow.com</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
