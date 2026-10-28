"use client";

import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstallPillProps {
  command: string;
  className?: string;
  showIcon?: boolean;
}

export function InstallPill({ command, className, showIcon = true }: InstallPillProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy command:", err);
    }
  };

  return (
    <div
      onClick={handleCopy}
      className={cn(
        "group relative flex items-center justify-between gap-3 bg-[var(--background)] hover:border-indigo-500/50 border border-[var(--border)] rounded-lg px-3 py-1.5 font-mono text-xs text-[var(--foreground)] cursor-pointer transition-all",
        className
      )}
      title="Click to copy command"
    >
      <div className="flex items-center space-x-2 overflow-hidden text-ellipsis whitespace-nowrap">
        {showIcon && <Terminal className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
        <span className="text-indigo-400 select-none font-bold">$</span>
        <span className="truncate">{command}</span>
      </div>
      <button
        type="button"
        aria-label="Copy command"
        className="text-[var(--muted-foreground)] group-hover:text-indigo-400 p-0.5 rounded transition-colors flex-shrink-0"
      >
        {copied ? (
          <span className="flex items-center space-x-1 text-emerald-400 font-sans text-[11px] font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>Copied!</span>
          </span>
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
