import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AgentHub | The Open Registry for AI Coding Agents",
  description: "Discover, share, and reuse AI agent setups, rules, skills, and MCP connectors for Google Antigravity, Claude Code, Cursor, and Codex.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] bg-[var(--card)] py-6 mt-12 text-xs text-[var(--muted-foreground)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                AH
              </div>
              <span className="font-semibold text-slate-200">AgentHub Platform</span>
              <span>• Open Agent Specification Standard</span>
            </div>
            <div className="flex items-center space-x-5">
              <a href="/docs" className="hover:text-[var(--primary)] transition-colors">CLI Docs</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[var(--primary)] transition-colors">GitHub</a>
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
