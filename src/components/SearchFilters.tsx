"use client";

import { cn } from "@/lib/utils";

export interface FilterState {
  search: string;
  platform: string;
  type: string;
  tag: string;
  sortBy: string;
}

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export const PLATFORMS = [
  { id: "all", label: "All Assistants", color: "bg-indigo-500" },
  { id: "gemini", label: "Antigravity (Gemini)", color: "bg-blue-500" },
  { id: "claude", label: "Claude Code", color: "bg-orange-500" },
  { id: "cursor", label: "Cursor", color: "bg-emerald-500" },
  { id: "windsurf", label: "Windsurf", color: "bg-cyan-500" },
  { id: "codex", label: "Codex", color: "bg-violet-500" },
];

export const TYPES = [
  { id: "all", label: "All Types" },
  { id: "profile", label: "Full Profiles" },
  { id: "addon", label: "Modular Addons" },
];

export const POPULAR_TAGS = [
  "nextjs",
  "security",
  "python",
  "fastapi",
  "rust",
  "gcp",
  "duckdb",
  "playwright",
];

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const setPlatform = (platform: string) => {
    onChange({ ...filters, platform });
  };

  const setType = (type: string) => {
    onChange({ ...filters, type });
  };

  const toggleTag = (tag: string) => {
    onChange({ ...filters, tag: filters.tag === tag ? "" : tag });
  };

  const setSortBy = (sortBy: string) => {
    onChange({ ...filters, sortBy });
  };

  return (
    <div className="space-y-4">
      {/* Popular Tag Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[var(--muted-foreground)] self-center font-medium">Quick Tags:</span>
        {POPULAR_TAGS.map((tag) => {
          const active = filters.tag === tag;
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-2.5 py-1 rounded-lg border transition-all text-xs font-mono",
                active
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)] hover:border-indigo-500/40"
              )}
            >
              #{tag}
            </button>
          );
        })}
        {filters.tag && (
          <button
            onClick={() => onChange({ ...filters, tag: "" })}
            className="text-xs text-rose-400 hover:underline ml-1"
          >
            Clear tag
          </button>
        )}
      </div>

      {/* Main Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        {/* Assistant Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          {PLATFORMS.map((p) => {
            const active = filters.platform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0",
                  active
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm font-semibold"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] hover:border-slate-600"
                )}
              >
                {p.id !== "all" && <span className={cn("w-2 h-2 rounded-full", p.color)} />}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Type & Sorting Options */}
        <div className="flex items-center space-x-3 text-xs text-[var(--muted-foreground)] flex-shrink-0">
          <div className="flex items-center space-x-1 bg-[var(--card)] border border-[var(--border)] rounded-lg p-0.5">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  filters.type === t.id
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5">
            <span>Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="stars">Most Stars</option>
              <option value="installs">Most Installs</option>
              <option value="tokens">Lowest Tokens</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
