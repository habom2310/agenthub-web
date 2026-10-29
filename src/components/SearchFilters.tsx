"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASSISTANT_LABELS, type FilterState } from "@/lib/catalog";

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState, replace?: boolean) => void;
}

const PLATFORMS = [
  { id: "all", label: "All assistants" },
  ...Object.entries(ASSISTANT_LABELS).map(([id, label]) => ({ id, label })),
];

const TYPES = [
  { id: "all", label: "All" },
  { id: "profile", label: "Profiles" },
  { id: "addon", label: "Add-ons" },
];

const SORTS = [
  { id: "recent", label: "Recently added" },
  { id: "tokens", label: "Smallest context" },
];

const selectClass =
  "h-10 md:h-9 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]";

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  // Below md the controls collapse behind a toggle so results stay near the top
  const [open, setOpen] = useState(false);
  // Local text keeps typing responsive; the URL catches up via replaceState
  const [text, setText] = useState(filters.search);
  useEffect(() => setText(filters.search), [filters.search]);
  const activeCount = [filters.platform !== "all", filters.type !== "all", filters.sortBy !== "recent"].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="search"
          aria-label="Search packages by name, description or tag"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            // Replace the history entry instead of adding one per keystroke
            onChange({ ...filters, search: e.target.value }, true);
          }}
          placeholder="Search by name, description or tag"
          className="w-full h-10 bg-[var(--card)] border border-[var(--border)] rounded-lg pl-9 pr-3 text-base md:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
        />
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="catalog-filters"
        className="md:hidden w-full h-11 flex items-center justify-between px-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)]"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--muted-foreground)]" />
          Filters and sort
        </span>
        {activeCount > 0 && <span className="text-xs text-signal-soft">{activeCount} active</span>}
      </button>

      <div
        id="catalog-filters"
        className={cn("flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)] md:flex", open ? "flex" : "hidden")}
      >
        <label className="flex items-center gap-2">
          <span>Assistant</span>
          <select
            value={filters.platform}
            onChange={(e) => onChange({ ...filters, platform: e.target.value })}
            className={selectClass}
          >
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <div role="group" aria-label="Package type" className="flex items-center gap-0.5 bg-[var(--card)] border border-[var(--border)] rounded-lg p-0.5">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={filters.type === t.id}
              onClick={() => onChange({ ...filters, type: t.id })}
              className={cn(
                "h-9 md:h-8 px-3 rounded-md transition-colors",
                filters.type === t.id
                  ? "bg-[var(--secondary)] text-[var(--foreground)] font-medium"
                  : "hover:text-[var(--foreground)]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 md:ml-auto">
          <span>Sort</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
            className={selectClass}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
