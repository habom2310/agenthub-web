import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { packages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authenticate, isSameOrigin, unauthorized } from "@/lib/auth";
import { fetchGithubRepo } from "@/lib/github";
import { errorResponse } from "@/lib/http";
import { getPackage } from "@/lib/packages";

type RouteContext = { params: Promise<{ owner: string; repo: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await initDb();
    const { owner, repo } = await params;
    const packageId = `${owner}/${repo}`.toLowerCase();

    const pkg = await getPackage(packageId);

    if (!pkg) {
      return NextResponse.json(
        { error: `Package '${packageId}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error("Failed to fetch package:", error);
    return NextResponse.json(
      { error: "Internal server error fetching package" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const auth = await authenticate(request, { allowSession: true });
    if (!auth) return unauthorized("Unauthorized: sign in to unpublish.");
    if (auth.via === "session" && !isSameOrigin(request)) {
      return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
    }

    const { owner, repo } = await params;
    const packageId = `${owner}/${repo}`.toLowerCase();
    const [pkg] = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);
    if (!pkg) {
      return NextResponse.json({ error: `Package '${packageId}' not found` }, { status: 404 });
    }
    if (pkg.publisherId === null) {
      return NextResponse.json({ error: "Demo packages can't be unpublished." }, { status: 403 });
    }

    const { user } = auth;
    let allowed = pkg.publisherId === user.id;
    if (!allowed && auth.via === "bearer") {
      allowed = (await fetchGithubRepo(auth.token, pkg.owner, pkg.repo))?.canPush === true;
    }
    if (!allowed) {
      return NextResponse.json(
        { error: `You (@${user.login}) can't unpublish ${packageId}.` },
        { status: 403 }
      );
    }

    await db.delete(packages).where(eq(packages.id, packageId));
    return NextResponse.json({ message: `Unpublished ${packageId}` });
  } catch (error) {
    return errorResponse(error, "Failed to unpublish package:", "Internal server error unpublishing package");
  }
}
