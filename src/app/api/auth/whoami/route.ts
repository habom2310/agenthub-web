import { NextRequest, NextResponse } from "next/server";
import { authenticate, unauthorized } from "@/lib/auth";
import { errorResponse } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request, { allowSession: true });
    if (!auth) return unauthorized("Not signed in. Run `agenthub login` or sign in on the website.");
    const { login, id, name, avatarUrl } = auth.user;
    return NextResponse.json({ login, id, name, avatarUrl });
  } catch (error) {
    return errorResponse(error, "Failed to resolve user:", "Failed to verify your GitHub account.");
  }
}
