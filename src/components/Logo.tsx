import { cn } from "@/lib/utils";

// One hub fanning out to three assistants, the same idea as the homepage projection diagram
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("text-signal", className)}
    >
      <rect x="2" y="9" width="6" height="6" rx="1" fill="currentColor" stroke="none" />
      <path d="M8 12h4M12 12 18 5M12 12h6M12 12l6 7" />
      <circle cx="20" cy="5" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="20" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="20" cy="19" r="1.6" fill="currentColor" stroke="none" />
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
