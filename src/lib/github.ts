import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HttpError } from "@/lib/http";

const API = "https://api.github.com";

// Cloudflare env first, then process.env for local dev and tests
export function getEnv(name: string): string | undefined {
  try {
    const value = (getCloudflareContext().env as unknown as Record<string, unknown>)?.[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  } catch {
    // Cloudflare context unavailable
  }
  return process.env[name]?.trim() || undefined;
}

export interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface GithubRepo {
  id: number;
  fullName: string;
  isPrivate: boolean;
  canPush: boolean;
}

function githubHeaders(token?: string): Record<string, string> {
  return {
    "User-Agent": "agenthub-registry",
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GET from the GitHub API. Null for the given "not found" status; rate limits and other failures throw HttpError.
async function githubGet(path: string, token: string, missing: number): Promise<{ data: any; res: Response } | null> {
  const res = await fetch(`${API}${path}`, { headers: githubHeaders(token) });
  if (res.status === missing) return null;
  if (res.status === 403 || res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    throw new HttpError(
      503,
      "GitHub is rate-limiting AgentHub or rejected the request. Try again shortly.",
      retryAfter ? { "Retry-After": retryAfter } : {}
    );
  }
  if (!res.ok) throw new HttpError(502, `GitHub returned an unexpected response (${res.status}). Try again shortly.`);
  return { data: await res.json(), res };
}

// Returns null when GitHub rejects the token. clientId is the OAuth app that issued the token, if any.
export async function fetchGithubUser(token: string): Promise<(GithubUser & { clientId: string | null }) | null> {
  const found = await githubGet("/user", token, 401);
  if (!found) return null;
  const { data, res } = found;
  return {
    id: data.id,
    login: data.login,
    name: data.name ?? null,
    avatarUrl: data.avatar_url ?? null,
    clientId: res.headers.get("x-oauth-client-id"),
  };
}

// Returns null when the repo does not exist or the token cannot see it
export async function fetchGithubRepo(token: string, owner: string, repo: string): Promise<GithubRepo | null> {
  const found = await githubGet(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, token, 404);
  const data = found?.data;
  return (
    data && {
      id: data.id,
      fullName: String(data.full_name).toLowerCase(),
      isPrivate: data.private === true,
      canPush: data.permissions?.push === true,
    }
  );
}

// Returns the access token, or null when GitHub refuses the code
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string | null> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { ...githubHeaders(), "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: getEnv("GITHUB_CLIENT_ID"),
      client_secret: getEnv("GITHUB_CLIENT_SECRET"),
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) throw new Error(`GitHub token exchange failed with ${res.status}`);
  const data = await res.json();
  return typeof data.access_token === "string" ? data.access_token : null;
}
