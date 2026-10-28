import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { packages, NewPackage, AstRuleSection } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();

    const {
      owner,
      repo,
      name,
      version = "1.0.0",
      description = "",
      type = "profile",
      platforms = ["gemini", "claude", "cursor"],
      tags = [],
      license = "MIT",
      rulesAst = [],
      skills = [],
      mcpServers = [],
      readme = "",
    } = body;

    if (!owner || !repo || !name) {
      return NextResponse.json(
        { error: "Missing required fields: owner, repo, and name are required." },
        { status: 400 }
      );
    }

    const packageId = `${owner}/${repo}`.toLowerCase();

    // Calculate token footprint if not explicitly specified
    const computedTokens = rulesAst.reduce(
      (acc: number, rule: AstRuleSection) => acc + (rule.tokens || 100),
      0
    );

    const now = new Date().toISOString();

    const newPkg: NewPackage = {
      id: packageId,
      owner,
      repo,
      name,
      version,
      description,
      type: type === "addon" ? "addon" : "profile",
      platforms,
      tags,
      license,
      stars: 1,
      installCount: 1,
      tokenFootprint: computedTokens > 0 ? computedTokens : 850,
      securityRisk: "low",
      isClean: true,
      rulesAst,
      skills,
      mcpServers,
      readme: readme || `# ${name}\n\n${description}`,
      createdAt: now,
      updatedAt: now,
    };

    // Check if exists
    const [existing] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, packageId))
      .limit(1);

    if (existing) {
      await db
        .update(packages)
        .set({
          ...newPkg,
          stars: existing.stars,
          installCount: existing.installCount,
          createdAt: existing.createdAt,
          updatedAt: now,
        })
        .where(eq(packages.id, packageId));
    } else {
      await db.insert(packages).values(newPkg);
    }

    const [saved] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, packageId))
      .limit(1);

    return NextResponse.json(
      { message: "Package indexed successfully", package: saved },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to index package:", error);
    return NextResponse.json(
      { error: "Failed to parse or index package manifest" },
      { status: 500 }
    );
  }
}
