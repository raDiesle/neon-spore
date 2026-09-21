/**
 * The `Taken:` line's own text: what one says, and the two branches to read
 * out of it.
 *
 * Split out of `claim.ts` on 21 September 2026, when a third reader of the
 * line took that file past the 250-line ceiling. The seam is the one the file
 * already had: everything here is a string in and a string out, with no item,
 * no refs and no repository anywhere near it, and `claim.ts` is the half that
 * decides what the answers *mean* — who holds an item, and whether that is the
 * caller.
 *
 * A mark carries **two** branches, and which is which matters. The first is
 * the branch the work is really on; the parenthesised one is what `branchFor`
 * derived from the title the day the claim was made, which is the only record
 * of the claimant once the title has changed.
 */

/**
 * What one `Taken:` line says: the day it was claimed, and the branch holding
 * it — `branch` when nobody said otherwise.
 *
 * `actual` is the branch the worktree making the claim really stands on,
 * asked for separately because it is not always `branch`: a session dealt one
 * of its own by a coordinator commits there and never touches the derived
 * `claude/queue-<slug>` again, so a mark naming only `branch` sent both the
 * listing and `heldElsewhere` looking for work that was never going to be on
 * it (19 September 2026). Said when it differs; left off for the ordinary
 * case, a session standing on the branch its own item derives.
 */
export function takenMark(branch: string, today: string, actual?: string): string {
  if (!actual || actual === branch) return `${today}, ${branch}`;
  return `${today}, ${actual} (claim: ${branch})`;
}

/**
 * The branch a `Taken:` mark says the work is really on — the one after the
 * date, and before the parenthesised claim branch when there is one.
 */
export function workedBranch(mark: string): string {
  const comma = mark.indexOf(", ");
  if (comma === -1) return "";
  const rest = mark.slice(comma + 2);
  const paren = rest.indexOf(" (claim:");
  return (paren === -1 ? rest : rest.slice(0, paren)).trim();
}

/**
 * The branch a mark names as the **claim** — the parenthesised one — or "" when
 * the mark has none, which is every mark written by a session standing on the
 * branch its own item derives.
 *
 * Read separately from `workedBranch` because **a title is not fixed.** A lane
 * that finishes half of an entry and rewrites the words has changed what
 * `branchFor` derives, so the claim it is holding is no longer a branch
 * anything computes and the worked branch in the mark is the predecessor that
 * has already landed. The one line left saying *this lane is the claimant* is
 * the `(claim: ...)`, and it says it by naming the lane's own `HEAD`. Until 21
 * September 2026 nothing read it, and the lane that had just rewritten the
 * entry was told the entry was somebody else's — twice on the sixteen-films
 * entry in two days, each time while holding the only claim there was.
 */
export function claimedBranch(mark: string): string {
  const paren = mark.indexOf(" (claim:");
  if (paren === -1) return "";
  return mark
    .slice(paren + " (claim:".length)
    .replace(/\)\s*$/, "")
    .trim();
}
