import type { AstRuleSection, McpServerItem, SkillItem } from "@/lib/db/schema";

export const MAX_BODY_BYTES = 1024 * 1024;

export interface Manifest {
  owner: string;
  repo: string;
  name: string;
  version: string;
  description: string;
  type: "profile" | "addon";
  platforms: string[];
  tags: string[];
  license: string;
  rulesAst: AstRuleSection[];
  skills: SkillItem[];
  mcpServers: McpServerItem[];
  readme: string;
  tokenFootprint: unknown;
  securityRisk: unknown;
  isClean: unknown;
}

type Obj = Record<string, unknown>;

class Invalid extends Error {}

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function str(v: unknown, field: string, max: number, fallback?: string): string {
  if (v === undefined || v === null) {
    if (fallback !== undefined) return fallback;
    throw new Invalid(`${field} is required.`);
  }
  if (typeof v !== "string") throw new Invalid(`${field} must be a string.`);
  if (v.length > max) throw new Invalid(`${field} is too long (max ${max} characters).`);
  return v;
}

function list<T>(v: unknown, field: string, max: number, item: (x: unknown, label: string) => T): T[] {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) throw new Invalid(`${field} must be an array.`);
  if (v.length > max) throw new Invalid(`${field} has too many items (max ${max}).`);
  return v.map((x, i) => item(x, `${field}[${i}]`));
}

const strings = (v: unknown, field: string, max = 100) =>
  list(v, field, max, (x, label) => str(x, label, 200));

function obj(x: unknown, label: string): Obj {
  if (!isObj(x)) throw new Invalid(`${label} must be an object.`);
  return x;
}

function oneOf<T extends string>(v: unknown, label: string, allowed: readonly T[], fallback: T): T {
  if (v === undefined || v === null) return fallback;
  if (typeof v !== "string" || !allowed.includes(v as T)) throw new Invalid(`${label} must be one of ${allowed.join(", ")}.`);
  return v as T;
}

function rule(x: unknown, label: string): AstRuleSection {
  const o = obj(x, label);
  const tokens = o.tokens === undefined || o.tokens === null ? 100 : o.tokens;
  if (typeof tokens !== "number" || !Number.isFinite(tokens) || tokens < 0) {
    throw new Invalid(`${label}.tokens must be a non-negative number.`);
  }
  return {
    title: str(o.title, `${label}.title`, 500),
    file: str(o.file, `${label}.file`, 500),
    tokens: tokens || 100,
    content: str(o.content, `${label}.content`, 50_000, ""),
  };
}

function skill(x: unknown, label: string): SkillItem {
  const o = obj(x, label);
  const entry = o.entryScript === undefined || o.entryScript === null ? undefined : str(o.entryScript, `${label}.entryScript`, 500);
  return {
    name: str(o.name, `${label}.name`, 200),
    description: str(o.description, `${label}.description`, 2000, ""),
    path: str(o.path, `${label}.path`, 500, ""),
    ...(entry !== undefined ? { entryScript: entry } : {}),
    ...(o.tools !== undefined && o.tools !== null ? { tools: strings(o.tools, `${label}.tools`) } : {}),
  };
}

function mcp(x: unknown, label: string): McpServerItem {
  const o = obj(x, label);
  const description = o.description === undefined || o.description === null ? undefined : str(o.description, `${label}.description`, 2000);
  return {
    name: str(o.name, `${label}.name`, 200),
    command: str(o.command, `${label}.command`, 1000),
    args: strings(o.args, `${label}.args`),
    env: strings(o.env, `${label}.env`),
    risk: oneOf(o.risk, `${label}.risk`, ["low", "medium", "high"], "low"),
    status: oneOf(o.status, `${label}.status`, ["verified", "needs-review", "warning"], "needs-review"),
    ...(description !== undefined ? { description } : {}),
  };
}

// Returns a normalised manifest or a readable validation error
export function parseManifest(body: unknown): { manifest: Manifest } | { error: string } {
  try {
    const o = obj(body, "Request body");
    const type = str(o.type, "type", 20, "profile");
    return {
      manifest: {
        owner: str(o.owner, "owner", 100),
        repo: str(o.repo, "repo", 100),
        name: str(o.name, "name", 200),
        version: str(o.version, "version", 64, "1.0.0"),
        description: str(o.description, "description", 1000, ""),
        type: type === "addon" ? "addon" : "profile",
        platforms: strings(o.platforms === undefined ? ["gemini", "claude", "cursor"] : o.platforms, "platforms"),
        tags: strings(o.tags, "tags"),
        license: str(o.license, "license", 100, "MIT"),
        rulesAst: list(o.rulesAst, "rulesAst", 500, rule),
        skills: list(o.skills, "skills", 200, skill),
        mcpServers: list(o.mcpServers, "mcpServers", 100, mcp),
        readme: str(o.readme, "readme", 200_000, ""),
        tokenFootprint: o.tokenFootprint,
        securityRisk: o.securityRisk,
        isClean: o.isClean ?? true,
      },
    };
  } catch (error) {
    if (error instanceof Invalid) return { error: error.message };
    throw error;
  }
}

// Reads a JSON object body, enforcing the size cap while streaming
export async function readJsonBody(request: Request): Promise<{ body: unknown } | { error: string; status: number }> {
  const tooLarge = { error: "Request body is too large (max 1 MB).", status: 413 };
  const declared = Number(request.headers.get("content-length"));
  if (declared > MAX_BODY_BYTES) return tooLarge;

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return tooLarge;
  try {
    return { body: JSON.parse(text) };
  } catch {
    return { error: "Request body must be valid JSON.", status: 400 };
  }
}
