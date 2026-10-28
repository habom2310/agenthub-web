import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { packages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    await initDb();
    const { owner, repo } = await params;
    const packageId = `${owner}/${repo}`;

    const [pkg] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, packageId))
      .limit(1);

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
