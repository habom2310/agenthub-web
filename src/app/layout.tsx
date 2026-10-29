import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AgentHub | One set of agent rules for every coding assistant",
  description: "Keep your agent rules, skills and MCP servers in one place and write them into Claude Code, Cursor, Codex, Antigravity and Windsurf. Browse shared setups and inspect what they add before you install.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased min-h-screen flex flex-col font-sans selection:bg-signal/30 selection:text-[var(--foreground)]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-[var(--card)] focus:border focus:border-[var(--border)] focus:text-sm"
        >
          Skip to content
        </a>
        <Navbar user={user} />
        <main id="main" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] bg-[var(--card)] py-6 mt-12 text-xs text-[var(--muted-foreground)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo small />
            <div className="flex items-center space-x-5">
              <a href="/docs" className="hover:text-[var(--primary)] transition-colors">CLI Docs</a>
              <a href="https://github.com/habom2310/agenthub" target="_blank" rel="noreferrer" className="hover:text-[var(--primary)] transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
