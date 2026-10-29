import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, deleteSession, isLocalHost, isSameOrigin } from "@/lib/auth";
import { initDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Any Origin header (including "null" or garbage) must match; browsers omit it only for same-origin GET
  if (request.headers.has("origin") && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await initDb();
    await deleteSession(token);
  }

  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", url.origin), 303);
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: !isLocalHost(url.hostname),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
