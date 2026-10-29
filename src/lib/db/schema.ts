import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export interface AstRuleSection {
  title: string;
  file: string;
  tokens: number;
  content: string;
}

export interface SkillItem {
  name: string;
  description: string;
  path: string;
  entryScript?: string;
  tools?: string[];
}

export interface McpServerItem {
  name: string;
  command: string;
  args: string[];
  env: string[];
  risk: "low" | "medium" | "high";
  status: "verified" | "needs-review" | "warning";
  description?: string;
}

export const packages = sqliteTable("packages", {
  id: text("id").primaryKey(), // "owner/repo"
  owner: text("owner").notNull(),
  repo: text("repo").notNull(),
  name: text("name").notNull(),
  version: text("version").notNull().default("1.0.0"),
  description: text("description").notNull().default(""),
  type: text("type").notNull().default("profile"), // "profile" | "addon"
  platforms: text("platforms", { mode: "json" }).$type<string[]>().notNull().default([]),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
  license: text("license").notNull().default("MIT"),
  stars: integer("stars").notNull().default(0),
  installCount: integer("install_count").notNull().default(0),
  tokenFootprint: integer("token_footprint").notNull().default(0),
  securityRisk: text("security_risk").notNull().default("low"), // "low" | "medium" | "high"
  isClean: integer("is_clean", { mode: "boolean" }).notNull().default(true),
  mcpServers: text("mcp_servers", { mode: "json" }).$type<McpServerItem[]>().notNull().default([]),
  skills: text("skills", { mode: "json" }).$type<SkillItem[]>().notNull().default([]),
  rulesAst: text("rules_ast", { mode: "json" }).$type<AstRuleSection[]>().notNull().default([]),
  readme: text("readme").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  publisherId: integer("publisher_id"), // GitHub user id; null = demo or legacy
  githubRepoId: integer("github_repo_id"),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(), // GitHub user id
  login: text("login").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  idHash: text("id_hash").primaryKey(), // sha256 of the cookie token
  userId: integer("user_id").notNull(),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;
export type User = typeof users.$inferSelect;

export interface Publisher {
  login: string;
  avatarUrl: string | null;
}

// A package as the API and the site expose it: publisher details, no internal ids
export type PublicPackage = Omit<Package, "publisherId" | "githubRepoId"> & {
  publisher: Publisher | null;
};
