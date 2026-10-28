import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/@libsql/client/lib-esm/web.js",
      "./node_modules/@libsql/isomorphic-ws/web.mjs",
      "./node_modules/@libsql/isomorphic-ws/web.cjs",
      "./node_modules/@libsql/isomorphic-fetch/web.js",
      "./node_modules/@libsql/isomorphic-fetch/web.cjs",
    ],
  },
};

export default nextConfig;
