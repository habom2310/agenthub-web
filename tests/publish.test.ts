import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as postIndex } from "@/app/api/index/route";
import { GET as getPackageDetail, DELETE as deletePackage } from "@/app/api/packages/[owner]/[repo]/route";
import { GET as getPackages } from "@/app/api/packages/route";
import { createSession } from "@/lib/auth";
import { db, initDb } from "@/lib/db";
import { packages, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonRequest, mockGithub } from "./helpers";

const alice = { id: 1, login: "alice-dev", name: "Alice", avatar_url: "https://avatars.test/alice" };
const carol = { id: 3, login: "Carol", name: null, avatar_url: "https://avatars.test/carol" };

const repo = (id: number, fullName: string, extra: Record<string, unknown> = {}) => ({
  id,
  full_name: fullName,
  private: false,
  permissions: { push: true },
  ...extra,
});

const github = () =>
  mockGithub({
    tokens: { "tok-alice": alice, "tok-bob": { id: 2, login: "bob" }, "tok-carol": carol },
    repos: {
      "bob/vue-agent": repo(101, "Bob/Vue-Agent"),
      "bob/private-agent": repo(102, "bob/private-agent", { private: true }),
      "bob/readonly-agent": repo(103, "bob/readonly-agent", { permissions: { push: false } }),
      "carol/team-agent": repo(104, "Carol/team-agent"),
    },
  });

const payload = {
  owner: "bob",
  repo: "vue-agent",
  name: "Vue 3 & Vite Agent",
  version: "1.0.0",
  description: "Turnkey profile for Vue 3, Vite, and Pinia workflows",
  type: "profile",
  platforms: ["gemini", "claude", "cursor"],
  tags: ["vue"],
  rulesAst: [{ title: "rules/vue.md > ## 1", file: "rules/vue.md", tokens: 220, content: "Use script setup." }],
  readme: "# Vue 3 Agent",
};

const publish = (token: string | null, body: unknown = payload) =>
  postIndex(jsonRequest("http://localhost:3000/api/index", "POST", body, token ? { Authorization: `Bearer ${token}` } : {}));

const unpublish = (id: string, headers: Record<string, string>) =>
  deletePackage(jsonRequest(`http://localhost:3000/api/packages/${id}`, "DELETE", undefined, headers), {
    params: Promise.resolve({ owner: id.split("/")[0], repo: id.split("/")[1] }),
  });

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

describe("POST /api/index", () => {
  beforeAll(initDb);
  beforeEach(() => {
    github();
  });
  afterEach(async () => {
    vi.unstubAllGlobals();
    await db.delete(packages).where(eq(packages.owner, "bob"));
    await db.delete(packages).where(eq(packages.owner, "carol"));
  });

  it("rejects a missing token with 401 and WWW-Authenticate", async () => {
    const res = await publish(null);
    expect(res.status).toBe(401);
    expect(res.headers.get("WWW-Authenticate")).toBe("Bearer");
    expect((await res.json()).error).toBeTruthy();
  });

  it("rejects a token GitHub does not recognise", async () => {
    const res = await publish("nope");
    expect(res.status).toBe(401);
    expect(res.headers.get("WWW-Authenticate")).toBe("Bearer");
  });

  it("rejects a session cookie, publishing is Bearer only", async () => {
    await upsert(alice);
    const cookie = `ah_session=${await createSession(alice.id)}`;
    const res = await postIndex(jsonRequest("http://localhost:3000/api/index", "POST", payload, { Cookie: cookie }));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the GitHub repo is missing", async () => {
    const res = await publish("tok-bob", { ...payload, repo: "ghost" });
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe("GitHub repo bob/ghost not found or not public.");
  });

  it("returns 400 for a private repo", async () => {
    const res = await publish("tok-bob", { ...payload, repo: "private-agent" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("must be public so others can install it");
  });

  it("returns 403 without push access", async () => {
    const res = await publish("tok-bob", { ...payload, repo: "readonly-agent" });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe("You (@bob) don't have push access to bob/readonly-agent.");
  });

  it("rejects owner and repo that are not GitHub names", async () => {
    const res = await publish("tok-bob", { ...payload, repo: "../user" });
    expect(res.status).toBe(400);
  });

  it("publishes with push access: canonical id, publisher stored, stars 0", async () => {
    const res = await publish("tok-bob");
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.message).toBe("Package indexed successfully");
    expect(data.package.id).toBe("bob/vue-agent");
    expect(data.package.owner).toBe("bob");
    expect(data.package.repo).toBe("vue-agent");
    expect(data.package.stars).toBe(0);
    expect(data.package.installCount).toBe(0);
    expect(data.package.tokenFootprint).toBe(220);
    expect(data.package.publisher).toEqual({ login: "bob", avatarUrl: null });
    expect(data.package).not.toHaveProperty("publisherId");

    const [row] = await db.select().from(packages).where(eq(packages.id, "bob/vue-agent"));
    expect(row.publisherId).toBe(2);
    expect(row.githubRepoId).toBe(101);

    const detail = await getPackageDetail(new NextRequest("http://localhost:3000/api/packages/bob/vue-agent"), {
      params: Promise.resolve({ owner: "bob", repo: "vue-agent" }),
    });
    expect((await detail.json()).publisher.login).toBe("bob");

    const list = await (await getPackages(new NextRequest("http://localhost:3000/api/packages"))).json();
    expect(list.packages.find((p: { id: string }) => p.id === "bob/vue-agent").publisher.login).toBe("bob");
  });

  it("lets a collaborator with push access re-publish but keeps the original publisher", async () => {
    await publish("tok-bob");
    await db.update(packages).set({ stars: 7 }).where(eq(packages.id, "bob/vue-agent"));
    const calls = mockGithub({
      tokens: { "tok-alice": alice },
      repos: { "bob/vue-agent": repo(101, "bob/vue-agent") },
    });

    const res = await publish("tok-alice", { ...payload, version: "1.1.0" });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.package.version).toBe("1.1.0");
    expect(data.package.publisher.login).toBe("bob");
    expect(data.package.stars).toBe(7);
    expect(calls.some((c) => c.url.endsWith("/repos/bob/vue-agent"))).toBe(true);
  });

  it("returns 409 when the name now points at a different GitHub repo, unless the caller is the publisher", async () => {
    await publish("tok-bob");
    const recreated = { "bob/vue-agent": repo(999, "bob/vue-agent") };

    mockGithub({ tokens: { "tok-alice": alice }, repos: recreated });
    const res = await publish("tok-alice");
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe(
      "bob/vue-agent was published from a different GitHub repo. Its publisher must unpublish it first."
    );
    const [row] = await db.select().from(packages).where(eq(packages.id, "bob/vue-agent"));
    expect(row.githubRepoId).toBe(101);

    mockGithub({ tokens: { "tok-bob": { id: 2, login: "bob" } }, repos: recreated });
    expect((await publish("tok-bob")).status).toBe(201);
    const [updated] = await db.select().from(packages).where(eq(packages.id, "bob/vue-agent"));
    expect(updated.githubRepoId).toBe(999);
    expect(updated.publisherId).toBe(2);
  });

  it("adopts a legacy row with no GitHub repo id on first publish", async () => {
    await publish("tok-bob");
    await db.update(packages).set({ githubRepoId: null, publisherId: null }).where(eq(packages.id, "bob/vue-agent"));
    const res = await publish("tok-bob");
    expect(res.status).toBe(201);
    const [row] = await db.select().from(packages).where(eq(packages.id, "bob/vue-agent"));
    expect(row.githubRepoId).toBe(101);
    expect(row.publisherId).toBe(2);
  });

  it("rejects tokens not issued by this registry's OAuth app", async () => {
    for (const clientId of [null, "other-app"]) {
      mockGithub({ tokens: { "tok-bob": { id: 2, login: "bob" } }, repos: { "bob/vue-agent": repo(101, "bob/vue-agent") }, clientId });
      const res = await publish("tok-bob");
      expect(res.status).toBe(401);
      expect((await res.json()).error).toBe("This token was not issued by AgentHub login. Run: agenthub login");
      expect(res.headers.get("WWW-Authenticate")).toBe("Bearer");
    }
    mockGithub({ tokens: { "tok-bob": { id: 2, login: "bob" } }, repos: { "bob/vue-agent": repo(101, "bob/vue-agent") }, clientId: "TEST-CLIENT" });
    expect((await publish("tok-bob")).status).toBe(201); // header compared case-insensitively
  });

  it("maps GitHub rate limits to 503 with Retry-After, and other failures to 502", async () => {
    const base = { tokens: { "tok-bob": { id: 2, login: "bob" } }, repos: {} };
    mockGithub({ ...base, fail: (url) => (url.endsWith("/user") ? new Response("{}", { status: 429, headers: { "Retry-After": "30" } }) : undefined) });
    const limited = await publish("tok-bob");
    expect(limited.status).toBe(503);
    expect(limited.headers.get("Retry-After")).toBe("30");
    expect((await limited.json()).error).toContain("rate-limiting");

    mockGithub({ ...base, fail: (url) => (url.includes("/repos/") ? new Response("{}", { status: 403 }) : undefined) });
    expect((await publish("tok-bob")).status).toBe(503);

    mockGithub({ ...base, fail: (url) => (url.includes("/repos/") ? new Response("{}", { status: 500 }) : undefined) });
    const broken = await publish("tok-bob");
    expect(broken.status).toBe(502);
    expect((await broken.json()).error).toBeTruthy();
  });

  it("rejects bad bodies with 400 or 413, never 500", async () => {
    const send = (raw: string, headers: Record<string, string> = {}) =>
      postIndex(new NextRequest("http://localhost:3000/api/index", { method: "POST", headers: { Authorization: "Bearer tok-bob", ...headers }, body: raw }));
    expect((await send("not json")).status).toBe(400);
    expect((await send("[]")).status).toBe(400);
    expect((await send("null")).status).toBe(400);
    expect((await send(JSON.stringify({ ...payload, readme: "x".repeat(1024 * 1024 + 1) }))).status).toBe(413);

    const bad: Record<string, unknown>[] = [
      { name: 5 },
      { version: {} },
      { description: "d".repeat(1001) },
      { readme: "r".repeat(200_001) },
      { license: [] },
      { type: 1 },
      { platforms: "claude" },
      { tags: [1] },
      { tags: [null] },
      { rulesAst: [null] },
      { rulesAst: [{ title: "t", file: "f", tokens: "many" }] },
      { rulesAst: "x" },
      { skills: [{ description: "no name" }] },
      { skills: [null] },
      { mcpServers: [{ name: "m", command: "c", args: "nope" }] },
      { mcpServers: [{ name: "m", command: "c", risk: "extreme" }] },
      { mcpServers: [null] },
    ];
    for (const override of bad) {
      const res = await publish("tok-bob", { ...payload, ...override });
      expect(res.status, JSON.stringify(override)).toBe(400);
      expect((await res.json()).error).toBeTruthy();
    }
  });

  it("keeps the existing validation: token footprint, defensive parsing", async () => {
    const res = await publish("tok-bob", {
      owner: "bob",
      repo: "vue-agent",
      name: "Defensive",
      platforms: null,
      tags: null,
      rulesAst: null,
      isClean: "false",
      securityRisk: "MEDIUM",
    });
    const { package: pkg } = await res.json();
    expect(pkg.isClean).toBe(false);
    expect(pkg.securityRisk).toBe("medium");
    expect(pkg.platforms).toEqual([]);
    expect(pkg.tags).toEqual([]);
    expect(pkg.tokenFootprint).toBe(850);

    const high = await (await publish("tok-bob", { ...payload, tokenFootprint: 1200 })).json();
    expect(high.package.tokenFootprint).toBe(1200);
    const low = await (await publish("tok-bob", { ...payload, tokenFootprint: 10 })).json();
    expect(low.package.tokenFootprint).toBe(220);
  });
});

async function upsert(user: { id: number; login: string }) {
  const now = new Date().toISOString();
  await db
    .insert(users)
    .values({ id: user.id, login: user.login, createdAt: now, updatedAt: now })
    .onConflictDoNothing();
}

describe("DELETE /api/packages/{owner}/{repo}", () => {
  const origin = { Origin: "http://localhost:3000" };

  beforeAll(initDb);
  beforeEach(async () => {
    github();
    await publish("tok-bob"); // bob/vue-agent, publisher bob
    await publish("tok-carol", { ...payload, owner: "carol", repo: "team-agent" }); // carol/team-agent
  });
  afterEach(async () => {
    vi.unstubAllGlobals();
    await db.delete(packages).where(eq(packages.owner, "bob"));
    await db.delete(packages).where(eq(packages.owner, "carol"));
  });

  const sessionCookie = async (user: { id: number; login: string }) => {
    await upsert(user);
    return { Cookie: `ah_session=${await createSession(user.id)}` };
  };

  const exists = async (id: string) => (await db.select().from(packages).where(eq(packages.id, id))).length === 1;

  it("401 without credentials", async () => {
    expect((await unpublish("bob/vue-agent", {})).status).toBe(401);
  });

  it("404 for an unknown package", async () => {
    expect((await unpublish("bob/none", bearer("tok-bob"))).status).toBe(404);
  });

  it("Bearer: the publisher can unpublish", async () => {
    const res = await unpublish("bob/vue-agent", bearer("tok-bob"));
    expect(res.status).toBe(200);
    expect((await res.json()).message).toBe("Unpublished bob/vue-agent");
    expect(await exists("bob/vue-agent")).toBe(false);
  });

  it("Bearer: a user with push access to the repo can unpublish", async () => {
    mockGithub({ tokens: { "tok-alice": alice }, repos: { "bob/vue-agent": repo(101, "bob/vue-agent") } });
    expect((await unpublish("bob/vue-agent", bearer("tok-alice"))).status).toBe(200);
  });

  it("Bearer: a user without push access gets 403", async () => {
    mockGithub({
      tokens: { "tok-alice": alice },
      repos: { "bob/vue-agent": repo(101, "bob/vue-agent", { permissions: { push: false } }) },
    });
    expect((await unpublish("bob/vue-agent", bearer("tok-alice"))).status).toBe(403);
    expect(await exists("bob/vue-agent")).toBe(true);
  });

  it("Cookie: the publisher can unpublish from the same origin", async () => {
    const res = await unpublish("bob/vue-agent", { ...origin, ...(await sessionCookie({ id: 2, login: "bob" })) });
    expect(res.status).toBe(200);
  });

  it("Cookie: a matching login is not enough, only the publisher id counts", async () => {
    const res = await unpublish("carol/team-agent", { ...origin, ...(await sessionCookie({ id: 33, login: "CAROL" })) });
    expect(res.status).toBe(403);
    expect(await exists("carol/team-agent")).toBe(true);
    const owner = await unpublish("carol/team-agent", { ...origin, ...(await sessionCookie({ id: 3, login: "renamed" })) });
    expect(owner.status).toBe(200);
  });

  it("Cookie: a cross-origin or origin-less request is rejected", async () => {
    const cookie = await sessionCookie({ id: 2, login: "bob" });
    expect((await unpublish("bob/vue-agent", { ...cookie, Origin: "https://evil.example" })).status).toBe(403);
    expect((await unpublish("bob/vue-agent", cookie)).status).toBe(403);
    expect(await exists("bob/vue-agent")).toBe(true);
  });

  it("Cookie: an unrelated user gets 403", async () => {
    const res = await unpublish("bob/vue-agent", { ...origin, ...(await sessionCookie({ id: 9, login: "mallory" })) });
    expect(res.status).toBe(403);
    expect(await exists("bob/vue-agent")).toBe(true);
  });

  it("demo packages (no publisher) cannot be deleted", async () => {
    expect((await unpublish("alice/nextjs-agent", bearer("tok-alice"))).status).toBe(403);
    const cookie = await sessionCookie({ id: 1, login: "alice" });
    expect((await unpublish("alice/nextjs-agent", { ...origin, ...cookie })).status).toBe(403);
    expect(await exists("alice/nextjs-agent")).toBe(true);
  });
});
