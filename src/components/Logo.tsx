import { useId } from "react";
import { cn } from "@/lib/utils";

// Robot cat head; the visor is masked out so the page background shows through
export function LogoMark({ className }: { className?: string }) {
  const maskId = useId();
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden className={cn("text-signal", className)}>
      <mask id={maskId}>
        <rect width="64" height="64" fill="white" />
        <rect x="18" y="31" width="28" height="13" rx="6.5" fill="black" />
      </mask>
      <path
        d="M11 36C11 30 12 26 14 23L15 10 26 18C30 17 34 17 38 18L49 10 50 23C52 26 53 30 53 36 53 47 44 55 32 55 20 55 11 47 11 36Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
        mask={`url(#${maskId})`}
      />
      <rect x="23" y="34.5" width="5" height="6" rx="2.5" />
      <rect x="36" y="34.5" width="5" height="6" rx="2.5" />
    </svg>
  );
}

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className={cn("flex items-center", small ? "gap-2" : "gap-2.5")}>
      <LogoMark className={small ? "w-[18px] h-[18px]" : "w-7 h-7"} />
      <span className={cn("tracking-tight text-[var(--foreground)]", small ? "font-semibold" : "font-bold text-lg")}>AgentHub</span>
    </span>
  );
}
