import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { GET as getConfig } from "@/app/api/auth/config/route";
import { GET as whoami } from "@/app/api/auth/whoami/route";
import { GET as login } from "@/app/api/auth/github/login/route";
import { GET as callback } from "@/app/api/auth/github/callback/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { createSession } from "@/lib/auth";
import { db, initDb } from "@/lib/db";
import { MIGRATIONS, libsqlRunner, migrate } from "@/lib/db/migrations";
import { sessions, users } from "@/lib/db/schema";
import { accountErrorMessage, decodeState, sanitizeReturnTo } from "@/lib/oauth";
import { mockGithub } from "./helpers";

const ORIGIN = "http://localhost:3000";
const dana = { id: 5, login: "dana", name: "Dana", avatar_url: "https://avatars.test/dana" };

beforeAll(initDb);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("GET /api/auth/config", () => {
  it("returns the client id", async () => {
    vi.stubEnv("GITHUB_CLIENT_ID", "client-123");
    const res = await getConfig();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ githubClientId: "client-123" });
  });

  it("returns 503 when not configured", async () => {
    vi.stubEnv("GITHUB_CLIENT_ID", "");
    const res = await getConfig();
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "GitHub login is not configured on this registry." });
  });
});

describe("GET /api/auth/whoami", () => {
  beforeEach(() => {
    mockGithub({ tokens: { "tok-dana": dana }, repos: {} });
  });

  it("returns the user for a Bearer token and stores them", async () => {
    const res = await whoami(new NextRequest(`${ORIGIN}/api/auth/whoami`, { headers: { Authorization: "Bearer tok-dana" } }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ login: "dana", id: 5, name: "Dana", avatarUrl: "https://avatars.test/dana" });
    const [row] = await db.select().from(users).where(eq(users.id, 5));
    expect(row.login).toBe("dana");
  });

  it("returns the user for a session cookie", async () => {
    await whoami(new NextRequest(`${ORIGIN}/api/auth/whoami`, { headers: { Authorization: "Bearer tok-dana" } }));
    const token = await createSession(5);
    const res = await whoami(new NextRequest(`${ORIGIN}/api/auth/whoami`, { headers: { Cookie: `ah_session=${token}` } }));
    expect(res.status).toBe(200);
    expect((await res.json()).login).toBe("dana");
  });

  it("returns 401 for nothing, a bad token, or an unknown session", async () => {
    for (const headers of [{} as Record<string, string>, { Authorization: "Bearer bad" }, { Cookie: "ah_session=unknown" }]) {
      const res = await whoami(new NextRequest(`${ORIGIN}/api/auth/whoami`, { headers }));
      expect(res.status).toBe(401);
      expect(res.headers.get("WWW-Authenticate")).toBe("Bearer");
    }
  });

  it("returns 401 for a token from another OAuth app", async () => {
    mockGithub({ tokens: { "tok-dana": dana }, repos: {}, clientId: "someone-else" });
    const res = await whoami(new NextRequest(`${ORIGIN}/api/auth/whoami`, { headers: { Authorization: "Bearer tok-dana" } }));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toContain("agenthub login");
  });

  it("returns 401 for an expired session", async () => {
    await whoami(new NextRequest(`${ORIGIN}/api/auth/whoami`, { headers: { Authorization: "Bearer tok-dana" } }));
    const token = await createSession(5);
    await db.update(sessions).set({ expiresAt: new Date(Date.now() - 1000).toISOString() });
    const res = await whoami(new NextRequest(`${ORIGIN}/api/auth/whoami`, { headers: { Cookie: `ah_session=${token}` } }));
    expect(res.status).toBe(401);
  });
});

describe("website login", () => {
  beforeEach(() => {
    vi.stubEnv("GITHUB_CLIENT_ID", "client-123");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "secret-456");
  });

  const start = async (returnTo?: string) => {
    const res = await login(new NextRequest(`${ORIGIN}/api/auth/github/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`));
    const target = new URL(res.headers.get("location")!);
    return { res, target, cookie: res.cookies.get("ah_oauth_state")!.value, state: target.searchParams.get("state")! };
  };

  const finish = (query: string, cookie?: string) =>
    callback(
      new NextRequest(`${ORIGIN}/api/auth/github/callback?${query}`, {
        headers: cookie ? { Cookie: `ah_oauth_state=${cookie}` } : {},
      })
    );

  it("redirects to GitHub with no scope and sets an HttpOnly state cookie", async () => {
    const { res, target, state } = await start("/packages/a/b");
    expect(target.origin + target.pathname).toBe("https://github.com/login/oauth/authorize");
    expect(target.searchParams.get("client_id")).toBe("client-123");
    expect(target.searchParams.get("redirect_uri")).toBe(`${ORIGIN}/api/auth/github/callback`);
    expect(target.searchParams.has("scope")).toBe(false);
    expect(state).toHaveLength(32);
    const header = res.headers.get("set-cookie")!;
    expect(header).toMatch(/ah_oauth_state=/);
    expect(header).toMatch(/HttpOnly/i);
    expect(header).toMatch(/SameSite=lax/i);
  });

  it("redirects to /account?error when GitHub login is not configured", async () => {
    vi.stubEnv("GITHUB_CLIENT_ID", "");
    const res = await login(new NextRequest(`${ORIGIN}/api/auth/github/login`));
    expect(res.headers.get("location")).toBe(`${ORIGIN}/account?error=not_configured`);
  });

  it("shows fixed messages for known error codes and a generic one otherwise", () => {
    expect(accountErrorMessage("oauth_denied")).toBe("GitHub sign-in was cancelled or denied.");
    expect(accountErrorMessage("<script>alert(1)</script>")).toBe("Sign-in failed. Please try again.");
    expect(accountErrorMessage("constructor")).toBe("Sign-in failed. Please try again.");
  });

  it("only allows same-site return paths", () => {
    expect(sanitizeReturnTo("/packages/a/b?x=1#top")).toBe("/packages/a/b?x=1#top");
    for (const bad of ["/\t/evil.com", "/\n/evil.com", "//evil.com", "/\\evil.com", "https://evil.com", "evil", "", null]) {
      expect(sanitizeReturnTo(bad)).toBe("/account");
    }
  });

  it("stores a sanitised returnTo from the login route", async () => {
    const { cookie } = await start("/\t/evil.com");
    expect(decodeState(decodeURIComponent(cookie))?.returnTo).toBe("/account");
  });

  it("rejects a state mismatch without creating a session", async () => {
    const calls = mockGithub({ tokens: { "gh-token": dana }, repos: {}, codes: { good: "gh-token" } });
    const { cookie } = await start();
    const res = await finish("code=good&state=wrong", cookie);
    expect(res.headers.get("location")).toBe(`${ORIGIN}/account?error=state_mismatch`);
    expect(res.cookies.get("ah_session")).toBeUndefined();
    expect(calls).toHaveLength(0);

    const missing = await finish("code=good&state=whatever");
    expect(missing.headers.get("location")).toContain("/account?error=");
    expect(missing.cookies.get("ah_session")).toBeUndefined();
  });

  it("reports a GitHub-side denial", async () => {
    const { cookie, state } = await start();
    const res = await finish(`error=access_denied&state=${state}`, cookie);
    expect(res.headers.get("location")).toBe(`${ORIGIN}/account?error=oauth_denied`);
  });

  it("logs GitHub's error code when the code exchange is rejected", async () => {
    mockGithub({ tokens: {}, repos: {}, codes: {} });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { cookie, state } = await start();
    const res = await finish(`code=wrong&state=${state}`, cookie);
    expect(res.headers.get("location")).toBe(`${ORIGIN}/account?error=oauth_failed`);
    expect(String(log.mock.calls[0]?.[1])).toContain("bad_verification_code");
    expect(res.cookies.get("ah_session")).toBeUndefined();
    log.mockRestore();
  });

  it("creates a hashed session, sets the cookie and redirects to returnTo", async () => {
    const calls = mockGithub({ tokens: { "gh-token": dana }, repos: {}, codes: { good: "gh-token" } });
    const { cookie, state } = await start("/packages/a/b");
    const res = await finish(`code=good&state=${state}`, cookie);

    expect(res.headers.get("location")).toBe(`${ORIGIN}/packages/a/b`);
    const session = res.cookies.get("ah_session")!;
    expect(session.value).toHaveLength(64);
    const header = res.headers.get("set-cookie")!;
    expect(header).toMatch(/ah_session=[0-9a-f]{64}.*HttpOnly/i);
    expect(header).toMatch(/Max-Age=2592000/i);
    expect(header).toMatch(/SameSite=lax/i);
    expect(header).not.toMatch(/Secure/i); // localhost

    const exchange = calls.find((c) => c.url.endsWith("/login/oauth/access_token"))!;
    expect(JSON.parse(String(exchange.init?.body))).toMatchObject({ client_secret: "secret-456", code: "good" });

    // Only the hash is stored, never the token
    const rows = await db.select().from(sessions);
    expect(rows.some((r) => r.idHash === session.value)).toBe(false);
    expect(rows.length).toBeGreaterThan(0);

    const who = await whoami(new NextRequest(`${ORIGIN}/api/auth/whoami`, { headers: { Cookie: `ah_session=${session.value}` } }));
    expect((await who.json()).login).toBe("dana");
  });

  it("purges expired sessions when a new session is created", async () => {
    await db.update(sessions).set({ expiresAt: new Date(Date.now() - 1000).toISOString() });
    await createSession(5);
    const rows = await db.select().from(sessions);
    expect(rows.every((r) => new Date(r.expiresAt).getTime() > Date.now())).toBe(true);
  });

  it("marks the session cookie Secure off localhost", async () => {
    mockGithub({ tokens: { "gh-token": dana }, repos: {}, codes: { good: "gh-token" } });
    const host = "https://registry.example";
    const res = await callback(
      new NextRequest(`${host}/api/auth/github/callback?code=good&state=s1`, { headers: { Cookie: "ah_oauth_state=s1:%2Faccount" } })
    );
    expect(res.headers.get("set-cookie")).toMatch(/ah_session=.*Secure/i);
  });

  it("logs out: deletes the session row and clears the cookie", async () => {
    mockGithub({ tokens: { "gh-token": dana }, repos: {}, codes: { good: "gh-token" } });
    const { cookie, state } = await start();
    const token = (await finish(`code=good&state=${state}`, cookie)).cookies.get("ah_session")!.value;

    const res = await logout(new NextRequest(`${ORIGIN}/api/auth/logout`, { method: "POST", headers: { Cookie: `ah_session=${token}` } }));
    expect(res.status).toBe(303);
    expect(res.headers.get("set-cookie")).toMatch(/ah_session=;.*Max-Age=0/i);

    const who = await whoami(new NextRequest(`${ORIGIN}/api/auth/whoami`, { headers: { Cookie: `ah_session=${token}` } }));
    expect(who.status).toBe(401);
  });

  it("refuses a cross-origin, null or malformed Origin on logout", async () => {
    for (const origin of ["https://evil.example", "null", "not a url"]) {
      const res = await logout(new NextRequest(`${ORIGIN}/api/auth/logout`, { method: "POST", headers: { Origin: origin } }));
      expect(res.status, origin).toBe(403);
    }
  });
});

describe("migrations", () => {
  const tables = async (client: ReturnType<typeof createClient>) =>
    (await client.execute("SELECT name FROM sqlite_master WHERE type='table'")).rows.map((r) => String(r.name));
  const columns = async (client: ReturnType<typeof createClient>) =>
    (await client.execute("PRAGMA table_info(packages)")).rows.map((r) => String(r.name));

  it("applies every migration on a fresh database and is idempotent", async () => {
    const client = createClient({ url: ":memory:" });
    await migrate(libsqlRunner(client));
    await migrate(libsqlRunner(client));

    expect(await tables(client)).toEqual(expect.arrayContaining(["packages", "users", "sessions", "schema_migrations"]));
    expect(await columns(client)).toEqual(expect.arrayContaining(["publisher_id", "github_repo_id"]));
    const applied = (await client.execute("SELECT id FROM schema_migrations")).rows.map((r) => String(r.id));
    expect(applied).toEqual(MIGRATIONS.map((m) => m.id));
  });

  it("skips ADD COLUMN steps whose column already exists", async () => {
    const client = createClient({ url: ":memory:" });
    await client.execute(MIGRATIONS[0].statements[0] as string);
    await client.execute("ALTER TABLE packages ADD COLUMN publisher_id INTEGER");
    await migrate(libsqlRunner(client));
    expect(await columns(client)).toEqual(expect.arrayContaining(["publisher_id", "github_repo_id"]));
  });

  it("upgrades a populated database that has the old packages table, keeping its rows", async () => {
    const client = createClient({ url: ":memory:" });
    await client.execute(MIGRATIONS[0].statements[0] as string);
    const insert = (id: string) =>
      client.execute({
        sql: "INSERT INTO packages (id, owner, repo, name, created_at, updated_at) VALUES (?, ?, ?, 'n', 't', 't')",
        args: [id, id.split("/")[0], id.split("/")[1]],
      });
    await insert("keep/me");
    await insert("community/live-test-agent");
    expect(await columns(client)).not.toContain("publisher_id");

    await migrate(libsqlRunner(client));
    await migrate(libsqlRunner(client));

    const ids = (await client.execute("SELECT id, publisher_id FROM packages")).rows;
    expect(ids.map((r) => String(r.id))).toEqual(["keep/me"]);
    expect(ids[0].publisher_id).toBeNull();
    expect(await columns(client)).toEqual(expect.arrayContaining(["publisher_id", "github_repo_id"]));
  });
});
