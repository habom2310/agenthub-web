import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db, initDb } from "@/lib/db";
import { packages, NewPackage, AstRuleSection } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function timingSafeCompare(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function POST(request: NextRequest) {
  try {
    let serverSecret: string | undefined = process.env.REGISTRY_SECRET || process.env.AGENTHUB_PUBLISH_SECRET;
    try {
      const { env } = getCloudflareContext();
      if (env) {
        const cfSecret = (env as any).REGISTRY_SECRET || (env as any).AGENTHUB_PUBLISH_SECRET;
        if (typeof cfSecret === "string" && cfSecret.trim()) {
          serverSecret = cfSecret;
        }
      }
    } catch {}

    if (serverSecret && serverSecret.trim()) {
      const authHeader = request.headers.get("authorization") || "";
      const match = authHeader.match(/^Bearer\s+(\S+)$/i);
      const token = match ? match[1].trim() : "";
      if (!token || !timingSafeCompare(token, serverSecret.trim())) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or missing publish token." },
          { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
        );
      }
    }

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
      tokenFootprint: explicitTokens,
      securityRisk = "low",
      isClean = true,
    } = body;

    if (!owner || !repo || !name) {
      return NextResponse.json(
        { error: "Missing required fields: owner, repo, and name are required." },
        { status: 400 }
      );
    }

    const packageId = `${owner}/${repo}`.toLowerCase();

    // Calculate token footprint if not explicitly specified
    const computedTokens = (Array.isArray(rulesAst) ? rulesAst : []).reduce(
      (acc: number, rule: AstRuleSection) => acc + (rule.tokens || 100),
      0
    );

    let tokenFootprint: number;
    if (typeof explicitTokens === "number" && !isNaN(explicitTokens) && explicitTokens > 0) {
      tokenFootprint = Math.max(explicitTokens, computedTokens);
    } else if (computedTokens > 0) {
      tokenFootprint = computedTokens;
    } else {
      tokenFootprint = 850;
    }

    const now = new Date().toISOString();

    const risk = typeof securityRisk === "string" ? securityRisk.toLowerCase() : "";
    const normalizedSecurityRisk: "low" | "medium" | "high" =
      risk === "high" || risk === "medium" ? (risk as "high" | "medium") : "low";

    const newPkg: NewPackage = {
      id: packageId,
      owner,
      repo,
      name,
      version,
      description,
      type: type === "addon" ? "addon" : "profile",
      platforms: Array.isArray(platforms) ? platforms : [],
      tags: Array.isArray(tags) ? tags : [],
      license,
      stars: 1,
      installCount: 1,
      tokenFootprint,
      securityRisk: normalizedSecurityRisk,
      isClean: isClean === false || isClean === "false" ? false : Boolean(isClean),
      rulesAst: Array.isArray(rulesAst) ? rulesAst : [],
      skills: Array.isArray(skills) ? skills : [],
      mcpServers: Array.isArray(mcpServers) ? mcpServers : [],
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
