"use client";

import Link from "next/link";
import { Star, Download, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Package } from "@/lib/db/schema";
import { InstallPill } from "./InstallPill";
import { getScanStatus } from "./SecurityBadge";

interface PackageCardProps {
  pkg: Package;
}

export function PackageCard({ pkg }: PackageCardProps) {
  const isProfile = pkg.type === "profile";
  const installCmd = isProfile
    ? `agenthub profile use ${pkg.id}`
    : `agenthub add ${pkg.id}`;

  const scanStatus = getScanStatus(pkg);
  const initial = pkg.owner.charAt(0).toUpperCase();
  const maxBudget = 2000;
  const tokenPct = Math.min(Math.round((pkg.tokenFootprint / maxBudget) * 100), 100);

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "gemini":
        return "Antigravity";
      case "claude":
        return "Claude";
      case "cursor":
        return "Cursor";
      case "codex":
        return "Codex";
      case "windsurf":
        return "Windsurf";
      default:
        return platform;
    }
  };

  return (
    <div className="group relative bg-[var(--card)] border border-[var(--border)] hover:border-indigo-500/50 rounded-xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header: Author & Repo */}
        <div className="flex items-start justify-between">
          <Link href={`/packages/${pkg.owner}/${pkg.repo}`} className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-sm">
              {initial}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors flex items-center space-x-1.5">
                <span>{pkg.id}</span>
                {pkg.isClean && pkg.securityRisk === "low" && (
                  <span title="Publish-time scan found no issues">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                {pkg.name} • v{pkg.version}
              </p>
            </div>
          </Link>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap flex-shrink-0 ${
              isProfile
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {isProfile ? "Profile" : "Add-on"}
          </span>
        </div>

        {/* Description */}
        <Link href={`/packages/${pkg.owner}/${pkg.repo}`}>
          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 hover:text-slate-300 transition-colors">
            {pkg.description}
          </p>
        </Link>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {pkg.rulesAst.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]">
              {pkg.rulesAst.length} Rules
            </span>
          )}
          {pkg.skills.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]">
              {pkg.skills.length} Skills
            </span>
          )}
          {pkg.mcpServers.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]">
              {pkg.mcpServers.length} MCP ({pkg.mcpServers[0].name})
            </span>
          )}
          <span className={`px-2 py-0.5 rounded border text-[10px] font-medium flex items-center space-x-1 ${scanStatus.pill}`}>
            <ShieldCheck className="w-3 h-3" />
            <span>{scanStatus.label}</span>
          </span>
        </div>

        {/* Token Budget Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-[var(--muted-foreground)]">Boot Context Token Budget</span>
            <span className="font-mono text-emerald-400 font-medium">
              {pkg.tokenFootprint.toLocaleString()} / {maxBudget.toLocaleString()} tk ({tokenPct}%)
            </span>
          </div>
          <div className="w-full bg-[var(--background)] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${
                tokenPct > 80 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${tokenPct}%` }}
            />
          </div>
        </div>

        {/* Quick Install Pill */}
        <div className="pt-1">
          <InstallPill command={installCmd} showIcon={false} />
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1" title="Stars">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>{pkg.stars}</span>
          </span>
          <span className="flex items-center space-x-1" title="Installs">
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>{pkg.installCount}</span>
          </span>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-indigo-400 truncate max-w-[180px]">
          {pkg.platforms.map((p, idx) => (
            <span key={p} className="truncate">
              {getPlatformLabel(p)}
              {idx < pkg.platforms.length - 1 ? " • " : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
