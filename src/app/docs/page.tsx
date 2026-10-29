import Link from "next/link";
import { Terminal, Shield, Layers, Cpu, CheckCircle2, Github } from "lucide-react";
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Unified Configuration & Package Management for AI Agents
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          The <code>agenthub</code> CLI allows engineers to discover, install, inspect, and synchronize rule sets, domain skills, and MCP servers across Google Antigravity, Claude Code, Cursor, Windsurf, and Codex.
        </p>
      </div>

      {/* Quick Start Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-signal" />
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
          <Terminal className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">agenthub profile</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Manage complete agent configurations. A profile sets your baseline rules, agent roles, subagent workflows, and default toolings.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Switch your hub to a profile from the registry</div>
            <InstallPill command="agenthub profile use alice/nextjs-agent" />
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              Downloads the package manifest, compiles rules AST, projects instructions to <code>GEMINI.md</code>, <code>CLAUDE.md</code>, and Cursor rules (<code>agenthub.mdc</code>), and binds MCP servers.
            </p>
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># List installed profiles</div>
            <InstallPill command="agenthub profile list" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Create a local profile, then switch to it</div>
            <InstallPill command="agenthub profile create work" />
            <InstallPill command="agenthub profile use work" />
          </div>
        </div>
      </section>

      {/* COMMAND 2: agenthub add */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Layers className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">agenthub add</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Add modular add-ons (individual rule packs, domain skills, or MCP connectors) into an existing setup without overwriting your baseline configuration.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Install zero-trust security rules</div>
            <InstallPill command="agenthub add security/agent-harden" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Add DuckDB analytics skills and MCP</div>
            <InstallPill command="agenthub add data/duckdb-analytics" />
          </div>
        </div>
      </section>

      {/* COMMAND 3: agenthub info */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Shield className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">agenthub info</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Inspect a package before installing. Runs a static scan and shows the risk level, scan warnings, MCP server commands, scripts, required environment variables and token footprint.
        </p>

        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
          <InstallPill command="agenthub info rust-lang/cargo-agent" />
        </div>
      </section>

      {/* COMMAND 4: sharing your setup */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Cpu className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">Share your setup: agenthub share</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Push your hub to a GitHub repo so your team or your other machines can install it, then optionally publish it to this registry so anyone can find it.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># 1. Create an empty public GitHub repo</div>
            <InstallPill command="gh repo create my-agent-setup --public" />
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              Leave it empty (no README or license), or the first push is rejected. It must be public to be listed in the registry.
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># 2. Connect your hub to it</div>
            <InstallPill command="agenthub git init --remote-url https://github.com/<you>/my-agent-setup.git" />
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              Runs <code>git init</code> in <code>~/.agenthub</code>, sets <code>origin</code>, and writes a <code>.gitignore</code> that keeps <code>backups/</code> and <code>.env</code> files out.
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># 3. Describe your package (optional)</div>
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              Add <code>name</code>, <code>description</code>, <code>type</code> (<code>profile</code> for a whole setup, <code>addon</code> for a few rules or skills), <code>tags</code> and <code>license</code> to <code>~/.agenthub/agenthub.json</code>. Missing fields default to the repo name, <code>profile</code> and <code>MIT</code>. A <code>README.md</code> in the hub becomes your package page.
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># 4. Check what you are about to share</div>
            <InstallPill command="agenthub budget" />
            <InstallPill command="agenthub info ~/.agenthub" />
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              <code>share</code> stops on hard-coded keys in skill or <code>scripts/</code> files and on high-risk scripts or MCP servers. It does not scan <code>rules/</code> or <code>mcp/servers.json</code>, so check those for pasted keys yourself.
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># 5. Push to Git</div>
            <InstallPill command='agenthub share -m "First version of my setup"' />
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              Prints <code>agenthub add &lt;you&gt;/my-agent-setup</code> for your team or other machines. Stop here if you do not want a public listing.
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># 6. Publish to the registry</div>
            <InstallPill command="agenthub login" />
            <InstallPill command="agenthub share --publish" />
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              Publishes as your GitHub account, which needs push access to the repo. Your package appears at <code>/packages/&lt;you&gt;/my-agent-setup</code> and in <code>agenthub search</code>.
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># 7. Update or remove it later</div>
            <InstallPill command='agenthub share --publish -m "Add Go rules"' />
            <InstallPill command="agenthub unpublish <you>/my-agent-setup" />
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              Publishing again refreshes the listing and keeps its stars and installs. <code>unpublish</code> removes the listing only; your Git repo stays. The account that published it, or anyone with push access to the repo, can unpublish.
            </p>
          </div>
        </div>

        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Others install your package with <code>agenthub add &lt;you&gt;/my-agent-setup</code>, or switch to it as a whole profile with <code>agenthub profile use &lt;you&gt;/my-agent-setup</code>. For error messages and fixes, see the 
          <a href="https://github.com/habom2310/agenthub#6-sharing--publishing" className="text-signal-soft hover:text-signal" target="_blank" rel="noopener noreferrer">full sharing guide</a>.
        </p>
      </section>

      {/* COMMAND 5: login, whoami, logout */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Github className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">agenthub login</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Sign in with GitHub before you publish. The CLI shows a one-time code to enter on github.com and asks for no permissions beyond your public profile. You can also sign in on the website from the <Link href="/account" className="text-signal-soft hover:text-signal">account page</Link>.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Sign in with GitHub</div>
            <InstallPill command="agenthub login" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Show which GitHub account you are signed in as</div>
            <InstallPill command="agenthub whoami" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Forget the saved login</div>
            <InstallPill command="agenthub logout" />
          </div>
        </div>
      </section>

      {/* ARCHITECTURE: The AST Rule Compiler */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-[var(--foreground)] flex items-center space-x-2">
          <Layers className="w-4 h-4 text-signal" />
          <span>How AgentHub Projections Work Under the Hood</span>
        </h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Each assistant platform reads rules from distinct locations: Antigravity reads <code>GEMINI.md</code>, Claude Code reads <code>CLAUDE.md</code>, Cursor reads <code>agenthub.mdc</code>, and Codex reads <code>AGENTS.md</code>.
        </p>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Instead of maintaining duplicate Markdown files that drift over time, AgentHub stores rules as an <strong>AST (Abstract Syntax Tree)</strong>. When you install or switch profiles, AgentHub compiles and projects the rules with assistant-specific optimizations, token budgets, and override sections.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
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
            <div className="font-bold text-signal flex items-center space-x-1.5">
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
