#!/usr/bin/env bun

/**
 * `bun run here` — say which tree the next `director-here` should serve.
 *
 * The desktop harness starts a `.claude/launch.json` entry in the directory
 * the *session* was opened in. A session that opened in the main checkout and
 * then made itself a worktree (`.claude/skills/lane`) still launches from the
 * main checkout, so `preview_start` with any entry served `main`'s code with
 * nothing erroring — a verified result off the wrong bundle, twice in one
 * afternoon on 7 September 2026 and again on the 12th. The entry cannot be
 * told a `cwd`, and the harness cannot be told a tree.
 *
 * So the tree is written down where every checkout of this repository can
 * read it: in the git directory they share (`.git/` of the main checkout,
 * which a worktree's own git directory points back at through `commondir`).
 * `bun run here`, run from inside the tree to be served, writes that tree's
 * path there; `supervise.ts --here` reads it and binds to that tree instead
 * of to the one it was started in. Run from the main checkout, `bun run here`
 * points the file back at `main`, which is how it is cleared.
 *
 * One pointer for the whole repository, and the last writer wins — two lanes
 * at once would take turns, which is the case `docs/git-and-landing.md` says
 * not to be in anyway. The file lives inside `.git`, so no tree ever sees it
 * as a change to commit.
 */

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { gitDirOf } from "./tree-moves.js";

/** The one file, under the git directory the trees share. */
export const HERE_FILE = "neon-spore-here";

/**
 * The git directory *all* checkouts of this repository share. For the main
 * checkout that is its own `.git`; for a worktree, the directory its own git
 * directory names in `commondir` — relative to itself, in git's own habit.
 */
export function commonGitDir(root: string): string | undefined {
  const own = gitDirOf(root);
  if (own === undefined) return undefined;
  const common = `${own}/commondir`;
  if (!existsSync(common)) return own;
  return resolve(own, readFileSync(common, "utf8").trim()).replaceAll("\\", "/");
}

/** Where the pointer lives for the repository `root` belongs to, if it is one. */
export function hereFile(root: string): string | undefined {
  const common = commonGitDir(root);
  return common === undefined ? undefined : `${common}/${HERE_FILE}`;
}

/**
 * The tree a `--here` server should serve when started from `cwd`: the one the
 * pointer names, when there is a pointer and it still names a checkout;
 * `cwd` itself otherwise, so a session that opened in its worktree — where the
 * harness already starts things in the right place — needs no pointer at all.
 */
export function hereRoot(cwd: string): string {
  const file = hereFile(cwd);
  if (file === undefined || !existsSync(file)) return cwd;
  const tree = readFileSync(file, "utf8").trim();
  try {
    if (tree !== "" && statSync(`${tree}/package.json`).isFile()) return tree;
  } catch {
    // The tree was swept; the pointer is stale and the session's own tree wins.
  }
  return cwd;
}

/** Write `tree` as the pointer for its repository; returns the file written. */
export function writeHere(tree: string): string {
  const file = hereFile(tree);
  if (file === undefined) throw new Error(`${tree} is not a git checkout`);
  writeFileSync(file, `${tree.replaceAll("\\", "/").replace(/\/+$/, "")}\n`);
  return file;
}

if (import.meta.main) {
  const tree = process.cwd();
  const file = writeHere(tree);
  console.log(`director-here now serves ${tree}`);
  console.log(`(written to ${file}; run this from the main checkout to point it back)`);
}
