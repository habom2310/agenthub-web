declare global {
  type D1Database = import("@cloudflare/workers-types").D1Database;
  type Fetcher = import("@cloudflare/workers-types").Fetcher;

  interface CloudflareEnv {
    DB: D1Database;
    ASSETS: Fetcher;
  }
}

export {};
