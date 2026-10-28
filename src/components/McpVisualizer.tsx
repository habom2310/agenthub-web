"use client";

import { McpServerItem } from "@/lib/db/schema";
import { Server, AlertTriangle, Key, Terminal, ShieldCheck, Check } from "lucide-react";

interface McpVisualizerProps {
  servers: McpServerItem[];
}

export function McpVisualizer({ servers }: McpVisualizerProps) {
  if (!servers || servers.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center text-xs text-[var(--muted-foreground)]">
        No MCP servers declared for this setup.
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-5 text-xs">
      <div>
        <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center space-x-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <span>Model Context Protocol (MCP) Connectors</span>
        </h3>
        <p className="text-[var(--muted-foreground)] text-[11px] mt-0.5">
          Declared tools and knowledge backends automatically wired into your AI assistant
        </p>
      </div>

      <div className="space-y-4">
        {servers.map((server) => {
          return (
            <div
              key={server.name}
              className="border border-[var(--border)] rounded-xl p-4 bg-[var(--background)] space-y-3 shadow-sm hover:border-indigo-500/30 transition-all"
            >
              {/* Server Name and Status */}
              <div className="flex items-center justify-between border-b border-[var(--border)]/60 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-indigo-400 font-mono flex items-center space-x-1.5">
                    <Server className="w-4 h-4" />
                    <span>{server.name}</span>
                  </span>
                  {server.description && (
                    <span className="text-[11px] text-[var(--muted-foreground)] hidden sm:inline">
                      • {server.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Ready to Sync</span>
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                      server.risk === "low"
                        ? "bg-slate-800 text-slate-300"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {server.risk} risk
                  </span>
                </div>
              </div>

              {/* Execution Details */}
              <div className="space-y-2 font-mono text-[11px] bg-[#070a12] p-3 rounded-lg border border-[var(--border)]/50">
                <div className="flex items-start space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[var(--muted-foreground)]">Command:</span>
                  <span className="text-slate-200 font-semibold break-all">{server.command}</span>
                </div>
                {server.args && server.args.length > 0 && (
                  <div className="flex items-start space-x-2 pl-5">
                    <span className="text-[var(--muted-foreground)]">Args:</span>
                    <span className="text-slate-300 break-all">
                      {JSON.stringify(server.args)}
                    </span>
                  </div>
                )}
              </div>

              {/* Environment Variables Requirement */}
              {server.env && server.env.length > 0 ? (
                <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] text-[11px] text-[var(--muted-foreground)] flex items-start space-x-2.5">
                  <Key className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Required Environment Variables:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {server.env.map((envVar) => (
                        <code
                          key={envVar}
                          className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-amber-300 font-mono text-[11px]"
                        >
                          {envVar}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-[var(--muted-foreground)] flex items-center space-x-1.5 pl-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No special environment variables or API keys required.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
