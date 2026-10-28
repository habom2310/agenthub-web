import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { GET as getPackages } from "@/app/api/packages/route";
import { GET as getPackageDetail } from "@/app/api/packages/[owner]/[repo]/route";
import { POST as postIndex } from "@/app/api/index/route";
import { db, initDb } from "@/lib/db";
import { packages, Package } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

describe("AgentHub Web API", () => {
  beforeAll(async () => {
    await initDb();
    // Clean up test package in case it exists from previous runs
    await db.delete(packages).where(eq(packages.id, "bob/vue-agent"));
  });

  afterAll(async () => {
    // Clean up test package
    await db.delete(packages).where(eq(packages.id, "bob/vue-agent"));
  });

  describe("GET /api/packages", () => {
    it("returns default seeded packages", async () => {
      const req = new NextRequest("http://localhost:3000/api/packages");
      const res = await getPackages(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty("total");
      expect(data).toHaveProperty("packages");
      expect(Array.isArray(data.packages)).toBe(true);
      expect(data.packages.length).toBeGreaterThanOrEqual(1);

      const ids = data.packages.map((p: Package) => p.id);
      expect(ids).toContain("alice/nextjs-agent");
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

  describe("POST /api/index", () => {
    const payload = {
      owner: "bob",
      repo: "vue-agent",
      name: "Vue 3 & Vite Agent",
      version: "1.0.0",
      description: "Turnkey profile for Vue 3, Vite, and Pinia workflows",
      type: "profile",
      platforms: ["gemini", "claude", "cursor"],
      tags: ["vue", "vite", "pinia"],
      license: "MIT",
      rulesAst: [
        {
          title: "rules/vue.md > ## 1. Vue 3 Composition API Guidelines",
          file: "rules/vue.md",
          tokens: 220,
          content: "Use <script setup lang=\"ts\"> and typed props.",
        },
      ],
      skills: [
        {
          name: "skills/vue-audit",
          description: "Audit Vue component structure",
          path: "skills/vue-audit",
          entryScript: "scripts/audit.ts",
          tools: ["audit_components"],
        },
      ],
      mcpServers: [
        {
          name: "vue-docs",
          command: "npx -y vue-docs-mcp",
          args: [],
          env: [],
          risk: "low" as const,
          status: "verified" as const,
          description: "Vue 3 documentation search",
        },
      ],
      readme: "# Vue 3 Agent\n\nFullstack agent for Vue 3 and Vite.",
    };

    it("submits a new package payload, verifies database upsert and response, and retrieves it via GET", async () => {
      // 1. Submit new package payload
      const postReq = new NextRequest("http://localhost:3000/api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const postRes = await postIndex(postReq);
      expect(postRes.status).toBe(201);

      const postData = await postRes.json();
      expect(postData.message).toBe("Package indexed successfully");
      expect(postData.package).toBeDefined();
      expect(postData.package.id).toBe("bob/vue-agent");
      expect(postData.package.owner).toBe("bob");
      expect(postData.package.repo).toBe("vue-agent");
      expect(postData.package.name).toBe("Vue 3 & Vite Agent");

      // Verify upsert: submit updated version
      const updatedPayload = {
        ...payload,
        description: "Updated turnkey profile for Vue 3, Vite, and Pinia workflows",
        version: "1.1.0",
      };
      const updateReq = new NextRequest("http://localhost:3000/api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });
      const updateRes = await postIndex(updateReq);
      expect(updateRes.status).toBe(201);
      const updateData = await updateRes.json();
      expect(updateData.package.version).toBe("1.1.0");
      expect(updateData.package.description).toBe("Updated turnkey profile for Vue 3, Vite, and Pinia workflows");

      // 2. Subsequent GET /api/packages/bob/vue-agent returns the newly indexed package
      const getReq = new NextRequest("http://localhost:3000/api/packages/bob/vue-agent");
      const getRes = await getPackageDetail(getReq, {
        params: Promise.resolve({ owner: "bob", repo: "vue-agent" }),
      });
      expect(getRes.status).toBe(200);

      const fetchedPkg = await getRes.json();
      expect(fetchedPkg.id).toBe("bob/vue-agent");
      expect(fetchedPkg.owner).toBe("bob");
      expect(fetchedPkg.repo).toBe("vue-agent");
      expect(fetchedPkg.name).toBe("Vue 3 & Vite Agent");
      expect(fetchedPkg.version).toBe("1.1.0");
      expect(fetchedPkg.tokenFootprint).toBe(220);
      expect(fetchedPkg.rulesAst.length).toBe(1);
      expect(fetchedPkg.rulesAst[0].title).toBe("rules/vue.md > ## 1. Vue 3 Composition API Guidelines");
      expect(fetchedPkg.mcpServers.length).toBe(1);
      expect(fetchedPkg.mcpServers[0].name).toBe("vue-docs");
    });
  });
});
