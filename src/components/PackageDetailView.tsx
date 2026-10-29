"use client";

import { useState } from "react";
import Link from "next/link";
import { Package } from "@/lib/db/schema";
import { AstRuleViewer } from "./AstRuleViewer";
import { McpVisualizer } from "./McpVisualizer";
import { SecurityBadge, getScanStatus } from "./SecurityBadge";
import { InstallPill } from "./InstallPill";
import {
  Star,
  GitFork,
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
  pkg: Package;
}

type TabType = "overview" | "rules" | "skills" | "mcp" | "security" | "manifest";

export function PackageDetailView({ pkg }: PackageDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stars, setStars] = useState(pkg.stars);
  const [hasStarred, setHasStarred] = useState(false);

  const isProfile = pkg.type === "profile";
  const installCmd = isProfile
    ? `agenthub profile use ${pkg.id}`
    : `agenthub add ${pkg.id}`;

  const handleStarClick = () => {
    if (hasStarred) {
      setStars((s) => s - 1);
      setHasStarred(false);
    } else {
      setStars((s) => s + 1);
      setHasStarred(true);
    }
  };

  const getEngineColor = (p: string) => {
    switch (p.toLowerCase()) {
      case "gemini":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "claude":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "cursor":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "codex":
        return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      case "windsurf":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const getEngineLabel = (p: string) => {
    switch (p.toLowerCase()) {
      case "gemini":
        return "Google Antigravity";
      case "claude":
        return "Claude Code";
      case "cursor":
        return "Cursor";
      case "codex":
        return "Codex CLI";
      case "windsurf":
        return "Windsurf";
      default:
        return p;
    }
  };

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
            <Link href="/" className="hover:underline">
              catalog
            </Link>
            <span>/</span>
            <span className="text-[var(--foreground)] font-semibold">{pkg.owner}</span>
            <span>/</span>
            <span className="text-[var(--foreground)] font-bold text-lg">{pkg.repo}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                isProfile
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              {isProfile ? "Turnkey Profile" : "Modular Add-on"}
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-1.5 max-w-3xl">
            {pkg.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={handleStarClick}
            className={`border px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-colors ${
              hasStarred
                ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                : "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                hasStarred ? "text-amber-400 fill-amber-400" : "text-amber-400 fill-current"
              }`}
            />
            <span>{hasStarred ? "Starred" : "Star"}</span>
            <span className="bg-[var(--background)] px-1.5 py-0.5 rounded text-[10px] font-mono">
              {stars}
            </span>
          </button>

          <div className="bg-[var(--card)] border border-[var(--border)] px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 text-[var(--muted-foreground)]">
            <GitFork className="w-3.5 h-3.5" />
            <span>Installs</span>
            <span className="bg-[var(--background)] px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">
              {pkg.installCount}
            </span>
          </div>

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
      <div className="bg-[var(--card)] border border-indigo-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--foreground)]">
              Install this setup into your local assistants:
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)]">
              Automatically compiles rules AST and links skills into ~/.gemini, ~/.claude, and Cursor
            </div>
          </div>
        </div>
        <div className="min-w-[300px]">
          <InstallPill command={installCmd} />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[var(--border)] flex items-center space-x-2 sm:space-x-6 text-xs font-medium overflow-x-auto pb-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "tab-active font-semibold"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Overview & README</span>
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === "rules"
              ? "tab-active font-semibold"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Rules AST</span>
          <span className="bg-[var(--accent)] px-1.5 py-0.2 rounded text-[10px]">
            {pkg.rulesAst.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("skills")}
          className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === "skills"
              ? "tab-active font-semibold"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Skills</span>
          <span className="bg-[var(--accent)] px-1.5 py-0.2 rounded text-[10px]">
            {pkg.skills.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("mcp")}
          className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === "mcp"
              ? "tab-active font-semibold"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>MCP Connectors</span>
          <span className="bg-[var(--accent)] px-1.5 py-0.2 rounded text-[10px]">
            {pkg.mcpServers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === "security"
              ? "tab-active font-semibold"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security Scan</span>
          <span className={`font-bold text-[10px] ${getScanStatus(pkg).text}`}>{getScanStatus(pkg).label}</span>
        </button>

        <button
          onClick={() => setActiveTab("manifest")}
          className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === "manifest"
              ? "tab-active font-semibold"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>agenthub.json</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main README */}
          <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4 text-xs">
            <div className="prose prose-invert max-w-none text-slate-200 space-y-4 font-sans">
              <h2 className="text-base font-bold text-slate-100 border-b border-[var(--border)] pb-2 flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>{pkg.name}</span>
              </h2>

              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {pkg.description}
              </p>

              <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border)] space-y-2">
                <h3 className="text-xs font-bold text-slate-200">Included Rules AST Summary</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
                  {pkg.rulesAst.map((r, i) => (
                    <li key={i}>
                      <strong className="text-slate-300">{r.title}</strong>
                      <span className="text-indigo-400 font-mono ml-1.5">({r.tokens} tokens)</span>
                    </li>
                  ))}
                </ul>
              </div>

              {pkg.readme && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-slate-200 mb-2">Package Documentation</h3>
                  <div className="bg-[#070a12] p-4 rounded-lg border border-[var(--border)] text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {pkg.readme}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Details */}
          <div className="space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4 text-xs">
              <h4 className="font-bold text-slate-200">Setup Specification</h4>
              <div className="space-y-2.5 text-[var(--muted-foreground)]">
                <div className="flex justify-between">
                  <span>Author</span>
                  <span className="text-slate-200 font-medium">@{pkg.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span>License</span>
                  <span className="text-slate-200 font-medium">{pkg.license}</span>
                </div>
                <div className="flex justify-between">
                  <span>Version</span>
                  <span className="text-slate-200 font-medium">v{pkg.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="text-slate-200 font-medium capitalize">{pkg.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Token Budget</span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {pkg.tokenFootprint.toLocaleString()} tk
                  </span>
                </div>
              </div>

              {/* Supported Assistant Engines */}
              <div className="pt-3 border-t border-[var(--border)]">
                <h5 className="text-[11px] font-semibold text-slate-200 mb-2">
                  Supported Assistant Engines
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.platforms.map((p) => (
                    <span
                      key={p}
                      className={`px-2 py-0.5 rounded border text-[10px] font-medium ${getEngineColor(
                        p
                      )}`}
                    >
                      {getEngineLabel(p)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {pkg.tags.length > 0 && (
                <div className="pt-3 border-t border-[var(--border)]">
                  <h5 className="text-[11px] font-semibold text-slate-200 mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {pkg.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[10px] font-mono text-[var(--muted-foreground)]"
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

      {/* TAB 2: RULES AST */}
      {activeTab === "rules" && <AstRuleViewer rules={pkg.rulesAst} />}

      {/* TAB 3: SKILLS */}
      {activeTab === "skills" && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Declared Assistant Skills</span>
            </h3>
            <p className="text-[var(--muted-foreground)] text-[11px] mt-0.5">
              Self-contained executable skills mounted directly into the AI toolchain
            </p>
          </div>

          {pkg.skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pkg.skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="border border-[var(--border)] rounded-xl p-4 bg-[var(--background)] space-y-2.5 hover:border-indigo-500/40 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-indigo-300 font-mono">
                      {skill.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[var(--accent)] text-[10px] text-indigo-300 border border-indigo-500/20 font-mono">
                      SKILL.md
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                    {skill.description}
                  </p>
                  {skill.entryScript && (
                    <div className="flex items-center space-x-1.5 text-[10px] text-indigo-400 font-mono pt-1">
                      <Terminal className="w-3 h-3 text-[var(--muted-foreground)]" />
                      <span>{skill.entryScript}</span>
                    </div>
                  )}
                  {skill.tools && skill.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {skill.tools.map((tool) => (
                        <span
                          key={tool}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300"
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
                <FileJson className="w-4 h-4 text-indigo-400" />
                <span>agenthub.json Manifest</span>
              </h3>
              <p className="text-[var(--muted-foreground)] text-[11px] mt-0.5">
                Registry record for this package, as sent by the publisher
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
              Schema: v1.0
            </span>
          </div>

          <div className="bg-[#070a12] p-4 rounded-lg border border-[var(--border)] overflow-x-auto">
            <pre className="font-mono text-[11px] text-indigo-200 leading-relaxed">
              {JSON.stringify(manifestObject, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
