"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, FileText, Layers, Shield, Pen, FileDown, Lock } from "lucide-react";
import { blogPosts } from "@/lib/blog-data";

const categoryIcons: Record<string, typeof FileText> = {
  Guides: FileText,
  Security: Shield,
  Conversion: Layers,
};

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

export default function BlogPage() {
  const featuredPost = blogPosts[0];
  const recentPosts = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#0ea5e9]/5 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#06b6d4]/5 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-widest mb-3">Blog</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              PDF Tips & Guides
            </h1>
            <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
              Learn how to get the most out of your PDF tools with our comprehensive guides and tutorials.
            </p>
          </motion.div>

          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="block group"
              >
                <div className="grid lg:grid-cols-2 gap-8 p-6 rounded-2xl bg-[#0a0a0f] border border-[#1e293b] hover:border-[#334155] transition-all">
                  {/* Illustration */}
                  <div className={`relative h-64 lg:h-auto min-h-[240px] rounded-xl bg-gradient-to-br ${blogIllustrations[featuredPost.slug]?.gradient || "from-blue-500 to-cyan-500"} overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {(() => {
                        const Icon = blogIllustrations[featuredPost.slug]?.icon || FileText;
                        return <Icon className="w-24 h-24 text-white/80" strokeWidth={1.5} />;
                      })()}
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                        Featured
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${categoryColors[featuredPost.category] || "from-blue-500 to-cyan-500"} text-white text-xs font-medium`}>
                        {featuredPost.category}
                      </span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 group-hover:text-[#0ea5e9] transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-[#94a3b8] mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#64748b]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-2 text-[#0ea5e9] font-medium group-hover:gap-3 transition-all">
                        Read article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Recent Posts Grid */}
      <section className="py-16 border-t border-[#1e293b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-between mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white">Recent Articles</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post, index) => {
              const Icon = blogIllustrations[post.slug]?.icon || FileText;
              return (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block group h-full"
                  >
                    <article className="h-full flex flex-col rounded-xl bg-[#0a0a0f] border border-[#1e293b] hover:border-[#334155] transition-all overflow-hidden">
                      {/* Illustration */}
                      <div className={`relative h-40 bg-gradient-to-br ${blogIllustrations[post.slug]?.gradient || "from-blue-500 to-cyan-500"}`}>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-16 h-16 text-white/70" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2.5 py-0.5 rounded-full bg-gradient-to-r ${categoryColors[post.category] || "from-blue-500 to-cyan-500"} text-white text-xs font-medium`}>
                            {post.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#0ea5e9] transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-[#94a3b8] mb-4 line-clamp-2 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[#64748b]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 border-t border-[#1e293b] bg-[#050508]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">Browse by Category</h2>
            <p className="text-[#94a3b8]">Find articles that match your interests</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {Object.entries(categoryColors).map(([category, gradient], index) => {
              const Icon = categoryIcons[category] || FileText;
              const count = blogPosts.filter(p => p.category === category).length;
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="p-6 rounded-xl bg-[#0a0a0f] border border-[#1e293b] hover:border-[#334155] transition-all text-center cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{category}</h3>
                    <p className="text-sm text-[#64748b]">{count} {count === 1 ? 'article' : 'articles'}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 border-t border-[#1e293b]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">Get PDF tips in your inbox</h2>
            <p className="text-[#94a3b8] mb-6">
              Subscribe to our newsletter for the latest guides, tips, and product updates.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
                if (emailInput.value) {
                  const subscribers = JSON.parse(localStorage.getItem("emailSubscribers") || "[]");
                  subscribers.push({ email: emailInput.value, timestamp: new Date().toISOString() });
                  localStorage.setItem("emailSubscribers", JSON.stringify(subscribers));
                  emailInput.value = "";
                  alert("Thanks for subscribing!");
                }
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#1e293b] text-white placeholder:text-[#64748b] focus:border-[#0ea5e9] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
