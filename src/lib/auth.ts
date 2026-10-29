import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, lt } from "drizzle-orm";
import { db, initDb } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { fetchGithubUser, getEnv, type GithubUser } from "@/lib/github";
import { HttpError } from "@/lib/http";

export const SESSION_COOKIE = "ah_session";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

export interface AuthUser {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

export type Authenticated =
  | { via: "bearer"; user: AuthUser; token: string }
  | { via: "session"; user: AuthUser };

const toHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

async function sha256(value: string): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

export function randomToken(bytes = 32): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

export function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function unauthorized(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
}

export async function upsertUser(github: GithubUser): Promise<AuthUser> {
  const now = new Date().toISOString();
  const fields = { login: github.login, name: github.name, avatarUrl: github.avatarUrl, updatedAt: now };
  await db
    .insert(users)
    .values({ id: github.id, ...fields, createdAt: now })
    .onConflictDoUpdate({ target: users.id, set: fields });
  return { id: github.id, login: github.login, name: github.name, avatarUrl: github.avatarUrl };
}

export async function createSession(userId: number): Promise<string> {
  const token = randomToken();
  const now = Date.now();
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date(now).toISOString()));
  await db.insert(sessions).values({
    idHash: await sha256(token),
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_MAX_AGE * 1000).toISOString(),
  });
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.idHash, await sha256(token)));
}

async function userForSession(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null;
  const idHash = await sha256(token);
  const [row] = await db
    .select()
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.idHash, idHash))
    .limit(1);
  if (!row) return null;
  if (new Date(row.sessions.expiresAt).getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.idHash, idHash));
    return null;
  }
  const { id, login, name, avatarUrl } = row.users;
  return { id, login, name, avatarUrl };
}

// For server components: the signed-in user from the session cookie, or null
export async function getSessionUser(): Promise<AuthUser | null> {
  // Read cookies outside the try: it throws a control-flow error during static rendering
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  try {
    await initDb();
    return await userForSession(token);
  } catch (error) {
    console.error("Failed to read session:", error);
    return null;
  }
}

// Bearer GitHub token wins; otherwise the session cookie when allowed. Null means unauthenticated.
export async function authenticate(
  request: NextRequest,
  options: { allowSession: boolean }
): Promise<Authenticated | null> {
  await initDb();
  const bearer = (request.headers.get("authorization") || "").match(/^Bearer\s+(\S+)$/i);
  if (bearer) {
    const github = await fetchGithubUser(bearer[1]);
    if (!github) return null;
    // Only tokens issued by this registry's OAuth app; PATs and other apps' tokens are refused
    const clientId = getEnv("GITHUB_CLIENT_ID");
    if (!clientId || github.clientId?.toLowerCase() !== clientId.toLowerCase()) {
      throw new HttpError(401, "This token was not issued by AgentHub login. Run: agenthub login", {
        "WWW-Authenticate": "Bearer",
      });
    }
    return { via: "bearer", user: await upsertUser(github), token: bearer[1] };
  }
  if (!options.allowSession) return null;
  const user = await userForSession(request.cookies.get(SESSION_COOKIE)?.value);
  return user ? { via: "session", user } : null;
}

export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
