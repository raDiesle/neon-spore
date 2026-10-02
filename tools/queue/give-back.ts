/**
 * **A claim's `Taken:` line given back** — the half of `release` that writes.
 *
 * The line comes off the trunk's copy, and off this checkout's copy only when
 * this tree holds the claim. On 2 October 2026 a lapsed claim was released and
 * taken again from a worktree standing on another branch, one already landed:
 * the give-back cut the line out of that tree's copy, uncommitted, `take` then
 * stamped the trunk and made the claim branch, and `git checkout` of the
 * claim refused, because the tree's copy no longer matched its own `HEAD`.
 *
 * What the edit here was for is a lane giving back its **own** claim: its
 * copy of the file carries the line, and its landing would put it back. A tree
 * on some other branch carries the line only because its branch was cut from
 * a trunk that had it, and the landing's merge of this file takes the trunk's
 * copy of an entry the lane never touched (`tools/land/queue-merge.ts`). So
 * that tree is left as its `HEAD` has it.
 */

import { branchFor } from "./claim.js";
import { clearTaken } from "./edit.js";
import { claimedBranch, workedBranch } from "./mark.js";
import type { Item } from "./queue.js";
import { alsoHere, onTrunk } from "./repo.js";
import { headBranch, ROOT } from "./tree.js";

/** Whether the tree at `root` stands on the branch a mark names, or the claim's own. */
export function holdsClaim(item: Item, mark: string, root = ROOT): boolean {
  const here = headBranch(root);
  if (here === "") return false;
  return here === branchFor(item) || here === workedBranch(mark) || here === claimedBranch(mark);
}

/** The line `mark` off the trunk, and off this tree's copy when this tree holds the claim. */
export function giveBack(item: Item, mark: string, root = ROOT): void {
  const cut = (md: string): string => clearTaken(md, item.title);
  onTrunk(item, cut, `Give ${JSON.stringify(item.title)} back`, root);
  if (holdsClaim(item, mark, root)) alsoHere(item, cut, root);
}
