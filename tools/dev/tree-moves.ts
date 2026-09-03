/**
 * When the working tree was rewritten under a running server, and by whom.
 *
 * A hot bundler is incremental: it rebuilds the modules whose files changed
 * and keeps the rest. That is right for the thing it was designed for — a
 * person saving one file — and wrong for the thing git does, which is to
 * rewrite two hundred files over a second or two. The bundler starts
 * rebuilding on the first of them and finishes against a tree that is half
 * one revision and half another; the graph it caches from that build is a
 * chimera, and it stays cached. What the browser then shows is a bundle in
 * which one module imports a name the module beside it no longer exports, and
 * no amount of further editing repairs it. Only a fresh process does.
 *
 * So: notice that git moved the tree, wait for it to stop moving, and hand the
 * server a clean start. This file is the noticing; `supervise.ts` is the rest.
 */

import { readFileSync, statSync } from "node:fs";

/**
 * The git directory belonging to a checkout — where its `index` and `HEAD`
 * live, which is not the same place for a worktree as for the main tree. A
 * worktree's `.git` is a *file* pointing at `…/.git/worktrees/<name>`, and
 * that directory, not the main one, is what its own rebase writes.
 */
export function gitDirOf(root: string): string | undefined {
  const dot = `${root.replaceAll("\\", "/").replace(/\/+$/, "")}/.git`;
  try {
    if (statSync(dot).isDirectory()) return dot;
  } catch {
    return undefined;
  }
  const pointer = /^gitdir:\s*(.+)$/m.exec(readFileSync(dot, "utf8"));
  if (!pointer) return undefined;
  const target = pointer[1]!.trim().replaceAll("\\", "/").replace(/\/+$/, "");
  const absolute = target.startsWith("/") || /^[a-zA-Z]:\//.test(target);
  return absolute ? target : `${dot.slice(0, -"/.git".length)}/${target}`;
}

/**
 * The files git writes at the top of a git directory when the *working tree*
 * has been rewritten. `index` is the one that matters and the only one common
 * to every way of doing it — a merge, a rebase, a pull, `checkout <branch>`
 * and `checkout -- <paths>` all rewrite it, and the last of those moves no ref
 * at all, so a rule watching only `HEAD` would miss it. The heads are here
 * anyway because they cost nothing and they say which operation it was.
 *
 * `index.lock` is deliberately absent: it is the sign that git is still
 * *writing*, and is asked about separately — see `locked` below.
 */
const MOVES = new Set([
  "index",
  "HEAD",
  "ORIG_HEAD",
  "MERGE_HEAD",
  "REBASE_HEAD",
  "CHERRY_PICK_HEAD",
  "REVERT_HEAD",
]);

/**
 * The whole name, not its last segment: `logs/HEAD` is the reflog and moves
 * nothing, and a rule that looked only at the basename would restart the
 * server on every commit anybody made anywhere.
 */
export function isTreeMove(name: string): boolean {
  return MOVES.has(name.replaceAll("\\", "/"));
}

/** Whether git still holds the index — a rewrite in flight, not a finished one. */
export function locked(gitDir: string): boolean {
  try {
    statSync(`${gitDir}/index.lock`);
    return true;
  } catch {
    return false;
  }
}
