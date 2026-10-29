import { NextResponse } from "next/server";
import { getEnv } from "@/lib/github";

export async function GET() {
  const githubClientId = getEnv("GITHUB_CLIENT_ID");
  if (!githubClientId) {
    return NextResponse.json({ error: "GitHub login is not configured on this registry." }, { status: 503 });
  }
  return NextResponse.json({ githubClientId });
}
