import type { Package } from "@/lib/db/schema";

export const ASSISTANT_LABELS: Record<string, string> = {
  claude: "Claude Code",
  cursor: "Cursor",
  codex: "Codex",
  gemini: "Antigravity",
  windsurf: "Windsurf",
};

export const assistantLabel = (id: string) => ASSISTANT_LABELS[id.toLowerCase()] ?? id;

export interface FilterState {
  search: string;
  platform: string;
  type: string;
  sortBy: string;
}

const TYPES = ["profile", "addon"];
const SORTS = ["recent", "tokens"];

// Unknown values fall back to defaults so the controls always show what is applied
const pick = (value: string | null, allowed: string[], fallback: string) =>
  value && allowed.includes(value) ? value : fallback;

export function filtersFromParams(params: URLSearchParams): FilterState {
  return {
    search: params.get("q") || "",
    platform: pick(params.get("platform"), Object.keys(ASSISTANT_LABELS), "all"),
    type: pick(params.get("type"), TYPES, "all"),
    sortBy: pick(params.get("sort"), SORTS, "recent"),
  };
}

export function filtersToUrl(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.platform !== "all") params.set("platform", filters.platform);
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.sortBy !== "recent") params.set("sort", filters.sortBy);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

// Every query term must prefix a word, so "rust" matches "rust-lang" but not "trust"
function matchesSearch(pkg: Package, query: string): boolean {
  const pkgWords = words([pkg.id, pkg.name, pkg.description, ...pkg.tags].join(" "));
  return words(query).every((term) => pkgWords.some((w) => w.startsWith(term)));
}

export function filterPackages(packages: Package[], filters: FilterState): Package[] {
  const platform = filters.platform.toLowerCase();
  const type = filters.type.toLowerCase();

  return packages
    .filter((pkg) => matchesSearch(pkg, filters.search))
    .filter((pkg) => platform === "all" || pkg.platforms.some((p) => p.toLowerCase() === platform))
    .filter((pkg) => type === "all" || pkg.type.toLowerCase() === type)
    .sort((a, b) =>
      filters.sortBy === "tokens"
        ? a.tokenFootprint - b.tokenFootprint
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
