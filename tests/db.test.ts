import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCloudflareContext } from "@opennextjs/cloudflare";

vi.mock("@opennextjs/cloudflare", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@opennextjs/cloudflare")>();
  return {
    ...actual,
    getCloudflareContext: vi.fn(),
  };
});

// Import db after vi.mock
import { db, initDb, getDb, SEED_PACKAGES } from "@/lib/db";
import { DEMO_PACKAGE_IDS } from "@/lib/demo";

describe("Database Proxy and Initialization", () => {
  beforeEach(() => {
    vi.mocked(getCloudflareContext).mockReset();
    vi.mocked(getCloudflareContext).mockImplementation(() => {
      throw new Error("Context unavailable");
    });
  });

  it("prevents false thenable evaluation by returning undefined for .then", () => {
    expect((db as any).then).toBeUndefined();
  });

  it("supports the 'has' trap for property existence check", () => {
    expect("select" in db).toBe(true);
    expect("insert" in db).toBe(true);
    expect("nonExistentRandomPropertyXYZ" in db).toBe(false);
  });

  it("handles concurrent initDb calls safely", async () => {
    await Promise.all([initDb(), initDb(), initDb()]);
    expect("select" in db).toBe(true);
  });

  it("lists every seeded package as a demo package", () => {
    expect(SEED_PACKAGES.map((p) => p.id).sort()).toEqual([...DEMO_PACKAGE_IDS].sort());
  });

  it("throws descriptive error when Cloudflare context exists but DB binding is missing", () => {
    vi.mocked(getCloudflareContext).mockReturnValue({
      env: {} as any,
      cf: {} as any,
      ctx: {} as any,
    });

    expect(() => getDb()).toThrow(
      "Cloudflare context detected, but DB binding (ctx.env.DB) is missing. Check wrangler.jsonc d1_databases configuration."
    );
  });
});
