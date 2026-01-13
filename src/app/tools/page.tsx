"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { tools, getToolsByCategory, searchTools, ToolCategory } from "@/config/tools";
import { ToolSearch } from "@/components/ToolSearch";
import { ToolCategories } from "@/components/ToolCategories";

export default function AllToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");

  const filteredTools = searchQuery
    ? searchTools(searchQuery)
    : getToolsByCategory(selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[#0ea5e9]/20 to-[#06b6d4]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-[#06b6d4]/10 to-[#0ea5e9]/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            All PDF Tools
          </h1>
          <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto mb-2">
            Everything you need to work with PDFs. Fast, free, and secure.
          </p>
          <p className="text-[#64748b]">
            {tools.length} tools to handle all your PDF needs
          </p>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="py-8 border-t border-[#1e293b] bg-[#050508]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <ToolSearch
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                if (value) setSelectedCategory("all");
              }}
              placeholder={`Search ${tools.length} tools...`}
            />
            {!searchQuery && (
              <ToolCategories
                selected={selectedCategory}
                onChange={setSelectedCategory}
              />
            )}
          </div>

          {/* Results count when searching */}
          {searchQuery && (
            <p className="text-sm text-[#64748b] mt-4">
              Found {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredTools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group p-4 rounded-xl bg-[#0a0a0f] border border-[#1e293b] hover:border-[#334155] transition-all"
              >
                <tool.icon className="w-5 h-5 text-[#64748b] group-hover:text-[#0ea5e9] transition-colors mb-2" />
                <h2 className="text-sm font-medium text-white mb-1 group-hover:text-[#0ea5e9] transition-colors">
                  {tool.name}
                </h2>
                <p className="text-xs text-[#64748b] line-clamp-2">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>

          {/* No results message */}
          {filteredTools.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-[#64748b]">No tools found matching &ldquo;{searchQuery}&rdquo;</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-[#0ea5e9] hover:text-[#22d3ee] text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#050508] border-t border-[#1e293b]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Need More Power?
          </h2>
          <p className="text-[#94a3b8] mb-8">
            Upgrade to Pro for unlimited processing, larger files, and priority support.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white font-medium shadow-lg hover:opacity-90 transition-all"
          >
            View Pricing
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
