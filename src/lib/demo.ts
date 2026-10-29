// Seeded into an empty registry so the site has something to show; not real published packages
export const DEMO_PACKAGE_IDS = [
  "alice/nextjs-agent",
  "security/agent-harden",
  "python-dev/fastapi-agent",
  "cloud/gcp-devops",
  "rust-lang/cargo-agent",
  "data/duckdb-analytics",
];

export const isDemoPackage = (id: string) => DEMO_PACKAGE_IDS.includes(id);

export function registryNote(ids: string[]): string | null {
  const demoCount = ids.filter(isDemoPackage).length;
  if (demoCount === 0) return null;
  if (demoCount === ids.length) {
    return "Example packages only. Nothing has been published yet, so these show what a package looks like.";
  }
  return "Packages marked Example are demo data.";
}
