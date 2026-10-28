"use client";

import { ShieldCheck, Lock, Terminal, Cpu, CheckCircle2, AlertTriangle } from "lucide-react";
import { Package } from "@/lib/db/schema";

interface SecurityBadgeProps {
  pkg: Package;
}

export function SecurityBadge({ pkg }: SecurityBadgeProps) {
  const maxTokens = 2000;
  const pct = Math.min(Math.round((pkg.tokenFootprint / maxTokens) * 100), 100);
  const isBudgetOk = pkg.tokenFootprint <= maxTokens;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Automated Security & Budget Audit</span>
          </h3>
          <p className="text-[var(--muted-foreground)] text-[11px] mt-0.5">
            Static AST verification & sandboxed dry-run performed before registry indexing
          </p>
        </div>
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audit Status: Passed</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Secret Leakage */}
        <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--muted-foreground)] flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Secret Leakage</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              0 Leaks
            </span>
          </div>
          <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1">
            <span>✓ Clean Manifest</span>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
            Zero embedded tokens, high-entropy secrets, or plaintext credentials detected across markdown AST and scripts.
          </p>
        </div>

        {/* Command Safety */}
        <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--muted-foreground)] flex items-center space-x-1">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Command Safety</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>
          <div className="text-sm font-bold text-indigo-300 flex items-center space-x-1">
            <span>✓ Safe Binaries Only</span>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
            All MCP servers and declared skill scripts use pinned executables. No arbitrary remote shell pipes found.
          </p>
        </div>

        {/* Boot Context Budget */}
        <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--muted-foreground)] flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Boot Context Footprint</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {pct}%
            </span>
          </div>
          <div className={`text-sm font-bold flex items-center space-x-1 ${isBudgetOk ? "text-emerald-400" : "text-amber-400"}`}>
            <span>{pkg.tokenFootprint.toLocaleString()} / {maxTokens.toLocaleString()} tk</span>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
            {isBudgetOk
              ? "Comfortably within the 2,000-token boot context budget. Leaves headroom for large task prompts."
              : "Exceeds standard 2,000-token boot target. Recommended for large-window LLMs only."}
          </p>
        </div>
      </div>

      {/* Safety Policy Checklist */}
      <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)] space-y-3">
        <h4 className="text-xs font-semibold text-slate-200">Pre-Publish Security Matrix</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[var(--muted-foreground)]">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>AST rules compile cleanly to markdown instructions</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Skill definitions conform to Agent Skill spec</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Zero root privilege escalation commands</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Valid open source license detected ({pkg.license})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
