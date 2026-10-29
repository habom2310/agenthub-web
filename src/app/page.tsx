import { Suspense } from "react";
import { initDb } from "@/lib/db";
import { listPackages } from "@/lib/packages";
import { CatalogExplorer } from "@/components/CatalogExplorer";
import { ProjectionHero } from "@/components/ProjectionHero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await initDb();
  const allPackages = await listPackages();

  return (
    <>
      <ProjectionHero />
      <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--muted-foreground)]">Loading AgentHub Registry...</div>}>
        <CatalogExplorer initialPackages={allPackages} />
      </Suspense>
    </>
  );
}
