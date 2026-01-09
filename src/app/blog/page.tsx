"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { blogPosts } from "@/lib/blog-data";

export default function BlogPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const categories = Array.from(new Set(blogPosts.map((post) => post.category)));

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[#0ea5e9]/20 to-[#06b6d4]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-[#06b6d4]/10 to-[#0ea5e9]/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              PDFflow Blog
            </h1>
            <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto">
              Tips, guides, and insights for working with PDF documents more effectively.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-[#1e293b]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-sm text-[#64748b]">Categories:</span>
            {categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1 text-sm rounded-full bg-[#1e293b] text-[#94a3b8]"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="h-full rounded-2xl bg-[#0a0a0f] border border-[#1e293b] hover:border-[#334155] transition-all overflow-hidden">
                    {/* Image placeholder */}
                    <div className="h-48 bg-gradient-to-br from-[#0ea5e9]/20 to-[#06b6d4]/20 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-[#0ea5e9]/50" />
                    </div>

                    <div className="p-6">
                      {/* Category */}
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] mb-3">
                        {post.category}
                      </span>

                      {/* Title */}
                      <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-[#0ea5e9] transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-[#64748b] mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-[#475569]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>

                      {/* Read more */}
                      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#0ea5e9] group-hover:gap-3 transition-all">
                        Read article
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 border-t border-[#1e293b]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-[#94a3b8] mb-6">
            Get the latest PDF tips and product updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#1e293b] text-white placeholder:text-[#475569] focus:border-[#0ea5e9] focus:outline-none transition-colors"
            />
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white font-medium hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
