import Link from "next/link";
import { PDFflowLogo } from "./Logo";

const footerLinks = {
  tools: [
    { name: "Merge PDF", href: "/merge" },
    { name: "Split PDF", href: "/split" },
    { name: "Compress PDF", href: "/compress" },
    { name: "PDF to Image", href: "/pdf-to-image" },
    { name: "Image to PDF", href: "/image-to-pdf" },
    { name: "Sign PDF", href: "/sign" },
    { name: "Extract Text", href: "/extract-text" },
    { name: "Grayscale PDF", href: "/grayscale" },
    { name: "Edit Metadata", href: "/metadata" },
    { name: "Headers & Footers", href: "/headers-footers" },
    { name: "All Tools", href: "/tools" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Enterprise", href: "/enterprise" },
    { name: "Blog", href: "/blog" },
    { name: "Changelog", href: "/changelog" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Security", href: "/security" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--border)] mt-auto">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex">
              <PDFflowLogo size={36} withWordmark />
            </Link>
            <p className="mt-4 max-w-sm text-[#94a3b8] leading-relaxed">
              The most beautiful way to work with PDFs. Fast, private, and secure.
              All processing happens in your browser.
            </p>
            <a
              href="mailto:hello@pdfflow.space"
              className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              hello@pdfflow.space
            </a>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://x.com/PDFflow"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg glass hover:bg-[var(--surface)] transition-colors text-[var(--text-muted)] hover:text-[var(--foreground)]"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Tools
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--text-muted)]">
              &copy; 2026 PDFflow. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
              <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">
                Privacy
              </Link>
              <span className="text-[var(--border)]">•</span>
              <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">
                Terms
              </Link>
              <span className="text-[var(--border)]">•</span>
              <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
