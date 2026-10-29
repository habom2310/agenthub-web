import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { packages, NewPackage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authenticate, unauthorized } from "@/lib/auth";
import { fetchGithubRepo } from "@/lib/github";
import { errorResponse } from "@/lib/http";
import { parseManifest, readJsonBody } from "@/lib/manifest";
import { getPackage } from "@/lib/packages";

const GITHUB_NAME = /^[A-Za-z0-9._-]+$/;

const badRequest = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request, { allowSession: false });
    if (auth?.via !== "bearer") {
      return unauthorized("Unauthorized: sign in with `agenthub login` to publish.");
    }
    const { user, token } = auth;

    const read = await readJsonBody(request);
    if ("error" in read) return badRequest(read.error, read.status);
    const parsed = parseManifest(read.body);
    if ("error" in parsed) return badRequest(parsed.error);
    const m = parsed.manifest;

    if (!GITHUB_NAME.test(m.owner) || !GITHUB_NAME.test(m.repo)) {
      return badRequest("owner and repo must be a valid GitHub owner and repo name.");
    }
    const { owner, repo, name, description } = m;

    const githubRepo = await fetchGithubRepo(token, owner, repo);
    if (!githubRepo) {
      return NextResponse.json(
        { error: `GitHub repo ${owner}/${repo} not found or not public.` },
        { status: 404 }
      );
    }
    if (githubRepo.isPrivate) {
      return NextResponse.json(
        { error: `GitHub repo ${owner}/${repo} must be public so others can install it.` },
        { status: 400 }
      );
    }
    if (!githubRepo.canPush) {
      return NextResponse.json(
        { error: `You (@${user.login}) don't have push access to ${owner}/${repo}.` },
        { status: 403 }
      );
    }

    const packageId = githubRepo.fullName;
    const [canonicalOwner, canonicalRepo] = packageId.split("/");

    const [existing] = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);
    // A name now pointing at a different GitHub repo (renamed, deleted and re-created) is not ours to overwrite
    if (
      existing?.githubRepoId != null &&
      existing.githubRepoId !== githubRepo.id &&
      existing.publisherId !== user.id
    ) {
      return badRequest(
        `${packageId} was published from a different GitHub repo. Its publisher must unpublish it first.`,
        409
      );
    }

    const computedTokens = m.rulesAst.reduce((acc, rule) => acc + rule.tokens, 0);
    const explicitTokens = m.tokenFootprint;
    let tokenFootprint: number;
    if (typeof explicitTokens === "number" && !isNaN(explicitTokens) && explicitTokens > 0) {
      tokenFootprint = Math.max(explicitTokens, computedTokens);
    } else if (computedTokens > 0) {
      tokenFootprint = computedTokens;
    } else {
      tokenFootprint = 850;
    }

    const now = new Date().toISOString();
    const risk = typeof m.securityRisk === "string" ? m.securityRisk.toLowerCase() : "";
    const securityRisk: "low" | "medium" | "high" =
      risk === "high" || risk === "medium" ? risk : "low";

    const newPkg: NewPackage = {
      id: packageId,
      owner: canonicalOwner,
      repo: canonicalRepo,
      name,
      version: m.version,
      description,
      type: m.type,
      platforms: m.platforms,
      tags: m.tags,
      license: m.license,
      stars: 0,
      installCount: 0,
      tokenFootprint,
      securityRisk,
      isClean: m.isClean === false || m.isClean === "false" ? false : Boolean(m.isClean),
      rulesAst: m.rulesAst,
      skills: m.skills,
      mcpServers: m.mcpServers,
      readme: m.readme || `# ${name}\n\n${description}`,
      createdAt: now,
      updatedAt: now,
      // Collaborators re-publishing keep the original publisher; unclaimed (legacy) rows are adopted
      publisherId: existing?.publisherId ?? user.id,
      githubRepoId: githubRepo.id,
    };

    // Upsert keeps concurrent first publishes from failing; stars, installs and creation date stay as first written
    const { id, stars, installCount, createdAt, ...mutable } = newPkg;
    await db.insert(packages).values(newPkg).onConflictDoUpdate({ target: packages.id, set: mutable });

    const saved = await getPackage(packageId);

    return NextResponse.json(
      { message: "Package indexed successfully", package: saved },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, "Failed to index package:", "Failed to index package manifest");
  }
}
