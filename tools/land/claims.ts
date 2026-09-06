/**
 * Which of the branches a landing finds merged are really queue claims, and
 * therefore not the landing's to delete.
 *
 * Split out of `sweep.ts` only because that file reached its length limit; the
 * rule belongs beside the sweep and nowhere else. What a claim *is* comes from
 * `tools/queue/claim.ts`, which creates them — spelling the prefix out again
 * here would be a second copy of the same rule, and the two would drift. The
 * same goes for the slug an entry claims under and for the shape of the two
 * files entries live in: both are called, not re-derived.
 */

import { join } from "node:path";
import { branchFor, isClaimBranch } from "../queue/claim.js";
import { parseItems } from "../queue/queue.js";

/** Merged branches, split into the ones a landing may delete and the ones it may not. */
export interface MergedBranches {
  /** Spent: the lane that just landed, and every merged branch that is not a live claim. */
  spent: string[];
  /** Claims other sessions are holding, which only look merged. */
  claims: string[];
}

/**
 * The branch each entry the queue still holds would be claimed under.
 *
 * A claim is a branch *and* an entry, and the entry is the half that says the
 * item is still somebody's: `bun run queue done` takes it out at the moment the
 * work reaches `main`. So the set this returns is what `partitionMerged` needs
 * to tell a claim from the husk of one, and it is built by asking `branchFor`
 * rather than by matching the prefix a second time.
 *
 * `undefined` when either file cannot be read, which means "protect every
 * claim". An unreadable queue is not evidence that nobody is working, and the
 * cost of the two mistakes is not the same: keeping a spent branch leaves
 * litter, and deleting a live one loses a session's afternoon.
 */
export async function liveClaims(tree: string): Promise<Set<string> | undefined> {
  const live = new Set<string>();
  for (const source of ["queue", "parked"] as const) {
    const file = Bun.file(join(tree, "docs", `${source}.md`));
    const md = await file.text().catch(() => undefined);
    if (md === undefined) return undefined;
    for (const item of parseItems(md, source)) live.add(branchFor(item));
  }
  return live;
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
 * which is the contract `docs/queue.md` describes.
 *
 * **`live` is what makes that a claim rather than a name.** A branch is only
 * ever deleted by its own landing, so a session draining several items with
 * `bun run land --keep` and sweeping once at the end used to delete exactly one
 * of them: the sweep on 6 September 2026 kept eleven `claude/queue-*` branches
 * whose entries `bun run queue done` had already removed, on top of four left
 * standing by earlier sessions, and none could be given back because
 * `bun run queue release` needs the entry that went away. An entry is half of
 * a claim, so a branch with no entry behind it is spent and a landing may
 * delete it like any other. Pass `undefined` to protect every claim, which is
 * what a queue that could not be read means.
 *
 * A claim whose entry is still there is left alone whatever it looks like:
 * "no commits yet" and "abandoned" are the same shape, and only one of them
 * wants deleting. That one is given back by hand — `bun run queue release <n>`.
 */
export function partitionMerged(
  merged: readonly string[],
  landing: string,
  live?: ReadonlySet<string>,
): MergedBranches {
  const spent: string[] = [];
  const claims: string[] = [];
  for (const name of merged) {
    const held = isClaimBranch(name) && (live === undefined || live.has(name));
    if (name !== landing && held) claims.push(name);
    else spent.push(name);
  }
  return { spent, claims };
}
