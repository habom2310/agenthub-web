-- Migration: 0000_create_packages
-- Description: Create packages table for agenthub-web

CREATE TABLE IF NOT EXISTS packages (
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
);
