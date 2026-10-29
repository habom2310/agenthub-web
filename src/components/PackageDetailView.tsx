"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicPackage } from "@/lib/db/schema";
import { AstRuleViewer } from "./AstRuleViewer";
import { McpVisualizer } from "./McpVisualizer";
import { SecurityBadge, getScanStatus } from "./SecurityBadge";
import { InstallPill } from "./InstallPill";
import { assistantLabel } from "@/lib/catalog";
import { isDemoPackage } from "@/lib/demo";
import {
  ExternalLink,
  BookOpen,
  Layers,
  Zap,
  Server,
  ShieldCheck,
  FileJson,
  CheckCircle2,
  Terminal,
  Code2,
} from "lucide-react";

interface PackageDetailViewProps {
  pkg: PublicPackage;
}

const TABS = ["overview", "rules", "skills", "mcp", "security", "manifest"] as const;
type TabType = (typeof TABS)[number];

export function PackageDetailView({ pkg }: PackageDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Arrow, Home and End keys move between tabs, per the WAI-ARIA tabs pattern
  const handleTabKeys = (e: React.KeyboardEvent) => {
    const current = TABS.indexOf(activeTab);
    const index = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: TABS.length - 1 }[e.key];
    if (index === undefined) return;
    e.preventDefault();
    const next = TABS[(index + TABS.length) % TABS.length];
    setActiveTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  const scanStatus = getScanStatus(pkg);
  const countBadge = (n: number) => <span className="bg-[var(--accent)] px-1.5 py-0.5 rounded text-xs">{n}</span>;
  const tabs: { id: TabType; label: string; Icon: typeof BookOpen; badge?: React.ReactNode }[] = [
    { id: "overview", label: "Overview & README", Icon: BookOpen },
    { id: "rules", label: "Rules", Icon: Layers, badge: countBadge(pkg.rulesAst.length) },
    { id: "skills", label: "Skills", Icon: Zap, badge: countBadge(pkg.skills.length) },
    { id: "mcp", label: "MCP Connectors", Icon: Server, badge: countBadge(pkg.mcpServers.length) },
    {
      id: "security",
      label: "Security Scan",
      Icon: ShieldCheck,
      badge: <span className={`font-bold text-xs ${scanStatus.text}`}>{scanStatus.label}</span>,
    },
    { id: "manifest", label: "agenthub.json", Icon: FileJson },
  ];

  const isProfile = pkg.type === "profile";
  const installCmd = isProfile
    ? `agenthub profile use ${pkg.id}`
    : `agenthub add ${pkg.id}`;

  // Construct standard agenthub.json manifest
  const manifestObject = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    type: pkg.type,
    author: `@${pkg.owner}`,
    license: pkg.license,
    compatibility: pkg.platforms,
    keywords: pkg.tags,
    tokenFootprint: pkg.tokenFootprint,
    rules: pkg.rulesAst.map((r) => ({
      title: r.title,
      file: r.file,
      tokens: r.tokens,
    })),
    skills: pkg.skills.map((s) => ({
      name: s.name,
      description: s.description,
      entry: s.entryScript,
      tools: s.tools,
    })),
    mcpServers: pkg.mcpServers.map((m) => ({
      name: m.name,
      command: m.command,
      args: m.args,
      env: m.env,
    })),
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Repo Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/#registry" className="hover:underline underline-offset-4">
              Registry
            </Link>
            <span>/</span>
            <span className="text-[var(--foreground)] font-semibold">{pkg.owner}</span>
            <span>/</span>
            <span className="text-[var(--foreground)] font-bold text-lg">{pkg.repo}</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)]"
            >
              {isProfile ? "Profile" : "Add-on"}
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-1.5 max-w-3xl text-pretty">
            {pkg.description}
          </p>
          {pkg.publisher && (
            <p className="text-xs text-[var(--muted-foreground)] mt-2 flex items-center gap-1.5">
              <span>Published by</span>
              {pkg.publisher.avatarUrl && (
                <img src={pkg.publisher.avatarUrl} alt="" width={16} height={16} className="w-4 h-4 rounded-full" />
              )}
              <a
                href={`https://github.com/${pkg.publisher.login}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[var(--foreground)] hover:text-signal"
              >
                @{pkg.publisher.login}
              </a>
            </p>
          )}
          {isDemoPackage(pkg.id) && (
            <p className="text-xs text-[var(--muted-foreground)] mt-2">Example package. It shows what a published package looks like.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <a
            href={`https://github.com/${pkg.owner}/${pkg.repo}`}
            target="_blank"
            rel="noreferrer"
            className="bg-[var(--card)] border border-[var(--border)] px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-[var(--muted-foreground)]" />
          </a>
        </div>
      </div>

      {/* Quick Install Banner */}
      <div className="bg-[var(--card)] border border-signal/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-signal/10 text-signal flex-shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--foreground)]">
              Install this setup
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Adds its rules, skills and MCP servers to your hub, then writes them to each assistant you use.
            </div>
          </div>
        </div>
        <div className="min-w-[300px]">
          <InstallPill command={installCmd} />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        role="tablist"
        aria-label="Package details"
        onKeyDown={handleTabKeys}
        className="border-b border-[var(--border)] flex items-center space-x-2 sm:space-x-6 text-xs font-medium overflow-x-auto pb-0"
      >
        {tabs.map(({ id, label, Icon, badge }) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls="tab-panel"
            tabIndex={activeTab === id ? 0 : -1}
            onClick={() => setActiveTab(id)}
            className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === id
                ? "tab-active font-semibold"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden />
            <span>{label}</span>
            {badge}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div role="tabpanel" id="tab-panel" aria-labelledby={`tab-${activeTab}`}>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main README */}
            <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4 text-xs">
              <div className="prose prose-invert max-w-none text-[var(--foreground)] space-y-4 font-sans">
                <h2 className="text-base font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2 flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-signal" />
                  <span>{pkg.name}</span>
                </h2>

                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  {pkg.description}
                </p>

                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border)] space-y-2">
                  <h3 className="text-xs font-bold text-[var(--foreground)]">Rules included</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
                    {pkg.rulesAst.map((r, i) => (
                      <li key={i}>
                        <strong className="text-[var(--foreground)]">{r.title}</strong>
                        <span className="text-signal font-mono ml-1.5">({r.tokens} tokens)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {pkg.readme && (
                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-[var(--foreground)] mb-2">Package Documentation</h3>
                    <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border)] text-[var(--foreground)] font-mono text-xs whitespace-pre-wrap leading-relaxed">
                      {pkg.readme}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-4">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4 text-xs">
                <h4 className="font-bold text-[var(--foreground)]">Details</h4>
                <div className="space-y-2.5 text-[var(--muted-foreground)]">
                  <div className="flex justify-between">
                    <span>Author</span>
                    <span className="text-[var(--foreground)] font-medium">@{pkg.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>License</span>
                    <span className="text-[var(--foreground)] font-medium">{pkg.license}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="text-[var(--foreground)] font-medium">v{pkg.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type</span>
                    <span className="text-[var(--foreground)] font-medium">{isProfile ? "Profile" : "Add-on"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Context at startup</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      {pkg.tokenFootprint.toLocaleString()} tokens
                    </span>
                  </div>
                </div>

                {/* Supported Assistant Engines */}
                <div className="pt-3 border-t border-[var(--border)]">
                  <h5 className="text-xs font-semibold text-[var(--foreground)] mb-2">
                    Works with
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.platforms.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded border text-xs font-medium bg-[var(--background)] text-[var(--foreground)] border-[var(--border)]"
                      >
                        {assistantLabel(p)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {pkg.tags.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border)]">
                    <h5 className="text-xs font-semibold text-[var(--foreground)] mb-2">Tags</h5>
                    <div className="flex flex-wrap gap-1">
                      {pkg.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--muted-foreground)]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RULES */}
        {activeTab === "rules" && <AstRuleViewer rules={pkg.rulesAst} />}

        {/* TAB 3: SKILLS */}
        {activeTab === "skills" && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center space-x-2">
                <Zap className="w-4 h-4 text-signal" />
                <span>Declared Assistant Skills</span>
              </h3>
              <p className="text-[var(--muted-foreground)] text-xs mt-0.5">
                Self-contained executable skills mounted directly into the AI toolchain
              </p>
            </div>

            {pkg.skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pkg.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="border border-[var(--border)] rounded-xl p-4 bg-[var(--background)] space-y-2.5 hover:border-signal/40 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-signal-soft font-mono">
                        {skill.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[var(--accent)] text-xs text-signal-soft border border-signal/20 font-mono">
                        SKILL.md
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {skill.description}
                    </p>
                    {skill.entryScript && (
                      <div className="flex items-center space-x-1.5 text-xs text-signal font-mono pt-1">
                        <Terminal className="w-3 h-3 text-[var(--muted-foreground)]" />
                        <span>{skill.entryScript}</span>
                      </div>
                    )}
                    {skill.tools && skill.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {skill.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-1.5 py-0.5 rounded bg-[var(--secondary)] text-xs font-mono text-[var(--foreground)]"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-[var(--muted-foreground)]">
                No custom skills packaged in this setup.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MCP CONNECTORS */}
        {activeTab === "mcp" && <McpVisualizer servers={pkg.mcpServers} />}

        {/* TAB 5: SECURITY SCAN */}
        {activeTab === "security" && <SecurityBadge pkg={pkg} />}

        {/* TAB 6: MANIFEST JSON */}
        {activeTab === "manifest" && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center space-x-2">
                  <FileJson className="w-4 h-4 text-signal" />
                  <span>agenthub.json Manifest</span>
                </h3>
                <p className="text-[var(--muted-foreground)] text-xs mt-0.5">
                  Registry record for this package, as sent by the publisher
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                Schema: v1.0
              </span>
            </div>

            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border)] overflow-x-auto">
              <pre className="font-mono text-xs text-signal-soft leading-relaxed">
                {JSON.stringify(manifestObject, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
