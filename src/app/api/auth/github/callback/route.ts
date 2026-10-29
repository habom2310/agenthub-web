import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSession, isLocalHost, upsertUser } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { exchangeCodeForToken, fetchGithubUser } from "@/lib/github";
import { STATE_COOKIE, STATE_COOKIE_PATH, decodeState } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const secure = !isLocalHost(url.hostname);

  const finish = (path: string, sessionToken?: string) => {
    const response = NextResponse.redirect(new URL(path, url.origin));
    response.cookies.set(STATE_COOKIE, "", { httpOnly: true, secure, sameSite: "lax", path: STATE_COOKIE_PATH, maxAge: 0 });
    if (sessionToken) {
      response.cookies.set(SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });
    }
    return response;
  };
  const fail = (code: string) => finish(`/account?error=${code}`);

  try {
    if (url.searchParams.get("error")) {
      return fail("oauth_denied");
    }

    const saved = decodeState(request.cookies.get(STATE_COOKIE)?.value);
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");
    if (!saved || !state || saved.state !== state) {
      return fail("state_mismatch");
    }
    if (!code) return fail("oauth_failed");

    const accessToken = await exchangeCodeForToken(code, `${url.origin}/api/auth/github/callback`);
    if (!accessToken) return fail("oauth_failed");

    const github = await fetchGithubUser(accessToken);
    if (!github) return fail("oauth_failed");

    await initDb();
    const user = await upsertUser(github);
    // The GitHub token is dropped here; only our own session survives
    return finish(saved.returnTo, await createSession(user.id));
  } catch (error) {
    console.error("GitHub sign-in failed:", error);
    return fail("oauth_failed");
  }
}
