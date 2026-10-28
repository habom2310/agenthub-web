"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Github, Terminal, Sparkles, BookOpen } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        const input = document.getElementById("navbar-search-input") as HTMLInputElement;
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            AH
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-bold text-lg tracking-tight text-[var(--foreground)]">AgentHub</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--primary)] font-medium border border-indigo-500/20">Registry</span>
          </div>
        </Link>

        {/* Quick Nav Links */}
        <nav className="hidden md:flex items-center space-x-5 text-sm font-medium text-[var(--muted-foreground)]">
          <Link href="/" className="hover:text-[var(--primary)] transition-colors flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore</span>
          </Link>
          <Link href="/packages/alice/nextjs-agent" className="hover:text-[var(--primary)] transition-colors flex items-center space-x-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup Inspector</span>
          </Link>
          <Link href="/docs" className="hover:text-[var(--primary)] transition-colors flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>CLI Docs</span>
          </Link>
        </nav>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center space-x-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted-foreground)]" />
          <input
            id="navbar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search setups, rules, skills, MCPs..."
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-9 pr-8 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <span className="absolute right-2.5 top-2 text-[10px] bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded font-mono select-none">
            /
          </span>
        </form>

        {/* GitHub Button */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1.5 bg-[var(--background)] hover:bg-[var(--accent)] border border-[var(--border)] text-[var(--foreground)] px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Github className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
}
