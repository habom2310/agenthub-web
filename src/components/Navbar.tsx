"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Github, LogIn, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import type { AuthUser } from "@/lib/auth";

// Below md the search field collapses behind an icon so the header stays one row
function NavSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}#registry`);
      // The registry's own search field now shows the query
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "Escape") setSearchOpen(false);
      if (e.key === "/" && !target.matches("input, textarea, select, [contenteditable]")) {
        e.preventDefault();
        setSearchOpen(true);
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setSearchOpen((open) => !open)}
        aria-label={searchOpen ? "Close search" : "Search packages"}
        aria-expanded={searchOpen}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
      >
        {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
      </button>

      <form
        role="search"
        onSubmit={handleSearchSubmit}
        className={cn(
          "md:block md:static md:w-80 md:p-0 md:bg-transparent md:border-0",
          searchOpen
            ? "block absolute left-0 right-0 top-full px-4 pb-3 bg-[var(--card)] border-b border-[var(--border)]"
            : "hidden"
        )}
      >
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            ref={inputRef}
            id="navbar-search-input"
            type="search"
            aria-label="Search packages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search setups, rules, skills, MCPs..."
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-9 pr-8 py-2.5 md:py-1.5 text-base md:text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <kbd className="hidden md:block absolute right-2.5 top-1/2 -translate-y-1/2 text-xs bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded font-mono select-none">
            /
          </kbd>
        </div>
      </form>
    </>
  );
}

const accountButton =
  "flex items-center justify-center gap-1.5 min-w-9 h-9 md:h-auto bg-[var(--background)] hover:bg-[var(--accent)] border border-[var(--border)] text-[var(--foreground)] px-2 md:py-1.5 rounded-lg text-xs font-semibold transition-colors";

function AccountLink({ user }: { user: AuthUser | null }) {
  const pathname = usePathname();

  if (user) {
    return (
      <Link href="/account" aria-label={`Your account, @${user.login}`} className={cn(accountButton, "md:order-last")}>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" width={24} height={24} className="w-6 h-6 rounded-full flex-shrink-0" />
        ) : (
          <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-signal flex items-center justify-center flex-shrink-0">
            {user.login.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden sm:inline font-mono max-w-[10rem] truncate">@{user.login}</span>
      </Link>
    );
  }

  return (
    // A plain anchor: the login route redirects off-site, so client routing must not intercept it
    <a
      href={`/api/auth/github/login?returnTo=${encodeURIComponent(pathname || "/account")}`}
      aria-label="Sign in with GitHub"
      className={cn(accountButton, "md:order-last")}
    >
      <LogIn className="w-4 h-4 md:w-3.5 md:h-3.5" />
      <span className="hidden sm:inline">Sign in</span>
    </a>
  );
}

export function Navbar({ user }: { user: AuthUser | null }) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-50 px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        <Link href="/" className="flex-shrink-0">
          <Logo />
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium text-[var(--muted-foreground)]">
          <Link href="/#registry" className="hover:text-[var(--primary)] transition-colors">
            Registry
          </Link>
          <Link href="/docs" className="hover:text-[var(--primary)] transition-colors">
            Docs
          </Link>
        </nav>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <NavSearch />

        <a
          href="https://github.com/habom2310/agenthub"
          target="_blank"
          rel="noreferrer"
          aria-label="AgentHub on GitHub"
          className="md:order-last hidden sm:flex items-center justify-center gap-1.5 min-w-10 h-10 md:h-auto bg-[var(--background)] hover:bg-[var(--accent)] border border-[var(--border)] text-[var(--foreground)] px-3 md:py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          <Github className="w-4 h-4 md:w-3.5 md:h-3.5" />
          <span className="hidden md:inline">GitHub</span>
        </a>

        <AccountLink user={user} />
      </div>
    </header>
  );
}
