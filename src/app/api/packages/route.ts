import { NextRequest, NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { PublicPackage } from "@/lib/db/schema";
import { listPackages } from "@/lib/packages";
import { matchesSearch } from "@/lib/catalog";

export async function GET(request: NextRequest) {
  try {
    await initDb();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();
    const platform = (searchParams.get("platform") || "").toLowerCase().trim();
    const type = (searchParams.get("type") || "").toLowerCase().trim();
    const tag = (searchParams.get("tag") || "").toLowerCase().trim();
    const sort = (searchParams.get("sort") || "recent").toLowerCase().trim();

    let allPackages: PublicPackage[] = await listPackages();

    // Same word-prefix search as the site, so the CLI and the web return the same matches
    if (q) {
      allPackages = allPackages.filter((pkg) => matchesSearch(pkg, q));
    }

    // Filter by platform
    if (platform && platform !== "all") {
      allPackages = allPackages.filter((pkg) =>
        pkg.platforms.map((p) => p.toLowerCase()).includes(platform)
      );
    }

    // Filter by type (profile / addon)
    if (type && type !== "all") {
      allPackages = allPackages.filter((pkg) => pkg.type.toLowerCase() === type);
    }

    // Filter by tag
    if (tag) {
      allPackages = allPackages.filter((pkg) =>
        pkg.tags.map((t) => t.toLowerCase()).includes(tag)
      );
    }

    // Sort
    allPackages.sort((a, b) => {
      if (sort === "installs") {
        return b.installCount - a.installCount;
      } else if (sort === "tokens") {
        return a.tokenFootprint - b.tokenFootprint;
      } else if (sort === "stars") {
        return b.stars - a.stars;
      } else {
        // Default: newest first. Stars and installs are not measured yet, so they are opt-in only.
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return NextResponse.json({
      total: allPackages.length,
      packages: allPackages,
    });
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return NextResponse.json(
      { error: "Internal server error fetching packages" },
      { status: 500 }
    );
  }
}
