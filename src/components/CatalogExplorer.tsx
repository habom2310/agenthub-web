"use client";

import { useSearchParams } from "next/navigation";
import { PublicPackage } from "@/lib/db/schema";
import { PackageCard } from "./PackageCard";
import { SearchFilters } from "./SearchFilters";
import { FilterState, filterPackages, filtersFromParams, filtersToUrl } from "@/lib/catalog";
import { PackageSearch } from "lucide-react";

interface CatalogExplorerProps {
  initialPackages: PublicPackage[];
}

export function CatalogExplorer({ initialPackages }: CatalogExplorerProps) {
  const searchParams = useSearchParams();
  const filters = filtersFromParams(searchParams);
  const filteredPackages = filterPackages(initialPackages, filters);
  const isRegistryEmpty = initialPackages.length === 0;

  // Filters live in the URL so navbar search, Back and shared links all work.
  // pushState updates useSearchParams without a server round trip.
  const setFilters = (next: FilterState, replace = false) =>
    window.history[replace ? "replaceState" : "pushState"](null, "", filtersToUrl(next));
  const clearAllFilters = () => window.history.pushState(null, "", "/");

  return (
    <div className="space-y-6">
      <div className="space-y-1 border-t border-[var(--border)] pt-8">
        <h2 id="registry" className="scroll-mt-24 text-xl font-bold tracking-tight text-[var(--foreground)]">Registry</h2>
      </div>

      {/* Filter and Controls */}
      <SearchFilters filters={filters} onChange={setFilters} />

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
        <span aria-live="polite">
          Showing <span className="font-semibold text-[var(--foreground)]">{filteredPackages.length}</span> of{" "}
          <span className="font-semibold text-[var(--foreground)]">{initialPackages.length}</span> packages
        </span>
        {(filters.search || filters.platform !== "all" || filters.type !== "all" || filters.sortBy !== "recent") && (
          <button onClick={clearAllFilters} className="text-signal-soft hover:underline underline-offset-4 whitespace-nowrap">
            Reset filters
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
          <div className="w-12 h-12 rounded-full bg-[var(--secondary)] flex items-center justify-center mx-auto text-[var(--muted-foreground)]">
            <PackageSearch className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            {isRegistryEmpty ? "No packages published yet" : "No packages match these filters"}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
            {isRegistryEmpty
              ? "Packages appear here as soon as someone publishes one."
              : "Try a shorter search term or a different assistant."}
          </p>
          {!isRegistryEmpty && (
            <button
              onClick={clearAllFilters}
              className="bg-[var(--background)] hover:bg-[var(--accent)] border border-[var(--border)] text-[var(--foreground)] text-sm px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
