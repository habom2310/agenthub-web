import { createClient, type Client } from "@libsql/client";
import { drizzle as drizzleLibsql, type LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle as drizzleD1, type DrizzleD1Database } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";
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

    initialized = true;
  })().finally(() => {
    initPromise = null;
  });

  return initPromise;
}
