import { createClient, type Client } from "@libsql/client";
import { drizzle as drizzleLibsql, type LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle as drizzleD1, type DrizzleD1Database } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";
import { packages, Package, NewPackage } from "./schema";
import { migrate, d1Runner, libsqlRunner } from "./migrations";

let localClient: Client | null = null;
let localDb: LibSQLDatabase<typeof schema> | null = null;
let cachedD1Db: DrizzleD1Database<typeof schema> | null = null;
let cachedD1Binding: D1Database | null = null;

function getLocalClient(): Client {
  if (!localClient) {
    localClient = createClient({
      url: process.env.DATABASE_URL || "file:agenthub.db",
    });
  }
  return localClient;
}

function getLocalDb(): LibSQLDatabase<typeof schema> {
  if (!localDb) {
    localDb = drizzleLibsql(getLocalClient(), { schema });
  }
  return localDb;
}

export function getDb(): DrizzleD1Database<typeof schema> | LibSQLDatabase<typeof schema> {
  let ctx: ReturnType<typeof getCloudflareContext> | undefined;
  try {
    ctx = getCloudflareContext();
  } catch {
    // Cloudflare context unavailable; fall back to local LibSQL/SQLite
  }

  if (ctx) {
    if (!ctx.env?.DB) {
      throw new Error(
        "Cloudflare context detected, but DB binding (ctx.env.DB) is missing. Check wrangler.jsonc d1_databases configuration."
      );
    }
    if (cachedD1Db && cachedD1Binding === ctx.env.DB) {
      return cachedD1Db;
    }
    cachedD1Binding = ctx.env.DB;
    cachedD1Db = drizzleD1(ctx.env.DB, { schema });
    return cachedD1Db;
  }

  return getLocalDb();
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop, _receiver) {
    if (prop === "then") {
      return undefined;
    }
    const target = getDb();
    const value = Reflect.get(target, prop, target);
    if (typeof value === "function") {
      return value.bind(target);
    }
    return value;
  },
  has(_target, prop) {
    return prop in getDb();
  },
});

export const SEED_PACKAGES: NewPackage[] = [
  {
    id: "alice/nextjs-agent",
    owner: "alice",
    repo: "nextjs-agent",
    name: "Fullstack Next.js Agent",
    version: "1.2.0",
    description: "Production Next.js 15 App Router setup with Tailwind CSS, Drizzle ORM, Playwright e2e verification, and strict AST boundaries.",
    type: "profile",
    platforms: ["gemini", "claude", "cursor", "codex", "windsurf"],
    tags: ["nextjs", "react", "tailwind", "typescript", "drizzle", "playwright"],
    license: "MIT",
    stars: 342,
    installCount: 1890,
    tokenFootprint: 1420,
    securityRisk: "low",
    isClean: true,
    mcpServers: [
      {
        name: "postgres",
        command: "npx -y @modelcontextprotocol/server-postgres",
        args: ["${DATABASE_URL}"],
        env: ["DATABASE_URL"],
        risk: "low",
        status: "verified",
        description: "Direct schema reflection and query simulation for PostgreSQL."
      }
    ],
    skills: [
      {
        name: "skills/nextjs-audit",
        description: "Scans Next.js routing architecture for improper client/server component boundaries and missing loading skeletons.",
        path: "skills/nextjs-audit",
        entryScript: "scripts/audit.ts",
        tools: ["scan_routes", "check_server_components"]
      },
      {
        name: "skills/drizzle-migrate",
        description: "Automated schema diff generator and dry-run SQL migration validator.",
        path: "skills/drizzle-migrate",
        entryScript: "scripts/diff-migration.ts",
        tools: ["generate_diff", "validate_migration"]
      }
    ],
    rulesAst: [
      {
        title: "rules/common.md > ## 1. Think Before Coding",
        file: "rules/common.md",
        tokens: 195,
        content: "Don't assume. Don't hide confusion. Surface tradeoffs.\nState your assumptions explicitly. If uncertain, ask.\nIf multiple interpretations exist, present them - don't pick silently."
      },
      {
        title: "rules/common.md > ## 2. Next.js 15 Server-Action Boundaries",
        file: "rules/common.md",
        tokens: 340,
        content: "Keep data fetching in Server Components. Always validate action inputs with Zod before database execution.\nNever import server-only code into client components.\nUse optimistic updates with React 19 useActionState where appropriate."
      },
      {
        title: "rules/overrides/claude.md > ## PR Review Protocol",
        file: "rules/overrides/claude.md",
        tokens: 305,
        content: "Runs single-pass Copilot CLI and Claude reviewer subagents sequentially with numbered findings.\nPost comments with exact references and commit SHAs."
      }
    ],
    readme: `# Fullstack Next.js Agent Configuration\n\nThis turnkey profile provides deep contextual intelligence for Next.js 15 App Router, React 19, Drizzle ORM, and Tailwind CSS.\n\n### Key Features\n- **Strict Server Components**: Enforces data-fetching in RSC.\n- **Drizzle Database Tooling**: Auto-generates migrations with safe rollbacks.\n- **Playwright Verification**: End-to-end browser assertions before PR submission.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "security/agent-harden",
    owner: "security",
    repo: "agent-harden",
    name: "Zero-Trust Security & Hardening Rules",
    version: "2.0.1",
    description: "Rigorous coding heuristics preventing secret leaks, SQL injection, untrusted shell executions, and unsafe package installations.",
    type: "addon",
    platforms: ["gemini", "claude", "cursor", "codex", "windsurf"],
    tags: ["security", "audit", "guardrails", "zero-trust", "secrets"],
    license: "Apache-2.0",
    stars: 512,
    installCount: 3240,
    tokenFootprint: 380,
    securityRisk: "low",
    isClean: true,
    mcpServers: [],
    skills: [
      {
        name: "skills/secret-scanner",
        description: "Trufflehog-style heuristic scanner preventing commits with plaintext tokens, credentials, or private keys.",
        path: "skills/secret-scanner",
        entryScript: "scripts/scan-secrets.ts",
        tools: ["scan_diff", "check_staged"]
      }
    ],
    rulesAst: [
      {
        title: "rules/security.md > ## 1. Secret Protection Heuristics",
        file: "rules/security.md",
        tokens: 180,
        content: "Block execution of commands echoing or printing known secret environment variables, tokens, or private keys.\nNever commit .env files or hardcoded credentials."
      },
      {
        title: "rules/security.md > ## 2. Command Sanitization & Sandboxing",
        file: "rules/security.md",
        tokens: 200,
        content: "Enforce non-destructive shell flags. Disallow unbounded rm -rf, raw SQL concatenation, and unpinned curl | bash scripts.\nRequire user confirmation for system-altering commands."
      }
    ],
    readme: `# Zero-Trust Security & Hardening Pack\n\nModular add-on rule pack compatible with all AI coding agents. Instantly audits shell commands and code diffs for secret leakage and dangerous operations.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "python-dev/fastapi-agent",
    owner: "python-dev",
    repo: "fastapi-agent",
    name: "Modern FastAPI + Pydantic v2 Setup",
    version: "1.1.0",
    description: "High-performance Python profile featuring FastAPI, Pydantic v2 validation models, Ruff formatting, and Pytest coverage gates.",
    type: "profile",
    platforms: ["gemini", "claude", "cursor"],
    tags: ["python", "fastapi", "pydantic", "ruff", "pytest", "asyncio"],
    license: "MIT",
    stars: 289,
    installCount: 1420,
    tokenFootprint: 1150,
    securityRisk: "low",
    isClean: true,
    mcpServers: [
      {
        name: "sqlite",
        command: "uvx mcp-server-sqlite",
        args: ["--db-path", "./test.db"],
        env: [],
        risk: "low",
        status: "verified",
        description: "Local SQLite database inspector for rapid API prototyping."
      }
    ],
    skills: [
      {
        name: "skills/pytest-runner",
        description: "Isolated test runner with coverage threshold enforcement and failed test trace analysis.",
        path: "skills/pytest-runner",
        entryScript: "scripts/run-pytest.py",
        tools: ["run_tests", "analyze_trace"]
      }
    ],
    rulesAst: [
      {
        title: "rules/python.md > ## 1. Pydantic v2 Validation",
        file: "rules/python.md",
        tokens: 210,
        content: "Always use annotated types and model_validator. Maintain explicit request/response schemas for all route handlers.\nAvoid mutable default arguments."
      },
      {
        title: "rules/python.md > ## 2. Ruff & Pytest Standards",
        file: "rules/python.md",
        tokens: 260,
        content: "Auto-format with ruff before saving. Write test functions with pytest-asyncio and fixtures.\nAim for >= 85% branch coverage on core business logic."
      }
    ],
    readme: `# FastAPI Development Agent\n\nConfigured specifically for Python 3.12+, FastAPI async architecture, and strict Pydantic v2 schema validations.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cloud/gcp-devops",
    owner: "cloud",
    repo: "gcp-devops",
    name: "Google Cloud Platform & Terraform DevOps",
    version: "1.0.4",
    description: "Infrastructure as Code tooling for Google Cloud Platform, Terraform state sanity checks, Cloud Run configurations, and IAM auditing.",
    type: "addon",
    platforms: ["gemini", "claude", "cursor"],
    tags: ["cloud", "gcp", "terraform", "kubernetes", "docker"],
    license: "MIT",
    stars: 198,
    installCount: 960,
    tokenFootprint: 920,
    securityRisk: "low",
    isClean: true,
    mcpServers: [
      {
        name: "gcp-resource-manager",
        command: "npx -y @google-cloud/mcp-server",
        args: ["--project", "${GCP_PROJECT_ID}"],
        env: ["GCP_PROJECT_ID", "GOOGLE_APPLICATION_CREDENTIALS"],
        risk: "medium",
        status: "verified",
        description: "Inspects live Google Cloud project resources, quotas, and service accounts."
      }
    ],
    skills: [
      {
        name: "skills/tf-lint",
        description: "Automated tflint and checkov static analysis validator for Terraform modules.",
        path: "skills/tf-lint",
        entryScript: "scripts/lint.sh",
        tools: ["lint_terraform", "scan_misconfigurations"]
      }
    ],
    rulesAst: [
      {
        title: "rules/gcp.md > ## 1. Least Privilege IAM Heuristics",
        file: "rules/gcp.md",
        tokens: 280,
        content: "Ensure Cloud Run and GKE service accounts avoid Owner/Editor roles. Explicitly declare minimal IAM bindings.\nNever grant serviceAccountUser globally."
      },
      {
        title: "rules/terraform.md > ## 2. Terraform State Safety",
        file: "rules/terraform.md",
        tokens: 240,
        content: "Always run plan with out-file before applying. Never hardcode project IDs or sensitive outputs in tf files.\nUse remote GCS backend with state locking."
      }
    ],
    readme: `# GCP DevOps & Cloud Automation Pack\n\nEquips agents with deep knowledge of Google Cloud services, Terraform modules, and secure IAM patterns.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rust-lang/cargo-agent",
    owner: "rust-lang",
    repo: "cargo-agent",
    name: "Rust Systems & Cargo Toolchain",
    version: "1.3.0",
    description: "High-performance Rust systems engineering profile with Tokio async patterns, Cargo Clippy gating, memory safety rules, and Wasm targets.",
    type: "profile",
    platforms: ["gemini", "claude", "cursor", "codex"],
    tags: ["rust", "cargo", "wasm", "clippy", "tokio"],
    license: "MIT",
    stars: 435,
    installCount: 2150,
    tokenFootprint: 1280,
    securityRisk: "low",
    isClean: true,
    mcpServers: [],
    skills: [
      {
        name: "skills/cargo-audit",
        description: "Audits Cargo.lock dependencies for known vulnerabilities and unmaintained crates.",
        path: "skills/cargo-audit",
        entryScript: "scripts/audit.rs",
        tools: ["audit_dependencies"]
      }
    ],
    rulesAst: [
      {
        title: "rules/rust.md > ## 1. Zero-Cost Abstractions & Ownership",
        file: "rules/rust.md",
        tokens: 320,
        content: "Prefer borrowing over cloning. Use Cow<'a, str> for conditional mutations. Enforce cargo clippy -- -D warnings on every change.\nNever use unsafe without a formal SAFETY: comment."
      },
      {
        title: "rules/rust.md > ## 2. Async Runtime Patterns",
        file: "rules/rust.md",
        tokens: 290,
        content: "Structure async tasks using Tokio select! loops and scoped cancellations without blocking threads.\nUse channels for actor communication."
      }
    ],
    readme: `# Rust Systems & WebAssembly Configuration\n\nOptimized for zero-cost abstractions, strict type safety, Tokio async runtimes, and fast compilation caching.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "data/duckdb-analytics",
    owner: "data",
    repo: "duckdb-analytics",
    name: "DuckDB Local Analytics & Parquet Pipeline",
    version: "0.9.5",
    description: "In-process analytical SQL powerhouse for local Parquet, Arrow, and CSV data exploration with columnar speed and memory bounds.",
    type: "addon",
    platforms: ["gemini", "claude", "cursor", "windsurf"],
    tags: ["data", "duckdb", "sql", "parquet", "analytics"],
    license: "Apache-2.0",
    stars: 274,
    installCount: 1310,
    tokenFootprint: 760,
    securityRisk: "low",
    isClean: true,
    mcpServers: [
      {
        name: "duckdb",
        command: "uvx mcp-server-duckdb",
        args: ["--readonly"],
        env: [],
        risk: "low",
        status: "verified",
        description: "Direct read-only analytical queries against Parquet files and local databases."
      }
    ],
    skills: [
      {
        name: "skills/duckdb-query",
        description: "Fast CLI skill for executing columnar queries against local Parquet/CSV files.",
        path: "skills/duckdb-query",
        entryScript: "scripts/query.py",
        tools: ["query_parquet", "describe_table"]
      }
    ],
    rulesAst: [
      {
        title: "rules/analytics.md > ## 1. Parquet Pushdown Optimizations",
        file: "rules/analytics.md",
        tokens: 260,
        content: "Leverage DuckDB native Parquet filters and columnar projections. Avoid loading full datasets into memory.\nUse COPY ... TO ... (FORMAT PARQUET) for large exports."
      }
    ],
    readme: `# DuckDB Local Analytics Add-on\n\nTransform your AI coding agent into a data scientist capable of slicing gigabyte-scale datasets locally with zero infrastructure.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initDb() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let ctx: ReturnType<typeof getCloudflareContext> | undefined;
    try {
      ctx = getCloudflareContext();
    } catch {
      // Cloudflare context unavailable
    }

    if (ctx) {
      if (!ctx.env?.DB) {
        throw new Error(
          "Cloudflare context detected, but DB binding (ctx.env.DB) is missing. Check wrangler.jsonc d1_databases configuration."
        );
      }
      await migrate(d1Runner(ctx.env.DB));
    } else {
      await migrate(libsqlRunner(getLocalClient()));
    }

    const [existing] = await db.select().from(packages).limit(1);
    if (!existing) {
      for (const pkg of SEED_PACKAGES) {
        await db.insert(packages).values(pkg).onConflictDoNothing();
      }
    }

    initialized = true;
  })().finally(() => {
    initPromise = null;
  });

  return initPromise;
}
