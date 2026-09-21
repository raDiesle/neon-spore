/**
 * A claim with nothing left holding it up.
 *
 * `claimOn` answers off the branch first and falls back to the entry's own
 * `Taken:` line. The fallback is not a mistake: a session working in its own
 * clone of `origin` — every cloud session — makes a claim no local ref can
 * ever show, and without the line two of them drain the same six items (3
 * September 2026). But a fallback with nothing behind it never expires. Three
 * entries sat in `docs/queue.md` in that state on 21 September 2026, marked
 * from `main` with claim branches that no tree holds any more, and
 * `bun run queue` counted all three BUSY while `next` stepped over them.
 *
 * **Nothing is released automatically here, and nothing may be.** A missing
 * ref is exactly what a live cloud claim looks like from a local checkout, so
 * a rule that gave an item back on one would hand out work somebody is doing.
 * What this file does is *say it*: an old claim with no branch left is printed
 * as **lapsed**, still counted as taken, with the one sentence that releases
 * it. A session reads the sentence and decides; the queue never decides.
 *
 * The grace is `GRACE_DAYS`, and it is the whole of the judgement. A claim
 * made today with no ref is an ordinary cloud session halfway through its
 * first turn. A claim made yesterday with no ref is a branch that landed under
 * a title that changed, a sweep that ran, or a session that stopped.
 */

import { branchFor } from "./claim.js";
import { claimedBranch, workedBranch } from "./mark.js";
import type { Item } from "./queue.js";

/**
 * Whole days a branchless claim is left alone: **one**, which is the day it
 * was made and nothing after it.
 *
 * The grace exists for the one case that legitimately has no ref — a session
 * in its own clone of `origin`, whose branch reaches the remote when it pushes
 * and not before. `CLAUDE.md` has such a session push its branch at the end of
 * every turn, so a whole clear day with none is already generous.
 *
 * And the two directions do not cost the same. Nothing is released here; a
 * lapsed claim is a *sentence*, and one printed a day early costs a reader a
 * moment's thought, while one printed a week late is the three entries that
 * sat in `docs/queue.md` reading BUSY with nobody behind them. So the short
 * grace, and the wording that assumes the reader knows better than the tool.
 */
export const GRACE_DAYS = 1;

/** The day a `Taken:` mark was written — the text before the first comma. */
export function takenDate(mark: string): string {
  return /^\d{4}-\d{2}-\d{2}/.exec(mark.trim())?.[0] ?? "";
}

/** Whole days from one `YYYY-MM-DD` to another, or null when either is unreadable. */
export function daysBetween(from: string, to: string): number | null {
  const at = (d: string): number | null => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
  };
  const a = at(from);
  const b = at(to);
  return a === null || b === null ? null : Math.round((b - a) / 86_400_000);
}

/** `origin/claude/queue-x` and `claude/queue-x` are the same branch. */
function bare(ref: string): string {
  return ref.startsWith("origin/") ? ref.slice("origin/".length) : ref;
}

/**
 * Whether a branch name is one a claim can still be standing on.
 *
 * **The trunk is not**, and that is the case the three stuck entries were in:
 * `bun run queue take` run from the main checkout writes `main` as the worked
 * branch, because that is where `HEAD` was. `main` exists forever, so a mark
 * naming it would read as live forever if the name alone were asked — while
 * the thing that actually held the item, the parenthesised claim branch, had
 * been gone for a day. A lane branch is a claim; the trunk is where work goes
 * when it is finished being one.
 */
function standing(name: string, refs: readonly string[], trunk: string): boolean {
  // `origin/main` and `main` are the same trunk, the way `origin/claude/…` and
  // `claude/…` are the same claim: a clone that never made a local `main` is
  // the case `trunkRef` exists for, and a mark written there still says `main`.
  if (name === "" || bare(name) === bare(trunk)) return false;
  return refs.some((r) => bare(r.trim()) === name);
}

/** Why a claim reads as lapsed: the day it was made, and how long ago that is. */
export interface Lapsed {
  readonly since: string;
  readonly days: number;
}

/**
 * Whether this item's claim has outlived every branch that could hold it.
 *
 * All three names are asked, because a claim is allowed to be on any of them:
 * the branch the title derives (`branchFor`), the branch the mark says the
 * work is really on, and the parenthesised one a retitle leaves behind
 * (`mark.ts`). One live ref among them is a live claim and there is nothing
 * to say.
 *
 * `undefined` for an item nobody has taken, for a mark with no readable date —
 * `problemsIn` is the one that complains about a malformed entry — and for
 * anything still inside the grace.
 */
export function lapsed(
  item: Item,
  refs: readonly string[],
  today: string,
  trunk = "main",
): Lapsed | undefined {
  if (!item.taken) return undefined;
  const names = [branchFor(item), workedBranch(item.taken), claimedBranch(item.taken)];
  if (names.some((n) => standing(n, refs, trunk))) return undefined;
  const since = takenDate(item.taken);
  const days = daysBetween(since, today);
  if (days === null || days < GRACE_DAYS) return undefined;
  return { since, days };
}

/**
 * The listing's line under a lapsed entry.
 *
 * It ends in the command rather than describing it. The entry stays taken
 * until a session says those words, so the words are what the line is for —
 * and the title is spelled out inside them, because `release` by a position is
 * the thing that renumbers out from under a reader (`refuseNumbered`).
 */
export function lapsedLine(item: Item, l: Lapsed): string {
  return (
    `lapsed — claimed ${l.since}, ${l.days === 1 ? "a day" : `${l.days} days`} ago, and ` +
    "no branch is holding it any more; " +
    `if nobody is on it: bun run queue release ${JSON.stringify(item.title)}`
  );
}
