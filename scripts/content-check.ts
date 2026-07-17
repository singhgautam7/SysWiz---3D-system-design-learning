#!/usr/bin/env bun
/**
 * content:check — validates every lesson under content/ against the schema and
 * the cross-file rules in docs/CONTENT_MODEL.md. Exits non-zero on any
 * violation so broken content can't merge (runs in CI).
 */
import { validateAllContent } from "../lib/content/load";
import path from "node:path";

const errors = validateAllContent();

if (errors.length === 0) {
  console.log("✓ content:check — all lessons valid");
  process.exit(0);
}

console.error(`✗ content:check — ${errors.length} problem(s):\n`);
for (const err of errors) {
  const rel = path.relative(process.cwd(), err.filePath);
  console.error(`  ${rel}\n    → ${err.message}`);
}
process.exit(1);
