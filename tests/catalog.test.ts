import { describe, it, expect } from "vitest";
import { filterPackages, filtersFromParams, filtersToUrl } from "@/lib/catalog";
import { registryNote } from "@/lib/demo";
import type { Package } from "@/lib/db/schema";

const pkg = (overrides: Partial<Package>): Package => ({
  id: "o/r",
  owner: "o",
  repo: "r",
  name: "",
  version: "1.0.0",
  description: "",
  type: "profile",
  platforms: [],
  tags: [],
  license: "MIT",
  stars: 0,
  installCount: 0,
  tokenFootprint: 0,
  securityRisk: "low",
  isClean: true,
  mcpServers: [],
  skills: [],
  rulesAst: [],
  readme: "",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

const rust = pkg({ id: "rust-lang/cargo-agent", name: "Rust Toolchain", tokenFootprint: 900, createdAt: "2026-01-01T00:00:00Z" });
const harden = pkg({
  id: "security/agent-harden",
  name: "Zero-Trust Security",
  description: "Blocks untrusted shell executions",
  type: "addon",
  platforms: ["claude"],
  tags: ["security"],
  tokenFootprint: 300,
  createdAt: "2026-02-01T00:00:00Z",
});
const all = [rust, harden];
const defaults = filtersFromParams(new URLSearchParams());

describe("filterPackages", () => {
  it("matches word prefixes, not substrings", () => {
    expect(filterPackages(all, { ...defaults, search: "rust" })).toEqual([rust]);
    expect(filterPackages(all, { ...defaults, search: "untrust" })).toEqual([harden]);
    expect(filterPackages(all, { ...defaults, search: "secur" })).toEqual([harden]);
  });

  it("requires every search term to match", () => {
    expect(filterPackages(all, { ...defaults, search: "zero trust" })).toEqual([harden]);
    expect(filterPackages(all, { ...defaults, search: "zero cargo" })).toEqual([]);
  });

  it("filters by platform and type", () => {
    expect(filterPackages(all, { ...defaults, platform: "claude" })).toEqual([harden]);
    expect(filterPackages(all, { ...defaults, type: "profile" })).toEqual([rust]);
  });

  it("sorts newest first by default and by footprint on request", () => {
    expect(filterPackages(all, defaults)).toEqual([harden, rust]);
    expect(filterPackages([rust, harden], { ...defaults, sortBy: "tokens" })).toEqual([harden, rust]);
  });
});

describe("filter URL round trip", () => {
  it("omits defaults and restores every field", () => {
    expect(filtersToUrl(defaults)).toBe("/");
    const filters = { search: "next js", platform: "cursor", type: "addon", sortBy: "tokens" };
    const url = filtersToUrl(filters);
    expect(filtersFromParams(new URLSearchParams(url.slice(2)))).toEqual(filters);
  });
});

describe("filtersFromParams", () => {
  it("falls back to defaults for unknown values", () => {
    expect(filtersFromParams(new URLSearchParams("platform=Claude&type=foo&sort=stars"))).toEqual(defaults);
  });

  it("keeps known values", () => {
    const f = filtersFromParams(new URLSearchParams("platform=cursor&type=addon&sort=tokens"));
    expect(f).toMatchObject({ platform: "cursor", type: "addon", sortBy: "tokens" });
  });
});

describe("search edge cases", () => {
  it("treats an empty or punctuation-only query as no search", () => {
    expect(filterPackages(all, { ...defaults, search: "  " })).toHaveLength(2);
    expect(filterPackages(all, { ...defaults, search: "!!" })).toHaveLength(2);
  });
});

describe("registryNote", () => {
  it("says nothing is published when only demo packages exist", () => {
    expect(registryNote(["alice/nextjs-agent"])).toMatch(/Nothing has been published/);
  });

  it("flags demo data once real packages exist", () => {
    expect(registryNote(["alice/nextjs-agent", "bob/real"])).toBe("Packages marked Example are demo data.");
  });

  it("shows no note without demo packages", () => {
    expect(registryNote(["bob/real"])).toBeNull();
    expect(registryNote([])).toBeNull();
  });
});
