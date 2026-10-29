import { InstallPill } from "./InstallPill";

// Targets written by `agenthub project` (../agenthub/src/core/projector.ts and connector.ts)
const TARGETS = [
  { assistant: "Claude Code", path: "~/.claude/CLAUDE.md" },
  { assistant: "Antigravity", path: "~/.gemini/GEMINI.md" },
  { assistant: "Codex", path: "~/.codex/AGENTS.md" },
  { assistant: "Cursor", path: "~/.cursor/rules/agenthub.mdc" },
  { assistant: "Windsurf", path: "~/.codeium/windsurf/memories/global_rules.md" },
];

const STEPS = [
  { text: "Run setup. It finds the assistants you have installed and links them to one hub.", command: "npx @habom2310/agenthub setup" },
  {
    text: (
      <>
        Pick a package from the{" "}
        <a href="#registry" className="text-signal-soft underline underline-offset-4 hover:text-signal">
          registry
        </a>
        . Inspect what it adds before you install it.
      </>
    ),
    command: "agenthub info <owner/repo>",
  },
  { text: "Edit your rules once in the hub, then write them to every assistant.", command: "agenthub project" },
];

export function ProjectionHero() {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 items-start pt-2 pb-4">
      <div className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)] text-balance">
            One set of agent rules for every coding assistant.
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed max-w-[60ch]">
            AgentHub keeps your rules, skills and MCP servers in one place and writes them into each
            assistant&rsquo;s own format, so Claude Code, Cursor, Codex, Antigravity and Windsurf stop drifting apart.
          </p>
        </div>

        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li key={step.command} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 gap-y-2">
              <span className="row-span-2 mt-px w-6 h-6 rounded-full border border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-[var(--foreground)] leading-snug">{step.text}</p>
              {step.command.includes("<") ? (
                // A placeholder isn't runnable, so it's shown rather than offered as a copy
                <code className="block bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2.5 sm:py-1.5 font-mono text-xs text-[var(--foreground)]">
                  <span className="text-signal font-bold" aria-hidden>$ </span>
                  {step.command}
                </code>
              ) : (
                <InstallPill command={step.command} showIcon={false} />
              )}
            </li>
          ))}
        </ol>
      </div>

      <figure
        aria-label="How AgentHub writes one rules source into each assistant"
        className="space-y-4 lg:pt-1"
      >
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-3">
          <div className="text-xs text-[var(--muted-foreground)]">Your hub, written once</div>
          <code className="font-mono text-sm text-[var(--foreground)]">~/.agenthub/rules/</code>
        </div>

        <div className="pl-4 text-xs text-[var(--muted-foreground)]">
          <span className="font-mono text-signal-soft">agenthub project</span> writes it into
        </div>

        <ul className="ml-4 border-l border-[var(--border)] space-y-2">
          {TARGETS.map((t) => (
            <li
              key={t.assistant}
              className="relative pl-5 before:absolute before:left-0 before:top-1/2 before:w-3 before:h-px before:bg-[var(--border)]"
            >
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="text-sm font-semibold text-[var(--foreground)]">{t.assistant}</span>
                <code className="font-mono text-xs text-[var(--muted-foreground)] break-all">{t.path}</code>
              </div>
            </li>
          ))}
        </ul>

        <figcaption className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          Skills folders are linked, not copied, and MCP servers are synced into each assistant&rsquo;s config.
        </figcaption>
      </figure>
    </section>
  );
}
