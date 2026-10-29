"use client";

import { ShieldCheck, ShieldAlert, Server, Cpu, Terminal } from "lucide-react";
import { Package } from "@/lib/db/schema";
import { InstallPill } from "@/components/InstallPill";

interface SecurityBadgeProps {
  pkg: Package;
}

type Tone = "ok" | "warn" | "danger";

const toneClasses: Record<Tone, { text: string; pill: string }> = {
  ok: { text: "text-emerald-400", pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  warn: { text: "text-amber-400", pill: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  danger: { text: "text-red-400", pill: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function getScanStatus(pkg: Pick<Package, "securityRisk" | "isClean">) {
  let label: string;
  let tone: Tone;
  if (pkg.securityRisk === "high") {
    label = "High risk";
    tone = "danger";
  } else if (pkg.securityRisk === "medium") {
    label = "Medium risk";
    tone = "warn";
  } else if (!pkg.isClean) {
    label = "Warnings";
    tone = "warn";
  } else {
    label = "Clean";
    tone = "ok";
  }
  return { label, tone, ...toneClasses[tone] };
}

const riskTone: Record<string, Tone> = { low: "ok", medium: "warn", high: "danger" };

export function SecurityBadge({ pkg }: SecurityBadgeProps) {
  const maxTokens = 2000;
  const pct = Math.min(Math.round((pkg.tokenFootprint / maxTokens) * 100), 100);
  const isBudgetOk = pkg.tokenFootprint <= maxTokens;
  const budgetTone = toneClasses[isBudgetOk ? "ok" : "warn"];
  const status = getScanStatus(pkg);
  const riskyServers = pkg.mcpServers.filter((s) => s.risk !== "low");
  const StatusIcon = status.tone === "ok" ? ShieldCheck : ShieldAlert;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center space-x-2">
            <StatusIcon className={`w-4 h-4 ${status.text}`} />
            <span>Publish-Time Security Scan</span>
          </h3>
          <p className="text-[var(--muted-foreground)] text-xs mt-0.5">
            Static scan run by the AgentHub CLI when this package was published. The registry stores the result and does not re-run it.
          </p>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1.5 ${status.pill}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{status.label}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Risk */}
        <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)] space-y-2">
          <span className="text-xs text-[var(--muted-foreground)] flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-signal" />
            <span>Overall Risk</span>
          </span>
          <div className={`text-sm font-bold capitalize ${status.text}`}>{pkg.securityRisk}</div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {pkg.isClean
              ? "The scan reported no warnings for MCP commands, scripts or embedded secrets."
              : "The scan reported warnings. Run the command below to see them before installing."}
          </p>
        </div>

        {/* MCP Servers */}
        <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)] space-y-2">
          <span className="text-xs text-[var(--muted-foreground)] flex items-center space-x-1">
            <Server className="w-3.5 h-3.5 text-signal" />
            <span>MCP Servers</span>
          </span>
          <div className="text-sm font-bold text-[var(--foreground)]">
            {pkg.mcpServers.length === 0 ? "None" : `${pkg.mcpServers.length} declared`}
          </div>
          {riskyServers.length > 0 ? (
            <ul className="space-y-1 text-xs">
              {riskyServers.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-2">
                  <span className="font-mono truncate">{s.name}</span>
                  <span className={`capitalize ${toneClasses[riskTone[s.risk] ?? "warn"].text}`}>{s.risk} risk</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {pkg.mcpServers.length === 0 ? "This package starts no MCP servers." : "All declared servers were rated low risk."}
            </p>
          )}
        </div>

        {/* Boot Context Budget */}
        <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)] flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-signal" />
              <span>Context Added at Startup</span>
            </span>
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${budgetTone.pill}`}>
              {pct}%
            </span>
          </div>
          <div className={`text-sm font-bold ${budgetTone.text}`}>
            {pkg.tokenFootprint.toLocaleString()} of {maxTokens.toLocaleString()} tokens
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {isBudgetOk
              ? "Within the 2,000-token boot context budget. Leaves headroom for large task prompts."
              : "Exceeds the 2,000-token boot target. Recommended for large-window LLMs only."}
          </p>
        </div>
      </div>

      {/* Re-run locally */}
      <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)] space-y-2">
        <h4 className="text-xs font-semibold text-[var(--foreground)] flex items-center space-x-1.5">
          <Terminal className="w-3.5 h-3.5 text-signal" />
          <span>Re-run the scan yourself before installing</span>
        </h4>
        <p className="text-xs text-[var(--muted-foreground)]">
          Shows the full warning list, MCP commands, scripts and required environment variables.
        </p>
        <InstallPill command={`agenthub info ${pkg.id}`} />
      </div>
    </div>
  );
}
