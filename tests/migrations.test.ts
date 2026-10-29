import { describe, it, expect } from "vitest";
import { createClient } from "@libsql/client";
import { migrate, libsqlRunner } from "@/lib/db/migrations";

const DEMO_IDS = [
  "alice/nextjs-agent",
  "security/agent-harden",
  "python-dev/fastapi-agent",
  "cloud/gcp-devops",
  "rust-lang/cargo-agent",
  "data/duckdb-analytics",
];

const insert = (id: string, publisherId: number | null) => ({
  sql: `INSERT INTO packages (id, owner, repo, name, created_at, updated_at, publisher_id)
        VALUES (?, 'o', 'r', 'n', 'now', 'now', ?)`,
  args: [id, publisherId],
});

describe("0004_remove_demo_packages", () => {
  it("deletes unclaimed demo rows and leaves claimed and other rows alone", async () => {
    const client = createClient({ url: ":memory:" });
    const runner = libsqlRunner(client);
    await migrate(runner);
    await client.execute("DELETE FROM schema_migrations WHERE id = '0004_remove_demo_packages'");

    await client.batch(
      [
        // alice/nextjs-agent is claimed by a real publisher, so it stays
        insert("alice/nextjs-agent", 5),
        ...DEMO_IDS.slice(1).map((id) => insert(id, null)),
        insert("habom2310/my-agenthub-setting", 7),
        insert("someone/other-agent", null),
      ],
      "write"
    );

    await migrate(runner);

    const ids = (await client.execute("SELECT id FROM packages ORDER BY id")).rows.map((r) => String(r.id));
    expect(ids).toEqual(["alice/nextjs-agent", "habom2310/my-agenthub-setting", "someone/other-agent"]);
  });
});
