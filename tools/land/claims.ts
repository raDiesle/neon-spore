/**
 * Which of the branches a landing finds merged are really queue claims, and
 * therefore not the landing's to delete.
 *
 * Split out of `sweep.ts` only because that file reached its length limit; the
 * rule belongs beside the sweep and nowhere else. What a claim *is* comes from
 * `tools/queue/claim.ts`, which creates them — spelling the prefix out again
 * here would be a second copy of the same rule, and the two would drift.
 */

import { isClaimBranch } from "../queue/claim.js";

/** Merged branches, split into the ones a landing may delete and the ones it may not. */
export interface MergedBranches {
  /** Spent: the lane that just landed, and every merged branch that is not a claim. */
  spent: string[];
  /** Claims other sessions are holding, which only look merged. */
  claims: string[];
}

/**
 * `git branch --merged main` answers a question about ancestry, and a queue
 * claim is not an answer to that question. `bun run queue next` claims an item
 * by creating `claude/queue-<slug>` off `main` and nothing else — no commit, no
 * worktree yet — so the branch points at `main`'s tip and reads as fully
 * merged from the first second it exists. The sweep at the end of *any other*
 * lane's landing then deleted it, and both sessions running on 3 September 2026
 * lost every claim they held within minutes of the other one landing. They
 * went on to do the same queue item twice, and one of the two commits was
 * thrown away at the rebase along with the session that wrote it.
 *
 * So a claim survives every landing but its own. `landing` is the lane this
 * process is putting on the trunk: when that lane *is* a claim branch, the item
 * has just reached `main` and deleting the branch is exactly what releases it,
 * which is the contract `docs/queue.md` describes. Any other claim belongs to a
 * session that is still working, and nothing here knows better than that
 * session does.
 *
 * A claim nobody is on is given back by hand — `bun run queue release <n>` —
 * rather than swept, because "no commits yet" and "abandoned" are the same
 * shape and only one of them wants deleting.
 */
export function partitionMerged(merged: readonly string[], landing: string): MergedBranches {
  const spent: string[] = [];
  const claims: string[] = [];
  for (const name of merged) {
    if (name !== landing && isClaimBranch(name)) claims.push(name);
    else spent.push(name);
  }
  return { spent, claims };
}
