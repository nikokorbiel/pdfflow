"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar, Clock, User, FileText, Layers, Pen, FileDown, Lock, ArrowRight, Share2, Check } from "lucide-react";
import { getBlogPost, getRecentPosts } from "@/lib/blog-data";
import { useState } from "react";

const categoryColors: Record<string, string> = {
  Guides: "from-blue-500 to-cyan-500",
  Security: "from-emerald-500 to-teal-500",
  Conversion: "from-violet-500 to-purple-500",
};

const blogIllustrations: Record<string, { icon: typeof FileText; gradient: string }> = {
  "how-to-compress-pdf-without-losing-quality": {
    icon: FileDown,
    gradient: "from-orange-500 via-red-500 to-pink-500",
  },
  "merge-pdf-files-complete-guide": {
    icon: Layers,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
  },
  "pdf-security-best-practices": {
    icon: Lock,
    gradient: "from-emerald-500 via-green-500 to-lime-500",
  },
  "convert-pdf-to-word-tips": {
    icon: FileText,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
  },
  "digital-signatures-explained": {
    icon: Pen,
    gradient: "from-amber-500 via-orange-500 to-red-500",
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getBlogPost(slug);
  const recentPosts = getRecentPosts(3).filter(p => p.slug !== slug);
  const [copied, setCopied] = useState(false);

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post not found</h1>
          <Link href="/blog" className="text-[#0ea5e9] hover:underline">
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const Icon = blogIllustrations[slug]?.icon || FileText;
  const gradient = blogIllustrations[slug]?.gradient || "from-blue-500 to-cyan-500";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative pt-20 pb-0 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#0ea5e9]/5 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to blog
            </Link>
          </motion.div>

          {/* Category & Meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${categoryColors[post.category] || "from-blue-500 to-cyan-500"} text-white text-xs font-medium`}>
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-sm text-[#64748b]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6"
          >
            {post.title}
          </motion.h1>

          {/* Excerpt */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-lg text-[#94a3b8] mb-8"
          >
            {post.excerpt}
          </motion.p>

          {/* Author & Share */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between py-6 border-t border-b border-[#1e293b] mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{post.author}</p>
                <p className="text-xs text-[#64748b]">Author</p>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0f] border border-[#1e293b] text-sm text-[#94a3b8] hover:border-[#334155] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share
                </>
              )}
            </button>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`relative h-64 sm:h-80 rounded-2xl bg-gradient-to-br ${gradient} overflow-hidden mb-12`}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-32 h-32 text-white/60" strokeWidth={1} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-3xl prose-h1:mt-12 prose-h1:mb-6
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-[#1e293b] prose-h2:pb-3
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-[#94a3b8] prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-[#0ea5e9] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-semibold
              prose-ul:text-[#94a3b8] prose-ul:my-4
              prose-ol:text-[#94a3b8] prose-ol:my-4
              prose-li:my-1 prose-li:marker:text-[#64748b]
              prose-code:text-[#0ea5e9] prose-code:bg-[#0ea5e9]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
              prose-blockquote:border-l-[#0ea5e9] prose-blockquote:bg-[#0a0a0f] prose-blockquote:rounded-r-lg prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic
              prose-table:border-collapse
              prose-th:bg-[#0a0a0f] prose-th:border prose-th:border-[#1e293b] prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:text-white
              prose-td:border prose-td:border-[#1e293b] prose-td:px-4 prose-td:py-2 prose-td:text-[#94a3b8]
            "
          >
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </motion.article>
        </div>
      </section>

      {/* Related Posts */}
      {recentPosts.length > 0 && (
        <section className="py-16 border-t border-[#1e293b] bg-[#050508]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h2 className="text-2xl font-bold text-white">More Articles</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {recentPosts.slice(0, 2).map((relatedPost, index) => {
                const RelatedIcon = blogIllustrations[relatedPost.slug]?.icon || FileText;
                return (
                  <motion.div
                    key={relatedPost.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="block group"
                    >
                      <article className="flex gap-4 p-4 rounded-xl bg-[#0a0a0f] border border-[#1e293b] hover:border-[#334155] transition-all">
                        <div className={`flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br ${blogIllustrations[relatedPost.slug]?.gradient || "from-blue-500 to-cyan-500"} flex items-center justify-center`}>
                          <RelatedIcon className="w-8 h-8 text-white/70" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white mb-1 group-hover:text-[#0ea5e9] transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-[#64748b] line-clamp-1">{relatedPost.excerpt}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-[#64748b]">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(relatedPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 text-center"
            >
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[#0ea5e9] hover:gap-3 transition-all"
              >
                View all articles <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 border-t border-[#1e293b]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-[#0ea5e9]/10 to-[#06b6d4]/10 border border-[#0ea5e9]/20"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to try PDFflow?
            </h2>
            <p className="text-[#94a3b8] mb-6 max-w-lg mx-auto">
              Start editing your PDFs in seconds. No account required, no file uploads - everything stays in your browser.
            </p>
            <Link
              href="/merge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition-colors"
            >
              Try it free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
