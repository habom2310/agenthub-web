import { NextRequest, NextResponse } from "next/server";
import { randomToken, isLocalHost } from "@/lib/auth";
import { getEnv } from "@/lib/github";
import { STATE_COOKIE, STATE_COOKIE_PATH, encodeState, sanitizeReturnTo } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const clientId = getEnv("GITHUB_CLIENT_ID");
  if (!clientId) {
    return NextResponse.redirect(new URL("/account?error=not_configured", url.origin));
  }

  const state = randomToken(16);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", `${url.origin}/api/auth/github/callback`);
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, encodeState(state, sanitizeReturnTo(url.searchParams.get("returnTo"))), {
    httpOnly: true,
    secure: !isLocalHost(url.hostname),
    sameSite: "lax",
    path: STATE_COOKIE_PATH,
    maxAge: 600,
  });
  return response;
}
