import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { GET as getPackages } from "@/app/api/packages/route";
import { GET as getPackageDetail } from "@/app/api/packages/[owner]/[repo]/route";
import { db, initDb } from "@/lib/db";
import { packages } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { insertPackage } from "./helpers";
import { PublicPackage as Package } from "@/lib/db/schema";

describe("AgentHub Web API", () => {
  const fixtureIds = ["alice/nextjs-agent", "rust-lang/cargo-agent", "security/agent-harden"];

  beforeAll(async () => {
    await initDb();
    await insertPackage("alice/nextjs-agent", {
      name: "Fullstack Next.js Agent",
      description: "Next.js App Router setup",
      type: "profile",
      platforms: ["claude", "cursor"],
      tags: ["nextjs"],
      tokenFootprint: 1420,
      createdAt: "2026-01-01T00:00:00.000Z",
      mcpServers: [{ name: "postgres", command: "npx -y server-postgres", args: [], env: [], risk: "low", status: "verified" }],
      rulesAst: [{ title: "rules/common.md > ## 1", file: "rules/common.md", tokens: 195, content: "Think before coding." }],
    });
    await insertPackage("rust-lang/cargo-agent", {
      name: "Rust Toolchain",
      type: "profile",
      platforms: ["gemini"],
      tokenFootprint: 900,
      createdAt: "2026-02-01T00:00:00.000Z",
    });
    await insertPackage("security/agent-harden", {
      name: "Zero-Trust Security",
      description: "Blocks untrusted shell executions",
      type: "addon",
      platforms: ["claude"],
      tokenFootprint: 380,
      createdAt: "2026-03-01T00:00:00.000Z",
    });
  });

  afterAll(async () => {
    await db.delete(packages).where(inArray(packages.id, fixtureIds));
  });

  describe("GET /api/packages", () => {
    it("returns the published packages", async () => {
      const req = new NextRequest("http://localhost:3000/api/packages");
      const res = await getPackages(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty("total");
      expect(data).toHaveProperty("packages");
      expect(Array.isArray(data.packages)).toBe(true);

      const ids = data.packages.map((p: Package) => p.id);
      expect(ids).toContain("alice/nextjs-agent");
    });

    it("matches word prefixes, so ?q=rust does not hit \"trust\"", async () => {
      const data = await (await getPackages(new NextRequest("http://localhost:3000/api/packages?q=rust"))).json();
      const ids = data.packages.map((p: Package) => p.id);
      expect(ids).toContain("rust-lang/cargo-agent");
      expect(ids).not.toContain("security/agent-harden");
    });

    it("filters by keyword search ?q=nextjs", async () => {
      const req = new NextRequest("http://localhost:3000/api/packages?q=nextjs");
      const res = await getPackages(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.packages.length).toBeGreaterThan(0);
      const allMatch = data.packages.every(
        (p: Package) =>
          p.id.toLowerCase().includes("nextjs") ||
          p.name.toLowerCase().includes("nextjs") ||
          p.description.toLowerCase().includes("nextjs") ||
          p.tags.some((t: string) => t.toLowerCase().includes("nextjs"))
      );
      expect(allMatch).toBe(true);
      const ids = data.packages.map((p: Package) => p.id);
      expect(ids).toContain("alice/nextjs-agent");
    });

    it("filters by platform ?platform=claude", async () => {
      const req = new NextRequest("http://localhost:3000/api/packages?platform=claude");
      const res = await getPackages(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.packages.length).toBeGreaterThan(0);
      const allSupportClaude = data.packages.every((p: Package) =>
        p.platforms.map((plat) => plat.toLowerCase()).includes("claude")
      );
      expect(allSupportClaude).toBe(true);
    });

    it("filters by type ?type=profile", async () => {
      const req = new NextRequest("http://localhost:3000/api/packages?type=profile");
      const res = await getPackages(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.packages.length).toBeGreaterThan(0);
      const allProfiles = data.packages.every((p: Package) => p.type === "profile");
      expect(allProfiles).toBe(true);
    });

    it("sorts newest first by default and by smallest footprint with ?sort=tokens", async () => {
      const byDefault = await (await getPackages(new NextRequest("http://localhost:3000/api/packages"))).json();
      const created = byDefault.packages.map((p: Package) => new Date(p.createdAt).getTime());
      expect(created).toEqual([...created].sort((a, b) => b - a));

      const byTokens = await (await getPackages(new NextRequest("http://localhost:3000/api/packages?sort=tokens"))).json();
      const tokens = byTokens.packages.map((p: Package) => p.tokenFootprint);
      expect(tokens).toEqual([...tokens].sort((a, b) => a - b));
    });
  });

  describe("GET /api/packages/[owner]/[repo]", () => {
    it("returns package detail for alice/nextjs-agent including token footprint, rulesAst, mcpServers", async () => {
      const req = new NextRequest("http://localhost:3000/api/packages/alice/nextjs-agent");
      const res = await getPackageDetail(req, {
        params: Promise.resolve({ owner: "alice", repo: "nextjs-agent" }),
      });
      expect(res.status).toBe(200);

      const pkg = await res.json();
      expect(pkg.id).toBe("alice/nextjs-agent");
      expect(pkg.owner).toBe("alice");
      expect(pkg.repo).toBe("nextjs-agent");

      // Verify token footprint
      expect(pkg.tokenFootprint).toBeDefined();
      expect(pkg.tokenFootprint).toBeGreaterThan(0);

      // Verify rulesAst
      expect(Array.isArray(pkg.rulesAst)).toBe(true);
      expect(pkg.rulesAst.length).toBeGreaterThan(0);
      expect(pkg.rulesAst[0]).toHaveProperty("title");
      expect(pkg.rulesAst[0]).toHaveProperty("file");
      expect(pkg.rulesAst[0]).toHaveProperty("tokens");
      expect(pkg.rulesAst[0]).toHaveProperty("content");

      // Verify mcpServers
      expect(Array.isArray(pkg.mcpServers)).toBe(true);
      expect(pkg.mcpServers.length).toBeGreaterThan(0);
      expect(pkg.mcpServers[0]).toHaveProperty("name");
      expect(pkg.mcpServers[0]).toHaveProperty("command");

      // Demo packages have no publisher, and internals are not exposed
      expect(pkg.publisher).toBeNull();
      expect(pkg).not.toHaveProperty("publisherId");
      expect(pkg).not.toHaveProperty("githubRepoId");
    });

    it("returns 404 for non-existent package", async () => {
      const req = new NextRequest("http://localhost:3000/api/packages/nonexistent/missing-agent");
      const res = await getPackageDetail(req, {
        params: Promise.resolve({ owner: "nonexistent", repo: "missing-agent" }),
      });
      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Package 'nonexistent/missing-agent' not found");
    });
  });
});
