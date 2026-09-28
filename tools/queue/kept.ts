/**
 * A claim branch that is already standing when `claim` goes to make it, and
 * whether it may be handed back rather than refused.
 *
 * An entry worked one lane at a time — the mark-feedback roll-out, one boss a
 * lane — is landed with `bun run land --keep`, which leaves the claim branch
 * standing and checked out, and each landing takes the `Taken:` line off with
 * the entry's rewritten words. So the next lane's `take` is a fresh claim on a
 * branch that already exists, and until 28 September 2026 `git branch` refused
 * it (*a branch named … already exists*). The branch holds nothing `main` has
 * not got, and it is this tree's own, so there is nobody to protect it from.
 *
 * Handed back only when nothing can be lost: its tip is on the trunk, and no
 * *other* worktree stands on it — that one is a lane mid-work, and its claim is
 * refused as it always was.
 */

import { gitIn } from "./git.js";
import { headBranch, TRUNK } from "./tree.js";

/**
 * - `null` — no such branch; `claim` makes it.
 * - `"here"` — this tree stands on it; moved by a fast-forward, since
 *   `git branch --force` cannot move a branch that is checked out.
 * - `"free"` — nobody stands on it; moved with `git branch --force`.
 * - `{ refused }` — why it cannot be handed back.
 */
export type Kept = null | "here" | "free" | { refused: string };

export function keptClaim(branch: string, root: string): Kept {
  if (!gitIn(root, "rev-parse", "--verify", "--quiet", `refs/heads/${branch}`).ok) return null;
  if (!gitIn(root, "merge-base", "--is-ancestor", branch, TRUNK).ok) {
    return { refused: `${branch} holds commits ${TRUNK} has not got` };
  }
  if (headBranch(root) === branch) return "here";
  const out = gitIn(root, "worktree", "list", "--porcelain").out.split("\n");
  if (out.some((l) => l.trim() === `branch refs/heads/${branch}`)) {
    return { refused: `another worktree stands on ${branch}` };
  }
  return "free";
}

/** Move a handed-back claim onto the trunk's tip, the way `claim` moves a new one. */
export function moveKept(branch: string, kept: "here" | "free", root: string): void {
  const moved =
    kept === "here"
      ? gitIn(root, "merge", "--ff-only", "-q", TRUNK)
      : gitIn(root, "branch", "--force", branch, TRUNK);
  if (!moved.ok) {
    throw new Error(
      `the claim is marked on ${TRUNK}, but ${branch} could not follow it: ${moved.err}` +
        (kept === "here" ? ` — \`git merge --ff-only ${TRUNK}\` once the tree is clean` : ""),
    );
  }
}
