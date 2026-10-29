# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers who use more than one AI coding assistant (Claude Code, Cursor, Codex, Google Antigravity, Windsurf, GitHub Copilot CLI).
They want to find a setup (rules, skills, MCP servers) and install it into their own environment with the `agenthub` CLI.
They often arrive without knowing AgentHub yet.

## Product Purpose

AgentHub web is the main public face of AgentHub.
It explains what AgentHub is, then lets people browse, inspect and install shared agent setups.
Success means a visitor understands the product, finds a package worth trying, and copies a working CLI command.

## Positioning

One source of rules, skills and MCP definitions, projected into every assistant's own format (`CLAUDE.md`, `GEMINI.md`, `AGENTS.md`, Cursor rules) so they do not drift apart.
The registry shows what a package will put into the agent's context (token footprint, MCP servers, skills, rules) before anything is installed.

## Operating Context

- The CLI is the npm package `@habom2310/agenthub` (source in the sibling repo `../agenthub`).
- Install: `npm install -g @habom2310/agenthub`, or `npx @habom2310/agenthub setup`.
- Real CLI commands: `setup`, `init`, `detect`, `doctor`, `link`, `connect`, `project`, `diff`, `promote`, `mcp`, `profile`, `add`, `search`, `info`, `share`, `budget`, `export`, `git`, `push`, `pull`, `uninstall`, `login`, `whoami`, `logout`, `unpublish`.
- Publishing needs a GitHub login: `agenthub login` (GitHub device flow), or "Sign in" on the website (GitHub OAuth).
  The CLI publishes through `POST /api/index` with the user's GitHub token as a bearer token.
  A package id is a public GitHub repo, and you can publish only to repos you can push to.
  GitHub is the only identity; the registry requests no OAuth scopes and stores sessions hashed.
- Packages are either a `profile` (a full turnkey setup) or an `addon` (a rule pack, skill or MCP connector added on top).

## Capabilities and Constraints

- Stack: Next.js 15, React 19, Tailwind 3, Drizzle ORM on SQLite / Cloudflare D1, deployed to Cloudflare Workers via OpenNext.
- Routes today: catalog explorer (`/`), package detail, CLI docs (`/docs`), account (`/account`), registry API (`/api/packages`, `/api/index`, `/api/auth/*`).
- Every command shown on the site must match the CLI command reference in `../agenthub/README.md`.
  The npm package is `@habom2310/agenthub`, so `npx` examples must use that name.
- The CLI runs a static scan (`../agenthub/src/core/security.ts`) when a package is published, and sends `securityRisk` and `isClean` to the registry.
  The registry stores what the publisher sends and does not re-run the scan, so the site must label it as a publish-time scan, never as registry verification.
- `agenthub info` and `add` with an `owner/repo` target clone `https://github.com/owner/repo` and scan it locally; they do not read this registry.
- `agenthub search` queries this registry's `GET /api/packages` (`../agenthub/src/core/registry.ts`) without a `sort`, so the API default order is what CLI users see.

## Evidence on Hand

- The registry holds only packages that real publishers have published.
- No real users, testimonials, install counts or star counts.
  Do not invent them or present placeholder numbers as real.
- Logo: a robot cat head (solid head, pointed ears, cut-out visor with two pill eyes) in `src/components/Logo.tsx`, also used as the favicon (`src/app/icon.svg`).

## Product Principles

1. Show what a package does to your agent before you install it.
2. Never claim verification, safety or popularity the system has not actually measured.
3. The CLI command is the main action; it must be correct and one click to copy.
4. Treat every supported assistant as equal; no single vendor is the default.
