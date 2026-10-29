import { Terminal, Shield, Sparkles, Layers, BookOpen, Cpu, CheckCircle2 } from "lucide-react";
import { InstallPill } from "@/components/InstallPill";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLI Documentation | AgentHub",
  description: "Learn how to use the AgentHub CLI to discover, install, audit, and project AI agent configurations.",
};

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 text-xs">
      {/* Docs Header */}
      <div className="border-b border-[var(--border)] pb-6 space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
          <BookOpen className="w-3.5 h-3.5" />
          <span>AgentHub CLI Reference & Architecture Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Unified Configuration & Package Management for AI Agents
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          The <code>agenthub</code> CLI allows engineers to discover, install, inspect, and synchronize rule sets, domain skills, and MCP servers across Google Antigravity, Claude Code, Cursor, Windsurf, and Codex.
        </p>
      </div>

      {/* Quick Start Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Quick Start: Instant CLI Usage</span>
        </h2>
        <p className="text-[var(--muted-foreground)]">
          Run directly with <code>npx</code> without a global installation, or install globally via npm:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InstallPill command="npm install -g @habom2310/agenthub" />
          <InstallPill command="npx @habom2310/agenthub setup" />
        </div>
      </div>

      {/* COMMAND 1: agenthub profile */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">agenthub profile</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Manage complete, turnkey agent configurations. A profile sets your baseline rules, agent roles, subagent workflows, and default toolings.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-indigo-300"># Apply a turnkey profile to the current repository</div>
            <InstallPill command="agenthub profile use alice/nextjs-agent" />
            <p className="font-sans text-[11px] text-[var(--muted-foreground)] pt-1">
              Downloads the package manifest, compiles rules AST, projects instructions to <code>GEMINI.md</code>, <code>CLAUDE.md</code>, and Cursor rules (<code>agenthub.mdc</code>), and binds MCP servers.
            </p>
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-indigo-300"># List installed profiles</div>
            <InstallPill command="agenthub profile list" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-indigo-300"># Create a local profile, then switch to it</div>
            <InstallPill command="agenthub profile create work" />
            <InstallPill command="agenthub profile use work" />
          </div>
        </div>
      </section>

      {/* COMMAND 2: agenthub add */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">agenthub add</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Add modular add-ons (individual rule packs, domain skills, or MCP connectors) into an existing setup without overwriting your baseline configuration.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-indigo-300"># Install zero-trust security rules</div>
            <InstallPill command="agenthub add security/agent-harden" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-indigo-300"># Add DuckDB analytics skills and MCP</div>
            <InstallPill command="agenthub add data/duckdb-analytics" />
          </div>
        </div>
      </section>

      {/* COMMAND 3: agenthub info */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">agenthub info</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Inspect a package before installing. Runs a static scan and shows the risk level, scan warnings, MCP server commands, scripts, required environment variables and token footprint.
        </p>

        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
          <InstallPill command="agenthub info rust-lang/cargo-agent" />
        </div>
      </section>

      {/* COMMAND 4: agenthub share / publish */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">agenthub share</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Share your custom agent configurations with your team or publish open-source setups to the public AgentHub registry.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-indigo-300"># Push your hub config to its Git remote</div>
            <InstallPill command='agenthub share -m "Update team engineering rules"' />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-indigo-300"># Push and publish your setup to the registry</div>
            <InstallPill command="agenthub share --publish" />
          </div>
        </div>
      </section>

      {/* ARCHITECTURE: The AST Rule Compiler */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>How AgentHub Projections Work Under the Hood</span>
        </h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Each assistant platform reads rules from distinct locations: Antigravity reads <code>GEMINI.md</code>, Claude Code reads <code>CLAUDE.md</code>, Cursor reads <code>agenthub.mdc</code>, and Codex reads <code>AGENTS.md</code>.
        </p>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Instead of maintaining duplicate Markdown files that drift over time, AgentHub stores rules as an <strong>AST (Abstract Syntax Tree)</strong>. When you install or switch profiles, AgentHub compiles and projects the rules with assistant-specific optimizations, token budgets, and override sections.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
          <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-1">
            <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero Context Drift</span>
            </div>
            <p className="text-[var(--muted-foreground)]">
              All assistant instructions remain 100% in sync across your entire team.
            </p>
          </div>
          <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-1">
            <div className="font-bold text-indigo-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Token Budget Gating</span>
            </div>
            <p className="text-[var(--muted-foreground)]">
              Never blow your LLM prompt context window with unbounded instruction boilerplate.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
