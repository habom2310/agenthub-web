"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Package } from "@/lib/db/schema";
import { PackageCard } from "./PackageCard";
import { SearchFilters, FilterState } from "./SearchFilters";
import { Sparkles, PackageSearch, Terminal } from "lucide-react";
import Link from "next/link";

interface CatalogExplorerProps {
  initialPackages: Package[];
}

export function CatalogExplorer({ initialPackages }: CatalogExplorerProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [filters, setFilters] = useState<FilterState>({
    search: initialQuery,
    platform: "all",
    type: "all",
    tag: "",
    sortBy: "stars",
  });

  // Filter packages based on active filters
  const filteredPackages = useMemo(() => {
    let result = [...initialPackages];

    // Search query
    const q = (filters.search || "").toLowerCase().trim();
    if (q) {
      result = result.filter(
        (pkg) =>
          pkg.id.toLowerCase().includes(q) ||
          pkg.name.toLowerCase().includes(q) ||
          pkg.description.toLowerCase().includes(q) ||
          pkg.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Platform filter
    if (filters.platform && filters.platform !== "all") {
      result = result.filter((pkg) =>
        pkg.platforms.map((p) => p.toLowerCase()).includes(filters.platform.toLowerCase())
      );
    }

    // Type filter
    if (filters.type && filters.type !== "all") {
      result = result.filter((pkg) => pkg.type.toLowerCase() === filters.type.toLowerCase());
    }

    // Tag filter
    if (filters.tag) {
      result = result.filter((pkg) =>
        pkg.tags.map((t) => t.toLowerCase()).includes(filters.tag.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      if (filters.sortBy === "installs") {
        return b.installCount - a.installCount;
      } else if (filters.sortBy === "tokens") {
        return a.tokenFootprint - b.tokenFootprint;
      } else if (filters.sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.stars - a.stars;
      }
    });

    return result;
  }, [initialPackages, filters]);

  const clearAllFilters = () => {
    setFilters({
      search: "",
      platform: "all",
      type: "all",
      tag: "",
      sortBy: "stars",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>The Open Registry for AI Coding Agents</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            Discover, share, and reuse vetted AI agent setups.
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
            Explore ready-to-run multi-agent configurations, custom rules AST, domain skills, and MCP connectors for Google Antigravity, Claude Code, Cursor, Windsurf, and Codex.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="text-[var(--muted-foreground)] self-center font-medium">Quick CLI try:</span>
            <div className="inline-flex items-center space-x-2 bg-[var(--background)]/80 border border-[var(--border)] rounded-lg px-3 py-1 font-mono text-xs text-indigo-300">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>npx agenthub profile use alice/nextjs-agent</span>
            </div>
            <Link
              href="/docs"
              className="text-xs text-indigo-400 hover:text-indigo-300 self-center underline underline-offset-4 ml-1"
            >
              Read Docs →
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Controls */}
      <SearchFilters filters={filters} onChange={setFilters} />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <div>
          Showing <span className="font-semibold text-slate-200">{filteredPackages.length}</span> of{" "}
          <span className="font-semibold text-slate-200">{initialPackages.length}</span> verified setups
        </div>
        {(filters.search || filters.platform !== "all" || filters.type !== "all" || filters.tag) && (
          <button
            onClick={clearAllFilters}
            className="text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Reset all filters</span>
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-[var(--muted-foreground)]">
            <PackageSearch className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">No packages matched your filters</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
            Try adjusting your search keywords, clearing selected tags, or switching assistant platforms.
          </p>
          <button
            onClick={clearAllFilters}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
