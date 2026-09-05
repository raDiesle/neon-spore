#!/usr/bin/env bun

/**
 * `bun run index` — makes `docs/INDEX.md`'s "## Code" table match the tree in
 * one pass: every in-scope source file gets a row, every row whose file has
 * been deleted goes, and a surviving row's hand-written text is left exactly
 * as it is. Run it after adding or deleting a file; edit the new row's text in
 * place afterwards, the generator will keep whatever is there on the next run.
 *
 * It says which rows it added and which it dropped, because those are the two
 * things worth reading afterwards — an added row wants its text written and a
 * dropped row is the tool doing the hand edit somebody used to do.
 *
 * `bun run index --check` writes nothing and exits non-zero when the table
 * has drifted from the tree, which is what the test runs.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { filterScopeFiles, generateIndex, parseRows } from "./index.js";

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
const next = generateIndex(current, {
  scope,
  read: (relPath) => readFileSync(join(ROOT, relPath), "utf8"),
  has: (relPath) => existsSync(join(ROOT, relPath)),
});

const was = new Set(parseRows(current).map((r) => r.path));
const now = new Set(parseRows(next).map((r) => r.path));
const added = [...now].filter((p) => !was.has(p));
const dropped = [...was].filter((p) => !now.has(p));

if (process.argv.includes("--check")) {
  if (next !== current) {
    console.error(`docs/INDEX.md has drifted from the tree (${scope.length} in-scope files).`);
    console.error("Run `bun run index`; it adds and drops rows, and says which.");
    process.exit(1);
  }
  console.log(`docs/INDEX.md: up to date, ${scope.length} in-scope files`);
} else {
  writeFileSync(indexPath, next);
  console.log(`docs/INDEX.md: ${scope.length} in-scope files checked`);
  for (const path of added) console.log(`  added    ${path} — write its line`);
  for (const path of dropped) console.log(`  dropped  ${path} — no such file`);
}
