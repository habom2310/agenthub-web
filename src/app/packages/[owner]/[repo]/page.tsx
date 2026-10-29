import { notFound } from "next/navigation";
import { initDb } from "@/lib/db";
import { getPackage } from "@/lib/packages";
import { PackageDetailView } from "@/components/PackageDetailView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ owner: string; repo: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await initDb();
  const { owner, repo } = await params;
  const packageId = `${owner}/${repo}`;

  const pkg = await getPackage(packageId);

  if (!pkg) {
    return {
      title: "Package Not Found | AgentHub",
    };
  }

  return {
    title: `${pkg.name} (${pkg.id}) | AgentHub`,
    description: pkg.description,
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  await initDb();
  const { owner, repo } = await params;
  const packageId = `${owner}/${repo}`;

  const pkg = await getPackage(packageId);

  if (!pkg) {
    notFound();
  }

  return <PackageDetailView pkg={pkg} />;
}
