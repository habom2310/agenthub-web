import { vi } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { packages, type NewPackage } from "@/lib/db/schema";

export interface FakeGithubUser {
  id: number;
  login: string;
  name?: string | null;
  avatar_url?: string;
}

export interface FakeGithubRepo {
  id: number;
  full_name: string;
  private?: boolean;
  permissions?: { push: boolean };
}

interface FakeGithub {
  tokens: Record<string, FakeGithubUser>;
  repos: Record<string, FakeGithubRepo>; // keyed by lowercase owner/repo; token-agnostic
  codes?: Record<string, string>; // OAuth code -> access token
  clientId?: string | null; // X-OAuth-Client-Id on /user; default is the configured id, null omits it
  fail?: (url: string) => Response | undefined; // force a response, e.g. a rate limit
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });

// Replaces global fetch with a tiny GitHub; every call is recorded in `calls`
export function mockGithub({ tokens, repos, codes = {}, clientId, fail }: FakeGithub) {
  const calls: { url: string; init?: RequestInit }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      const forced = fail?.(url);
      if (forced) return forced;
      const auth = new Headers(init?.headers).get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

      if (url === "https://github.com/login/oauth/access_token") {
        const code = JSON.parse(String(init?.body)).code;
        return json(codes[code] ? { access_token: codes[code] } : { error: "bad_verification_code" });
      }
      if (url === "https://api.github.com/user") {
        const id = clientId === undefined ? process.env.GITHUB_CLIENT_ID : clientId;
        return tokens[auth]
          ? json(tokens[auth], 200, id ? { "X-OAuth-Client-Id": id } : {})
          : json({ message: "Bad credentials" }, 401);
      }
      const repoMatch = url.match(/^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)$/);
      if (repoMatch) {
        const repo = repos[`${repoMatch[1]}/${repoMatch[2]}`.toLowerCase()];
        return repo ? json(repo) : json({ message: "Not Found" }, 404);
      }
      return json({ message: "unexpected" }, 500);
    })
  );
  return calls;
}

export const jsonRequest = (url: string, method: string, body?: unknown, headers: Record<string, string> = {}) =>
  new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

// Inserts a minimal package row; id "owner/repo" drives owner and repo
export async function insertPackage(id: string, overrides: Partial<NewPackage> = {}) {
  const [owner, repo] = id.split("/");
  const now = new Date().toISOString();
  await db.insert(packages).values({ id, owner, repo, name: repo, createdAt: now, updatedAt: now, ...overrides });
}
