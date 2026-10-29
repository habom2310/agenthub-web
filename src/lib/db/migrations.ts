import type { Client } from "@libsql/client";

export interface SqlRunner {
  ids(): Promise<string[]>;
  columns(table: string): Promise<string[]>;
  batch(statements: string[]): Promise<void>;
}

// A SQL statement, or an ADD COLUMN that is skipped when the column already exists
type Step = string | { addColumn: { table: string; column: string; type: string } };

interface Migration {
  id: string;
  statements: Step[];
}

const SCHEMA_MIGRATIONS_SQL =
  "CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT)";

// Append only. Never edit a migration that has shipped.
export const MIGRATIONS: Migration[] = [
  {
    id: "0001_create_packages",
    statements: [
      `CREATE TABLE IF NOT EXISTS packages (
        id TEXT PRIMARY KEY,
        owner TEXT NOT NULL,
        repo TEXT NOT NULL,
        name TEXT NOT NULL,
        version TEXT NOT NULL DEFAULT '1.0.0',
        description TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT 'profile',
        platforms TEXT NOT NULL DEFAULT '[]',
        tags TEXT NOT NULL DEFAULT '[]',
        license TEXT NOT NULL DEFAULT 'MIT',
        stars INTEGER NOT NULL DEFAULT 0,
        install_count INTEGER NOT NULL DEFAULT 0,
        token_footprint INTEGER NOT NULL DEFAULT 0,
        security_risk TEXT NOT NULL DEFAULT 'low',
        is_clean INTEGER NOT NULL DEFAULT 1,
        mcp_servers TEXT NOT NULL DEFAULT '[]',
        skills TEXT NOT NULL DEFAULT '[]',
        rules_ast TEXT NOT NULL DEFAULT '[]',
        readme TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    ],
  },
  {
    id: "0002_github_auth",
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        login TEXT NOT NULL,
        name TEXT,
        avatar_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )`,
      { addColumn: { table: "packages", column: "publisher_id", type: "INTEGER" } },
      { addColumn: { table: "packages", column: "github_repo_id", type: "INTEGER" } },
    ],
  },
  {
    id: "0003_remove_live_test_agent",
    statements: ["DELETE FROM packages WHERE id = 'community/live-test-agent'"],
  },
];

async function resolveSteps(runner: SqlRunner, steps: Step[]): Promise<string[]> {
  const sql: string[] = [];
  for (const step of steps) {
    if (typeof step === "string") {
      sql.push(step);
      continue;
    }
    const { table, column, type } = step.addColumn;
    if (!(await runner.columns(table)).includes(column)) {
      sql.push(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    }
  }
  return sql;
}

export async function migrate(runner: SqlRunner): Promise<void> {
  await runner.batch([SCHEMA_MIGRATIONS_SQL]);
  for (const migration of MIGRATIONS) {
    if ((await runner.ids()).includes(migration.id)) continue;
    try {
      await runner.batch([
        ...(await resolveSteps(runner, migration.statements)),
        `INSERT INTO schema_migrations (id, applied_at) VALUES ('${migration.id}', '${new Date().toISOString()}')`,
      ]);
    } catch (error) {
      // Another instance may have applied it between our check and the batch
      if (!(await runner.ids()).includes(migration.id)) throw error;
    }
  }
}

export function libsqlRunner(client: Client): SqlRunner {
  return {
    ids: async () =>
      (await client.execute("SELECT id FROM schema_migrations")).rows.map((row) => String(row.id)),
    columns: async (table) =>
      (await client.execute(`PRAGMA table_info(${table})`)).rows.map((row) => String(row.name)),
    batch: async (statements) => {
      await client.batch(statements, "write");
    },
  };
}

export function d1Runner(d1: D1Database): SqlRunner {
  return {
    ids: async () => {
      const { results } = await d1.prepare("SELECT id FROM schema_migrations").all<{ id: string }>();
      return results.map((row) => row.id);
    },
    columns: async (table) => {
      const { results } = await d1.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
      return results.map((row) => row.name);
    },
    batch: async (statements) => {
      await d1.batch(statements.map((sql) => d1.prepare(sql)));
    },
  };
}
