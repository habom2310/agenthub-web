import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    // Each test file runs in its own process; an in-memory DB per process stops
    // parallel files from racing to create and seed the same agenthub.db file
    env: { DATABASE_URL: ":memory:", GITHUB_CLIENT_ID: "test-client" },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
