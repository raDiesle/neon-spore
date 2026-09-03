#!/usr/bin/env bun

/**
 * `bun run index` — completes `docs/INDEX.md`'s "## Code" table: every
 * in-scope source file gets a row, hand-written rows are left exactly as
 * they are. Run it after adding a file; edit the new row's text in place
 * afterwards, the generator will keep whatever is there on the next run.
 *
 * `bun run index --check` writes nothing and exits non-zero when the table
 * has drifted from the tree, which is what the test runs.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { filterScopeFiles, generateIndex } from "./index.js";

const ROOT = join(import.meta.dirname, "..", "..");
const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith(".ts")) out.push(full);
  }
}

const all: string[] = [];
for (const top of ["packages", "apps", "tools"]) {
  walk(join(ROOT, top), all);
}
const relPaths = all.map((p) => relative(ROOT, p).split("\\").join("/"));
const scope = filterScopeFiles(relPaths);

const indexPath = join(ROOT, "docs", "INDEX.md");
const current = readFileSync(indexPath, "utf8");
const next = generateIndex(current, scope, (relPath) => readFileSync(join(ROOT, relPath), "utf8"));

if (process.argv.includes("--check")) {
  if (next !== current) {
    console.error(`docs/INDEX.md has drifted from the tree (${scope.length} in-scope files).`);
    console.error("Run `bun run index` and edit the text of any row it adds.");
    process.exit(1);
  }
  console.log(`docs/INDEX.md: up to date, ${scope.length} in-scope files`);
} else {
  writeFileSync(indexPath, next);
  console.log(`docs/INDEX.md: ${scope.length} in-scope files checked`);
}
