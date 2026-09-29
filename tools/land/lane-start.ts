/**
 * Where a lane started, as git remembers it — the impure half of `stamp.ts`'s
 * `laneStart`, which decides between what these two find.
 *
 * Split out of `note-commit.ts`, which writes the landing's bookkeeping; this
 * only asks the repository two questions about the lane's past.
 */

import { git } from "./git.js";

/**
 * When the trunk's `Mark "…" taken` commits that name this branch were
 * authored. `queue take` writes the branch into the `Taken:` line, as the
 * session's or as the claim's, so a pickaxe on the name finds the claim
 * whichever of the two the lane is standing on.
 */
export async function claimTimes(tree: string, branch: string, trunk: string): Promise<number[]> {
  if (!branch) return [];
  const out = await git(
    [
      "log",
      trunk,
      "--format=%at",
      '--grep=^Mark ".*" taken$',
      `-S${branch}`,
      "--",
      "docs/queue.md",
    ],
    tree,
  );
  return out.split(/\r?\n/).filter(Boolean).map(Number);
}

/** When the branch was made, from the oldest entry in its reflog, if that entry says so. */
export async function branchMade(tree: string, branch: string): Promise<number | undefined> {
  if (!branch) return undefined;
  const out = await git(
    ["reflog", "show", "--date=unix", "--format=%gd%x09%gs", `refs/heads/${branch}`],
    tree,
  );
  const oldest = out.split(/\r?\n/).filter(Boolean).at(-1) ?? "";
  const match = oldest.match(/@\{(\d+)\}\tbranch: Created/);
  return match ? Number(match[1]) : undefined;
}
