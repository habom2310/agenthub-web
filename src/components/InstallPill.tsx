"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, Terminal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstallPillProps {
  command: string;
  className?: string;
  showIcon?: boolean;
}

export function InstallPill({ command, className, showIcon = true }: InstallPillProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy command: ${command}`}
        className={cn(
          "group relative w-full flex items-center justify-between gap-3 bg-[var(--background)] hover:border-signal/50 border border-[var(--border)] rounded-lg px-3 py-2.5 sm:py-1.5 font-mono text-xs text-left text-[var(--foreground)] transition-colors",
          className
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          {showIcon && <Terminal className="w-3.5 h-3.5 text-signal flex-shrink-0" aria-hidden />}
          <span className="text-signal select-none font-bold" aria-hidden>$</span>
          <span className="break-words">{command}</span>
        </span>
        <span className="flex-shrink-0 font-sans text-xs font-semibold" aria-hidden>
          {status === "copied" ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3.5 h-3.5" aria-hidden />
              Copied
            </span>
          ) : status === "failed" ? (
            <span className="flex items-center gap-1 text-amber-400">
              <X className="w-3.5 h-3.5" aria-hidden />
              Copy failed
            </span>
          ) : (
            <Copy className="w-3.5 h-3.5 text-[var(--muted-foreground)] group-hover:text-signal transition-colors" aria-hidden />
          )}
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {status === "copied" ? "Command copied" : status === "failed" ? "Copy failed" : ""}
      </span>
    </>
  );
}
