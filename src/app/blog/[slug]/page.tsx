"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, User, BookOpen } from "lucide-react";
import { getBlogPost, getRecentPosts, blogPosts } from "@/lib/blog-data";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const recentPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden border-b border-[#1e293b]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[#0ea5e9]/10 to-[#06b6d4]/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
              Back to Blog
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Category */}
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] mb-4">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#64748b]">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
            {/* Main content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                prose-p:text-[#94a3b8] prose-p:leading-relaxed
                prose-a:text-[#0ea5e9] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white
                prose-ul:text-[#94a3b8] prose-ol:text-[#94a3b8]
                prose-li:marker:text-[#0ea5e9]
                prose-blockquote:border-[#0ea5e9] prose-blockquote:text-[#64748b]
                prose-code:text-[#0ea5e9] prose-code:bg-[#1e293b] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-[#0a0a0f] prose-pre:border prose-pre:border-[#1e293b]
                prose-table:text-[#94a3b8]
                prose-th:text-white prose-th:border-[#1e293b]
                prose-td:border-[#1e293b]"
            >
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </motion.article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {/* Related posts */}
                <div className="rounded-2xl bg-[#0a0a0f] border border-[#1e293b] p-6">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                    More Articles
                  </h3>
                  <div className="space-y-4">
                    {recentPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        href={`/blog/${relatedPost.slug}`}
                        className="block group"
                      >
                        <h4 className="text-sm font-medium text-[#94a3b8] group-hover:text-white transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-xs text-[#475569] mt-1">
                          {relatedPost.readTime}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="rounded-2xl bg-gradient-to-br from-[#0ea5e9]/10 to-[#06b6d4]/10 border border-[#0ea5e9]/20 p-6">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    Try PDFflow Free
                  </h3>
                  <p className="text-xs text-[#64748b] mb-4">
                    All the PDF tools you need, right in your browser.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#0ea5e9] hover:text-[#22d3ee] transition-colors"
                  >
                    Get Started
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* More posts */}
      <section className="py-16 border-t border-[#1e293b]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8">
            Continue Reading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                href={`/blog/${relatedPost.slug}`}
                className="group rounded-2xl bg-[#0a0a0f] border border-[#1e293b] hover:border-[#334155] transition-all p-6"
              >
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] mb-3">
                  {relatedPost.category}
                </span>
                <h3 className="text-base font-semibold text-white group-hover:text-[#0ea5e9] transition-colors line-clamp-2 mb-2">
                  {relatedPost.title}
                </h3>
                <p className="text-sm text-[#64748b] line-clamp-2">
                  {relatedPost.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
