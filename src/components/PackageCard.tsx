"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PublicPackage } from "@/lib/db/schema";
import { InstallPill } from "./InstallPill";
import { getScanStatus } from "./SecurityBadge";
import { assistantLabel } from "@/lib/catalog";

interface PackageCardProps {
  pkg: PublicPackage;
}

const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`;

export function PackageCard({ pkg }: PackageCardProps) {
  const isProfile = pkg.type === "profile";
  const installCmd = isProfile
    ? `agenthub profile use ${pkg.id}`
    : `agenthub add ${pkg.id}`;

  const scanStatus = getScanStatus(pkg);
  const initial = pkg.owner.charAt(0).toUpperCase();

  return (
    <div className="relative bg-[var(--card)] border border-[var(--border)] hover:border-signal/50 has-[h3_a:focus-visible]:border-[var(--ring)] rounded-xl p-5 transition-colors flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header: Author & Repo */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div aria-hidden className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center font-mono font-semibold text-[var(--muted-foreground)] text-sm flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                {/* The title link stretches over the whole card; the install pill sits above it */}
                <Link href={`/packages/${pkg.owner}/${pkg.repo}`} className="after:absolute after:inset-0 after:rounded-xl">
                  {pkg.id}
                </Link>
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] text-pretty">
                {pkg.name} • v{pkg.version}
              </p>
            </div>
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)]"
          >
            {isProfile ? "Profile" : "Add-on"}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{pkg.description}</p>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {pkg.rulesAst.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]">
              {plural(pkg.rulesAst.length, "Rule")}
            </span>
          )}
          {pkg.skills.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]">
              {plural(pkg.skills.length, "Skill")}
            </span>
          )}
          {pkg.mcpServers.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]">
              {pkg.mcpServers.length} MCP ({pkg.mcpServers[0].name})
            </span>
          )}
          <span className={`px-2 py-0.5 rounded border text-xs font-medium flex items-center space-x-1 ${scanStatus.pill}`}>
            <ShieldCheck className="w-3 h-3" />
            <span>{scanStatus.label}</span>
          </span>
        </div>

        {/* Startup context */}
        <div className="flex flex-wrap justify-between gap-x-3 pt-1 text-xs">
          <span className="text-[var(--muted-foreground)] whitespace-nowrap">Context added at startup</span>
          <span className="font-mono font-medium text-[var(--foreground)] whitespace-nowrap">
            {pkg.tokenFootprint.toLocaleString()} tokens
          </span>
        </div>

        {/* Quick Install Pill */}
        <div className="pt-1 relative z-10">
          <InstallPill command={installCmd} showIcon={false} />
        </div>
      </div>

      {/* Card Footer */}
      <p className="pt-3 mt-3 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
        Works with {pkg.platforms.map(assistantLabel).join(", ")}
      </p>
    </div>
  );
}
