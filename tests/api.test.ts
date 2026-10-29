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
    await db.delete(packages).where(eq(packages.id, "bob/defensive-agent"));
    await db.delete(packages).where(eq(packages.id, "bob/auth-agent"));
  });

  afterAll(async () => {
    // Clean up test package
    await db.delete(packages).where(eq(packages.id, "bob/vue-agent"));
    await db.delete(packages).where(eq(packages.id, "bob/defensive-agent"));
    await db.delete(packages).where(eq(packages.id, "bob/auth-agent"));
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

    it("calculates tokenFootprint using Math.max(explicitTokens, computedTokens)", async () => {
      // 1. explicitTokens higher than computedTokens
      const payloadHigh = {
        owner: "bob",
        repo: "vue-agent",
        name: "Vue Agent",
        tokenFootprint: 1200,
        rulesAst: [{ title: "R1", file: "r1.md", tokens: 300, content: "abc" }],
      };
      const req1 = new NextRequest("http://localhost:3000/api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadHigh),
      });
      const res1 = await postIndex(req1);
      const data1 = await res1.json();
      expect(data1.package.tokenFootprint).toBe(1200);

      // 2. computedTokens higher than explicitTokens
      const payloadLow = {
        owner: "bob",
        repo: "vue-agent",
        name: "Vue Agent",
        tokenFootprint: 100,
        rulesAst: [{ title: "R1", file: "r1.md", tokens: 500, content: "abc" }],
      };
      const req2 = new NextRequest("http://localhost:3000/api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadLow),
      });
      const res2 = await postIndex(req2);
      const data2 = await res2.json();
      expect(data2.package.tokenFootprint).toBe(500);
    });

    it("handles defensive parsing of non-array fields, string isClean, and securityRisk", async () => {
      const defensivePayload = {
        owner: "bob",
        repo: "defensive-agent",
        name: "Defensive Agent",
        platforms: null,
        tags: "not-an-array",
        rulesAst: null,
        skills: null,
        mcpServers: undefined,
        isClean: "false",
        securityRisk: "MEDIUM",
      };

      const postReq = new NextRequest("http://localhost:3000/api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defensivePayload),
      });
      const postRes = await postIndex(postReq);
      expect(postRes.status).toBe(201);
      const postData = await postRes.json();

      expect(postData.package.isClean).toBe(false);
      expect(postData.package.securityRisk).toBe("medium");
      expect(Array.isArray(postData.package.platforms)).toBe(true);
      expect(postData.package.platforms).toEqual([]);
      expect(Array.isArray(postData.package.tags)).toBe(true);
      expect(postData.package.tags).toEqual([]);
      expect(Array.isArray(postData.package.rulesAst)).toBe(true);
      expect(postData.package.rulesAst).toEqual([]);
      expect(Array.isArray(postData.package.skills)).toBe(true);
      expect(postData.package.skills).toEqual([]);
      expect(Array.isArray(postData.package.mcpServers)).toBe(true);
      expect(postData.package.mcpServers).toEqual([]);
      expect(postData.package.tokenFootprint).toBe(850);
    });

    it("rejects requests without or with wrong token with 401 when REGISTRY_SECRET is set", async () => {
      const origSecret = process.env.REGISTRY_SECRET;
      try {
        process.env.REGISTRY_SECRET = "test-secret-123";

        const authPayload = {
          owner: "bob",
          repo: "auth-agent",
          name: "Auth Test Agent",
        };

        // Without auth header
        const noAuthReq = new NextRequest("http://localhost:3000/api/index", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authPayload),
        });
        const noAuthRes = await postIndex(noAuthReq);
        expect(noAuthRes.status).toBe(401);
        expect(noAuthRes.headers.get("www-authenticate")).toBe("Bearer");
        const noAuthData = await noAuthRes.json();
        expect(noAuthData.error).toBe("Unauthorized: Invalid or missing publish token.");

        // With wrong auth token
        const wrongAuthReq = new NextRequest("http://localhost:3000/api/index", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer invalid-token",
          },
          body: JSON.stringify(authPayload),
        });
        const wrongAuthRes = await postIndex(wrongAuthReq);
        expect(wrongAuthRes.status).toBe(401);
        expect(wrongAuthRes.headers.get("www-authenticate")).toBe("Bearer");
        const wrongAuthData = await wrongAuthRes.json();
        expect(wrongAuthData.error).toBe("Unauthorized: Invalid or missing publish token.");
      } finally {
        if (origSecret !== undefined) {
          process.env.REGISTRY_SECRET = origSecret;
        } else {
          delete process.env.REGISTRY_SECRET;
        }
      }
    });

    it("rejects malformed authorization headers with 401 and WWW-Authenticate header", async () => {
      const origSecret = process.env.REGISTRY_SECRET;
      try {
        process.env.REGISTRY_SECRET = "test-secret-123";

        const authPayload = {
          owner: "bob",
          repo: "auth-agent",
          name: "Auth Test Agent",
        };

        const malformedHeaders = [
          "test-secret-123", // missing Bearer prefix
          "Basic dXNlcjpwYXNz", // Basic auth scheme
          "Bearer ", // empty token after Bearer
          "Bearer", // no token
        ];

        for (const authHeader of malformedHeaders) {
          const req = new NextRequest("http://localhost:3000/api/index", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify(authPayload),
          });
          const res = await postIndex(req);
          expect(res.status).toBe(401);
          expect(res.headers.get("www-authenticate")).toBe("Bearer");
          const data = await res.json();
          expect(data.error).toBe("Unauthorized: Invalid or missing publish token.");
        }
      } finally {
        if (origSecret !== undefined) {
          process.env.REGISTRY_SECRET = origSecret;
        } else {
          delete process.env.REGISTRY_SECRET;
        }
      }
    });

    it("respects AGENTHUB_PUBLISH_SECRET as an alternate env secret", async () => {
      const origRegSecret = process.env.REGISTRY_SECRET;
      const origPubSecret = process.env.AGENTHUB_PUBLISH_SECRET;
      try {
        delete process.env.REGISTRY_SECRET;
        process.env.AGENTHUB_PUBLISH_SECRET = "pub-secret-alternate-456";

        const authPayload = {
          owner: "bob",
          repo: "auth-agent",
          name: "Auth Test Agent",
        };

        // Without auth header -> 401
        const noAuthReq = new NextRequest("http://localhost:3000/api/index", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authPayload),
        });
        const noAuthRes = await postIndex(noAuthReq);
        expect(noAuthRes.status).toBe(401);
        expect(noAuthRes.headers.get("www-authenticate")).toBe("Bearer");

        // With correct token -> 201
        const authReq = new NextRequest("http://localhost:3000/api/index", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer pub-secret-alternate-456",
          },
          body: JSON.stringify(authPayload),
        });
        const authRes = await postIndex(authReq);
        expect(authRes.status).toBe(201);
        const authData = await authRes.json();
        expect(authData.message).toBe("Package indexed successfully");
      } finally {
        if (origRegSecret !== undefined) {
          process.env.REGISTRY_SECRET = origRegSecret;
        } else {
          delete process.env.REGISTRY_SECRET;
        }
        if (origPubSecret !== undefined) {
          process.env.AGENTHUB_PUBLISH_SECRET = origPubSecret;
        } else {
          delete process.env.AGENTHUB_PUBLISH_SECRET;
        }
      }
    });

    it("succeeds with 201 when correct Authorization: Bearer <secret> header is supplied when REGISTRY_SECRET is set", async () => {
      const origSecret = process.env.REGISTRY_SECRET;
      try {
        process.env.REGISTRY_SECRET = "test-secret-123";

        const authPayload = {
          owner: "bob",
          repo: "auth-agent",
          name: "Auth Test Agent",
        };

        const authReq = new NextRequest("http://localhost:3000/api/index", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-secret-123",
          },
          body: JSON.stringify(authPayload),
        });
        const authRes = await postIndex(authReq);
        expect(authRes.status).toBe(201);
        const authData = await authRes.json();
        expect(authData.message).toBe("Package indexed successfully");
        expect(authData.package.id).toBe("bob/auth-agent");
      } finally {
        if (origSecret !== undefined) {
          process.env.REGISTRY_SECRET = origSecret;
        } else {
          delete process.env.REGISTRY_SECRET;
        }
      }
    });
  });
});
