"use client";

import { categories, getCategoryCount, ToolCategory } from "@/config/tools";

interface ToolCategoriesProps {
  selected: ToolCategory | "all";
  onChange: (category: ToolCategory | "all") => void;
}

export function ToolCategories({ selected, onChange }: ToolCategoriesProps) {
  const allCategories: (ToolCategory | "all")[] = ["all", ...Object.keys(categories) as ToolCategory[]];

  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-2 min-w-max">
        {allCategories.map((cat) => {
          const isSelected = selected === cat;
          const count = getCategoryCount(cat);
          const label = cat === "all" ? "All Tools" : categories[cat].name;

          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${isSelected
                  ? "bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20"
                  : "bg-[#0a0a0f] text-[#94a3b8] border border-[#1e293b] hover:border-[#334155] hover:text-white"
                }
              `}
            >
              <span>{label}</span>
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${isSelected ? "bg-white/20" : "bg-[#1e293b]"}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
