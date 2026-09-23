/**
 * Where this checkout is, and what refs it has: the facts every other question
 * about the repository is asked on top of.
 *
 * Split out of `repo.ts` on 21 September 2026, when `unmark` took that file
 * past the 250-line ceiling. These are the primitives — a path, a ref, a `git`
 * — and nothing here writes anything. `repo.ts` is still the one file the tool
 * imports from: it re-exports what it does not use itself, so a split made for
 * the ceiling's sake did not become a rename in six call sites.
 */

import { dirname, join } from "node:path";
import { gitIn } from "./git.js";

export const ROOT = join(import.meta.dirname, "..", "..");
export const PATHS = {
  queue: join(ROOT, "docs", "queue.md"),
  parked: join(ROOT, "docs", "parked.md"),
};
export const TRUNK = "main";

export function git(...args: string[]): { ok: boolean; out: string; err: string } {
  return gitIn(ROOT, ...args);
}

/**
 * The main checkout's absolute path, from any worktree of it: the directory
 * holding the repository's shared `.git`. A new lane's worktree goes under
 * this, never under the tree the asking session happens to stand in.
 */
export function mainCheckout(root = ROOT): string {
  const r = gitIn(root, "rev-parse", "--path-format=absolute", "--git-common-dir");
  return r.ok ? dirname(r.out) : root;
}

/** Whether this checkout has the branch itself, rather than origin's copy of it. */
export function hasBranch(branch: string): boolean {
  return git("rev-parse", "--verify", "--quiet", `refs/heads/${branch}`).ok;
}

/**
 * The branch this tree is standing on, or "" when it is on a detached HEAD.
 * `root` defaults to the real repository; `claim` below asks it of the
 * worktree it was given, which a test points at a scratch repository of
 * its own.
 */
export function headBranch(root = ROOT): string {
  const r = gitIn(root, "rev-parse", "--abbrev-ref", "HEAD");
  return r.ok && r.out !== "HEAD" ? r.out : "";
}

/** Every branch this checkout can see — its own and, if it has one, origin's. */
export function refs(): string[] {
  const r = git("for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/remotes/origin");
  return r.out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
