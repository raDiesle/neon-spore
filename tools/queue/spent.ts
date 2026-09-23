/**
 * A claim a lane on this machine made, landed and walked away from.
 *
 * The handles entry was drained by eleven lanes on 22 September 2026, each on a
 * branch of its own, and each landed its piece and **narrowed the title** —
 * *Nine handles…*, *Seven…*, *Four…*, *Two…* — with its `Taken:` line left on
 * the entry. The next lane's `take` found that line, found the claim branch the
 * old title had derived still standing in the tree, and refused it: every one
 * of them ran `release` and then `take`, and read for a moment as if the queue
 * had lost track of itself.
 *
 * `lapsed.ts` says why nothing is given back on a *missing* ref: that is what a
 * live cloud claim looks like from here. This is the other case, and it is
 * decided on evidence that is present rather than absent. A claim branch that
 * is a **local** ref was made on this machine, by a worktree of this
 * repository; if no worktree stands on it or on the branch the mark says the
 * work is on, and neither holds a commit `main` has not got, then nobody here
 * is on it and nothing of theirs can be lost. A cloud claim never has a local
 * ref, so it can never read as spent.
 *
 * Only `take` asks, and only after `heldElsewhere` has said the item is held:
 * a caller who wrote a title out and meant to start work. The listing and
 * `next` still read the claim as held.
 */

import { branchFor } from "./claim.js";
import { gitIn } from "./git.js";
import { claimedBranch, workedBranch } from "./mark.js";
import type { Item } from "./queue.js";
import { ROOT, TRUNK } from "./tree.js";

/** What the rule needs to know of the repository, so a test can say it. */
export interface Branches {
  /** Whether the branch is a ref of this checkout's own, not origin's. */
  local(branch: string): boolean;
  /** Every branch some worktree of this repository has checked out. */
  checkedOut: ReadonlySet<string>;
  /** Whether every commit on the branch is already on `main`. */
  merged(branch: string): boolean;
}

/**
 * The branches a mark names — the worked one and the parenthesised claim, or
 * the one branch when the mark has no parenthesis — when all of them are
 * spent, or null when any might still be somebody's.
 */
export function spentBranches(mark: string, git: Branches): string[] | null {
  const named = [workedBranch(mark), claimedBranch(mark)].filter(Boolean);
  if (named.length === 0 || named.includes(TRUNK)) return null;
  if (!named.some((b) => git.local(b))) return null;
  for (const b of named) {
    if (git.checkedOut.has(b)) return null;
    if (git.local(b) && !git.merged(b)) return null;
  }
  return named.filter((b) => git.local(b));
}

/** `spentBranches` asked of the real repository. */
export function spentHere(item: Item, mark: string, root = ROOT): string[] | null {
  const run = (...args: string[]) => gitIn(root, ...args);
  const checkedOut = new Set(
    run("worktree", "list", "--porcelain")
      .out.split("\n")
      .filter((l) => l.startsWith("branch refs/heads/"))
      .map((l) => l.slice("branch refs/heads/".length)),
  );
  // The branch today's title derives is live only if a lane is on it, and
  // `heldElsewhere` has already answered for that one.
  if (checkedOut.has(branchFor(item))) return null;
  return spentBranches(mark, {
    local: (b) => run("rev-parse", "--verify", "--quiet", `refs/heads/${b}`).ok,
    checkedOut,
    merged: (b) => run("merge-base", "--is-ancestor", b, TRUNK).ok,
  });
}
