import Link from "next/link";
import { Github, Terminal } from "lucide-react";
import type { Metadata } from "next";
import { initDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { accountErrorMessage } from "@/lib/oauth";
import { listPackagesFor } from "@/lib/packages";
import { InstallPill } from "@/components/InstallPill";
import { UnpublishButton } from "@/components/UnpublishButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account | AgentHub",
  description: "Sign in with GitHub to publish and manage your AgentHub packages.",
};

const signInButton =
  "inline-flex items-center gap-2 bg-signal text-[var(--primary-foreground)] hover:bg-signal-soft px-4 py-2 rounded-lg text-xs font-bold transition-colors";

function SignInCard() {
  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
      <h2 className="text-sm font-bold text-[var(--foreground)]">Sign in with GitHub</h2>
      <p className="text-[var(--muted-foreground)] leading-relaxed">
        You publish as your GitHub account, and only to repos you can push to.
        AgentHub asks for no GitHub permissions beyond your public profile.
      </p>
      <a href="/api/auth/github/login?returnTo=/account" className={signInButton}>
        <Github className="w-4 h-4" />
        Sign in with GitHub
      </a>
    </section>
  );
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const user = await getSessionUser();
  const owned = user ? (await initDb(), await listPackagesFor(user)) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">Account</h1>

      {error && (
        <div role="alert" className="border border-red-400/20 bg-red-500/10 text-red-400 rounded-lg px-4 py-3">
          {accountErrorMessage(error)}
        </div>
      )}

      {!user ? (
        <SignInCard />
      ) : (
        <>
          <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {user.avatarUrl && (
                <img src={user.avatarUrl} alt="" width={40} height={40} className="w-10 h-10 rounded-full flex-shrink-0" />
              )}
              <div className="min-w-0">
                {user.name && <div className="text-sm font-bold text-[var(--foreground)] truncate">{user.name}</div>}
                <div className="font-mono text-[var(--muted-foreground)] truncate">@{user.login}</div>
              </div>
            </div>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] text-[var(--foreground)] text-xs font-semibold transition-colors"
              >
                Sign out
              </button>
            </form>
          </section>

          <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-[var(--foreground)]">Your packages</h2>
            {owned.length === 0 ? (
              <p className="text-[var(--muted-foreground)]">Nothing published yet. Publish from the CLI below.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg bg-[var(--background)]">
                {owned.map((pkg) => (
                  <li key={pkg.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <Link
                        href={`/packages/${pkg.owner}/${pkg.repo}`}
                        className="font-mono text-sm font-bold text-signal-soft hover:text-signal break-all"
                      >
                        {pkg.id}
                      </Link>
                      <p className="text-[var(--muted-foreground)] mt-0.5 truncate">{pkg.name}</p>
                    </div>
                    <UnpublishButton id={pkg.id} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-signal" />
              <span>Publish from the CLI</span>
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              Log in once, then publish a setup from a public GitHub repo you can push to.
            </p>
            <div className="space-y-2 font-mono">
              <InstallPill command="agenthub login" />
              <InstallPill command="agenthub share --publish" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
