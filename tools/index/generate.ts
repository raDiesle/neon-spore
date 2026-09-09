/**
 * `docs/INDEX.md` as a function of a checkout, callable from anywhere
 *
 * `bun run index` used to be the only way to ask this question, which was fine
 * while a person was the only one asking. `tools/land` now asks it too — a
 * rebase that conflicts in the file map is resolved by regenerating the file
 * map, and a landing that has to spawn a second Bun to do it is a landing that
 * fails differently depending on the shell it was started from.
 *
 * So the walk and the write live here, and `run.ts` is the command-line half:
 * flags, and the two lists worth reading afterwards.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { filterScopeFiles, generateIndex, parseRows } from "./index.js";

// `.claude` for the reason `tools/test/tree-walk.test.ts` gives: a worktree is
// a full copy of the repository sitting inside the repository. This walk starts
// at `packages`, `apps` and `tools` and so cannot reach one today; it is here so
// that changing where it starts is not also a silent change to what it scans.
const SKIP_DIRS = new Set([".claude", "node_modules", "dist", ".git"]);

/** The three roots that hold source. A checkout missing one is walked without it. */
const ROOTS = ["packages", "apps", "tools"];

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith(".ts")) out.push(full);
  }
}

/** Every in-scope source path in a checkout, repository-relative and slash-separated. */
export function scopeOf(root: string): string[] {
  const all: string[] = [];
  for (const top of ROOTS) {
    const dir = join(root, top);
    if (existsSync(dir)) walk(dir, all);
  }
  return filterScopeFiles(all.map((p) => relative(root, p).split("\\").join("/")));
}

export interface Regenerated {
  /** What the file should hold; identical to `was` when nothing drifted. */
  text: string;
  /** What it holds now. */
  was: string;
  /** How many files the walk found. */
  scope: number;
  /** Rows this run would add — each one wanting its line written. */
  added: string[];
  /** Rows this run would drop, the file they name being gone. */
  dropped: string[];
}

/** What `bun run index` would write, worked out without writing it. */
export function regenerate(root: string): Regenerated {
  const scope = scopeOf(root);
  const path = join(root, "docs", "INDEX.md");
  const was = readFileSync(path, "utf8");
  const text = generateIndex(was, {
    scope,
    read: (relPath) => readFileSync(join(root, relPath), "utf8"),
    has: (relPath) => existsSync(join(root, relPath)),
  });
  const before = new Set(parseRows(was).map((r) => r.path));
  const after = new Set(parseRows(text).map((r) => r.path));
  return {
    text,
    was,
    scope: scope.length,
    added: [...after].filter((p) => !before.has(p)),
    dropped: [...before].filter((p) => !after.has(p)),
  };
}

/** The same, written to disk. Returns what it wrote so the caller can say what moved. */
export function writeIndex(root: string): Regenerated {
  const out = regenerate(root);
  writeFileSync(join(root, "docs", "INDEX.md"), out.text);
  return out;
}
