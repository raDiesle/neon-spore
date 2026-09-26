/**
 * Where this checkout is, and what refs it has: the facts every other question
 * about the repository is asked on top of.
 *
 * Split out of `repo.ts` on 21 September 2026, when `unmark` took that file
 * past the 250-line ceiling. These are the primitives — a path, a ref, a `git`
 * — and nothing here writes anything. `repo.ts` is still the one file the tool
 * imports from: it re-exports what it does not use itself, so a split made for
 * the ceiling's sake did not become a rename in six call sites.
 *
 * `trunkRef`, `trunkView` and `trunkTree` followed on 26 September 2026, when
 * a refused claim push (`claim-push.ts`) brought `repo.ts` near the ceiling
 * again: they only read where the trunk is.
 */

import { dirname, join } from "node:path";
import { gitIn } from "./git.js";
import type { Trunk } from "./stale.js";

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

/**
 * This tree's path when it is a clean worktree of its own — not the main
 * checkout, nothing uncommitted — and "" otherwise. A desktop session opened in
 * such a tree may write nowhere else, so a claimed branch is checked out where
 * it stands rather than in a new tree it could not edit (`prompt.ts`).
 */
export function sessionTree(root = ROOT): string {
  const dir = gitIn(root, "rev-parse", "--path-format=absolute", "--git-dir");
  const common = gitIn(root, "rev-parse", "--path-format=absolute", "--git-common-dir");
  if (!dir.ok || !common.ok || dir.out === common.out) return "";
  const status = gitIn(root, "status", "--porcelain");
  if (!status.ok || status.out !== "") return "";
  const top = gitIn(root, "rev-parse", "--show-toplevel");
  return top.ok ? top.out : "";
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

/**
 * The branch a fresh claim's work will really be on.
 *
 * The branch `claim` makes checks nothing out, so the worktree's own `HEAD`
 * is still whatever it was — the branch a coordinator dealt this session, most
 * of the time, and the right answer for `take`, which drains several items on
 * the one lane it stands on. **`next` from a clean worktree of its own is the
 * exception** (`dealt`): its prompt tells that session to `git checkout` the
 * claim right there (`sessionTree`, `prompt.ts`), so its `HEAD` is the lane it
 * has just landed and will never commit on again. Until 26 September 2026 the
 * mark named that spent branch as the worked one.
 */
export function workedOn(branch: string, root = ROOT, dealt = false): string {
  return dealt && sessionTree(root) ? branch : headBranch(root);
}

/** Every branch this checkout can see — its own and, if it has one, origin's. */
export function refs(): string[] {
  const r = git("for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/remotes/origin");
  return r.out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * The trunk as a ref this checkout can read: its own `main`, or origin's copy
 * in a clone that checked out one lane by name and never made a `main`.
 */
export function trunkRef(): string {
  return hasBranch(TRUNK) ? TRUNK : `origin/${TRUNK}`;
}

/** The trunk's files and log, the shape `stale.ts` reads an entry against. */
export function trunkView(): Trunk {
  const ref = trunkRef();
  return {
    tree: git("ls-tree", "-r", "--name-only", ref).out.split("\n").filter(Boolean),
    log: (paths) => git("log", "-1", "--format=%h%x09%cs%x09%s", ref, "--", ...paths),
  };
}

/** The worktree holding the trunk, or "" when nothing has it checked out. */
export function trunkTree(root = ROOT): string {
  let path = "";
  for (const line of gitIn(root, "worktree", "list", "--porcelain").out.split("\n")) {
    if (line.startsWith("worktree ")) path = line.slice("worktree ".length).trim();
    if (line.trim() === `branch refs/heads/${TRUNK}`) return path;
  }
  return "";
}
