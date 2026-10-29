"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileCode, Cpu, Layers } from "lucide-react";
import { AstRuleSection } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface AstRuleViewerProps {
  rules: AstRuleSection[];
}

export function AstRuleViewer({ rules }: AstRuleViewerProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>(() => {
    // Default open the first two
    return rules.reduce((acc, _, idx) => {
      acc[idx] = idx < 2;
      return acc;
    }, {} as Record<number, boolean>);
  });

  const toggleSection = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleAll = (expand: boolean) => {
    const nextState: Record<number, boolean> = {};
    rules.forEach((_, idx) => {
      nextState[idx] = expand;
    });
    setExpandedIndices(nextState);
  };

  const totalTokens = rules.reduce((acc, r) => acc + (r.tokens || 0), 0);

  if (!rules || rules.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center text-xs text-[var(--muted-foreground)]">
        No AST rule projections defined for this package.
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Markdown AST Rules Projection</span>
          </h3>
          <p className="text-[var(--muted-foreground)] text-[11px] mt-0.5">
            Compiled and projected into GEMINI.md, CLAUDE.md, AGENTS.md, and Cursor rules
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => toggleAll(true)}
              className="text-[var(--muted-foreground)] hover:text-indigo-400 transition-colors"
            >
              Expand all
            </button>
            <span className="text-[var(--border)]">|</span>
            <button
              onClick={() => toggleAll(false)}
              className="text-[var(--muted-foreground)] hover:text-indigo-400 transition-colors"
            >
              Collapse all
            </button>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Total: {totalTokens.toLocaleString()} tokens</span>
          </span>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-3 font-mono">
        {rules.map((rule, idx) => {
          const isExpanded = expandedIndices[idx];
          return (
            <div
              key={idx}
              className="border border-[var(--border)] rounded-lg bg-[var(--background)] overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleSection(idx)}
                className="w-full text-left p-3.5 flex items-center justify-between bg-[var(--background)] hover:bg-[var(--card)]/60 transition-colors"
              >
                <div className="flex items-center space-x-2 overflow-hidden text-ellipsis">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                  )}
                  <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="font-bold text-xs text-indigo-300 truncate">{rule.title}</span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                  <span className="text-[var(--muted-foreground)] font-normal text-[11px] bg-[var(--card)] px-2 py-0.5 rounded border border-[var(--border)]">
                    {rule.tokens} tokens
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="p-3.5 border-t border-[var(--border)]/70 bg-[#070a12]">
                  <pre className="text-[12px] text-slate-300 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                    {rule.content}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
