import Link from "next/link";
import {
  Terminal,
  Shield,
  Layers,
  Cpu,
  CheckCircle2,
  Github,
  Download,
  ListChecks,
  RefreshCw,
  KeyRound,
  FolderInput,
  Stethoscope,
  GitBranch,
  Lock,
} from "lucide-react";
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
          The <code>agenthub</code> CLI allows engineers to discover, install, inspect, and synchronize rule sets, domain skills, and MCP servers across Google Antigravity, Claude Code, Cursor, Windsurf, Codex, GitHub Copilot CLI and Pi.
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
            <InstallPill command="agenthub profile use habom2310/my-agenthub-setting" />
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

      {/* COMMAND: agenthub install */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Download className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">agenthub install</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Install the skills and MCP servers declared in <code>agenthub.json</code>, at the versions pinned in <code>agenthub.lock.json</code>, then link skills and sync MCP configs. It shows the full plan with the exact command for every item and asks one y/N question. Planning runs nothing the hub declares, one failing item does not stop the others, and it never runs <code>sudo</code>.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Plan, confirm once, install everything declared</div>
            <InstallPill command="agenthub install" />
            <InstallPill command="agenthub install --yes" />
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              Without a terminal and without <code>--yes</code>, nothing is installed and the items are reported as pending (exit code 1).
            </p>
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># CI: fail instead of changing the lock file</div>
            <InstallPill command="agenthub install --frozen-lockfile" />
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              A new pin, a hash that would be recorded, a pruned entry or a changed source all count as a change, and nothing is installed. On by default when <code>CI</code> is set; <code>--no-frozen-lockfile</code> turns it off. <code>pull</code> and <code>setup</code> take the same flag.
            </p>
          </div>
        </div>
      </section>

      {/* COMMAND: agenthub check */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <ListChecks className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">agenthub check</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Report what <code>update</code> would change, without installing anything. It resolves the latest pin of every declared source (<code>git ls-remote</code>, <code>npm view</code>, PyPI) and prints each item that is outdated or modified locally. It runs no command the hub declares and skips items you ignore with <code>agenthub ignore</code>.
        </p>

        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2 font-mono">
          <InstallPill command="agenthub check" />
          <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
            Exits 1 if anything is outdated or modified, or if a source cannot be resolved. Exits 0 when everything is current.
          </p>
        </div>
      </section>

      {/* COMMAND: agenthub update */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <RefreshCw className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">agenthub update</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Move lock file pins forward, then install. A new pin drops the old content hash, and the next fetch records the new one. <code>update</code> is never frozen.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Re-resolve every pin</div>
            <InstallPill command="agenthub update" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Re-resolve only the named items</div>
            <InstallPill command="agenthub update review fetch" />
          </div>
        </div>
      </section>

      {/* COMMAND: agenthub approvals */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <KeyRound className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">agenthub approvals</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          List the commands you have approved to run on this machine, or forget all of them. See{" "}
          <a href="#remembered-approvals" className="text-signal-soft hover:text-signal">remembered approvals</a> below.
        </p>

        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2 font-mono">
          <InstallPill command="agenthub approvals" />
          <InstallPill command="agenthub approvals --reset" />
        </div>
      </section>

      {/* COMMAND: agenthub adopt */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <FolderInput className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">agenthub adopt</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Bring skills and MCP servers you already have in your assistants under the hub. It scans each detected assistant&rsquo;s skills folders and MCP configs and works out where each item came from by reading files only, including git checkouts and the <code>npx skills</code> lock file. Nothing from the item is executed.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Show what was found and the proposed sources, change nothing</div>
            <InstallPill command="agenthub adopt --dry-run" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Decide per item: accept, self-built, enter a source, or skip</div>
            <InstallPill command="agenthub adopt" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Accept only sources read from the item itself, skip the rest</div>
            <InstallPill command="agenthub adopt --yes" />
            <p className="font-sans text-xs text-[var(--muted-foreground)] pt-1">
              After declaring items, <code>adopt</code> runs the normal install flow. Files are never deleted: the original of anything moved is kept in <code>backups/adopt-&lt;timestamp&gt;/</code> in the hub.
            </p>
          </div>
        </div>
      </section>

      {/* COMMAND: agenthub doctor */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Stethoscope className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">agenthub doctor</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Check that things work, not only that files exist. It checks links, rules and MCP sync for every detected assistant, starts each MCP server and lists its tools, validates every skill&rsquo;s <code>SKILL.md</code>, and compares declared sources with the lock file and what is installed. Results are <code>[PASS]</code>, <code>[WARN]</code> or <code>[FAIL]</code>, and the exit code is 1 when anything fails.
        </p>

        <div className="space-y-3 font-mono">
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Everything, including the MCP server probes</div>
            <InstallPill command="agenthub doctor" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># File checks only, starts nothing</div>
            <InstallPill command="agenthub doctor --no-functional" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Allow slow npx or uvx cold starts (default 20 seconds per server)</div>
            <InstallPill command="agenthub doctor --timeout 60" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Machine-readable output, same exit code</div>
            <InstallPill command="agenthub doctor --json" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] space-y-2">
            <div className="text-xs font-bold text-signal-soft"># Repair: offer the install flow, then relink and resync</div>
            <InstallPill command="agenthub doctor --fix" />
          </div>
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
              <code>share</code> stops on hard-coded keys in any hub file it pushes, including <code>rules/</code>, <code>agents/</code>, <code>skills/</code>, <code>mcp/servers.json</code>, <code>agenthub.json</code> and <code>README.md</code>, and on high-risk scripts or MCP servers. It only knows common key formats, so keep other secrets in environment variables. Fix what it finds, or pass <code>--force</code> if you are sure it is safe.
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
            <InstallPill command="agenthub whoami" />
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
          Others install your package with <code>agenthub add &lt;you&gt;/my-agent-setup</code>, or switch to it as a whole profile with <code>agenthub profile use &lt;you&gt;/my-agent-setup</code>. For error messages and fixes, see the{" "}
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

      {/* CONCEPT: declared sources */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <GitBranch className="w-4 h-4 text-signal" />
          <h2 className="text-base font-bold text-[var(--foreground)]">Where skills and MCP servers come from</h2>
        </div>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          <code>agenthub.json</code> declares a source for each skill (under <code>skills</code>) and MCP server (under <code>mcp</code>), like a code dependency. <code>agenthub push</code> commits your own work and these declarations, never third-party copies; each machine fetches those with <code>agenthub install</code>. <code>agenthub add owner/repo</code> records what it adds as <code>github:owner/repo#&lt;path&gt;</code>.
        </p>

        <ul className="border border-[var(--border)] rounded-lg bg-[var(--card)] divide-y divide-[var(--border)]">
          {[
            { source: "local", text: <>Your own folder in <code>skills/&lt;name&gt;/</code> or <code>mcp/servers/&lt;name&gt;/</code>, committed to the hub.</> },
            { source: "github:owner/repo#subpath", text: <>Cloned at the locked commit into <code>vendor/</code>. Add a <code>ref</code> (branch, tag or commit) to pin one. <code>git:&lt;url&gt;#subpath</code> works for any git URL.</> },
            { source: "npm:pkg@range", text: <>A skill is unpacked into <code>vendor/</code>; an MCP server runs through <code>npx</code> at the locked version.</> },
            { source: "pypi:pkg@range", text: <>MCP servers only. Runs through <code>uvx</code> at the locked version.</> },
            { source: '{ "check", "install"?, "path"? }', text: <>A custom command. <code>check</code> runs first and <code>install</code> only if <code>check</code> fails. Without <code>install</code>, a failing check is a warning that tells you to install the item yourself.</> },
          ].map((row) => (
            <li key={row.source} className="grid sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] gap-x-4 gap-y-1 px-4 py-3">
              <code className="font-mono text-xs text-signal-soft break-all">{row.source}</code>
              <span className="text-[var(--muted-foreground)] leading-relaxed">{row.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CONCEPTS: lock file, approvals, shared skills folder */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-[var(--foreground)] flex items-center space-x-2">
          <Lock className="w-4 h-4 text-signal" />
          <span>Lock file, approvals and the shared skills folder</span>
        </h2>

        <div className="space-y-3">
          <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-1">
            <h3 className="font-bold text-[var(--foreground)]">Lock file with content hashes</h3>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              <code>agenthub.lock.json</code> pins the commit of every <code>github:</code> and <code>git:</code> source and the exact version of every <code>npm:</code> and <code>pypi:</code> source. Commit it. Vendored skills and local MCP servers with a <code>build</code> also get a SHA-256 hash of their files, the same on Windows, macOS and Linux. <code>install</code> checks a fetched skill against that hash before it replaces anything, and a mismatch fails with &ldquo;content differs from lock&rdquo;. <code>doctor</code> and <code>check</code> report a skill whose files changed as modified locally. With <code>--frozen-lockfile</code>, any change to the lock fails instead.
            </p>
          </div>

          <div id="remembered-approvals" className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-1 scroll-mt-20">
            <h3 className="font-bold text-[var(--foreground)]">Remembered approvals</h3>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              When you approve a plan, each command (a custom <code>check</code>, <code>install</code> or <code>build</code>, a pinned fetch, an MCP probe) is remembered by a hash of its exact text, on this machine only and never in the hub repository. The next plan marks it <code>(approved before)</code> and asks only when a command is new or changed, so a <code>pull</code> that edits a command or moves a pin asks again. A build is also bound to its sources, and a probe to its full config. The contents of a script that a command runs are not covered. <code>--yes</code> approves and records; answering no records nothing.
            </p>
          </div>

          <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-1">
            <h3 className="font-bold text-[var(--foreground)]">
              The shared <code>~/.agents/skills</code> folder
            </h3>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              <code>~/.agents/skills</code> is the cross-agent skills folder that Codex, Pi, Cursor, Windsurf and Copilot CLI read, and where <code>npx skills</code> installs. When Codex or Pi is detected, AgentHub links it to the hub and skips another link for any assistant that already loads the hub skills through it, so no assistant lists a skill twice. Claude Code and Antigravity keep their own. A real <code>~/.agents/skills</code> folder is copied into the hub first and kept as <code>skills.old</code>; run <code>agenthub adopt</code> to record where its skills came from.
            </p>
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
          Each assistant platform reads rules from distinct locations: Antigravity reads <code>GEMINI.md</code>, Claude Code reads <code>CLAUDE.md</code>, Cursor reads <code>agenthub.mdc</code>, Windsurf reads <code>global_rules.md</code>, and Codex and Pi read <code>AGENTS.md</code>. GitHub Copilot CLI gets skills and MCP servers only.
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
