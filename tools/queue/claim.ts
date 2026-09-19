/**
 * Who is already working on a queue item.
 *
 * A claim is written in two places, because neither one alone is visible to
 * everybody who needs it.
 *
 * The **branch** is instant. Worktrees of one repository share their refs, so
 * `claude/queue-<slug>` created by one lane is visible to the next
 * `bun run queue` with no commit and no push, and `git branch` failing is what
 * stops `next` handing the same item to two sessions. `bun run land` deletes
 * it, which releases the claim exactly when the work reaches `main`.
 *
 * The **`Taken:` line on `main`** is the half a branch cannot do. A session in
 * its own clone — every cloud session, and every session that never runs
 * `bun run queue next` at all — sees only what `origin` carries, and a local
 * ref is nothing to it. So `next` also writes the line into `docs/queue.md` on
 * `main` and pushes it, which is the first thing anybody reads before starting.
 * This used to be argued against here, on the grounds that a mark has to be
 * committed to be seen and the session that took the item has not committed
 * anything yet. That argument was about a mark on the *lane's* branch. Committed
 * straight to `main`, it is visible the moment it is made — and on 3 September
 * 2026 two sessions did the same six items in parallel for want of it.
 */

import type { Item, Match } from "./queue.js";

const PREFIX = "claude/queue-";

/** A title, as a branch-safe name. Stable, so the same item always claims the same branch. */
export function slugFor(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/, "");
  return slug || "item";
}

/** The branch that means "somebody is on this". */
export function branchFor(item: Item): string {
  return `${PREFIX}${slugFor(item.title)}`;
}

/**
 * Whether a branch name is a claim on some queue item, whichever item that is.
 *
 * `bun run land` needs this and cannot get it from `branchFor`, which wants the
 * item: the sweep is looking at a list of branch names with no queue in hand.
 * It asks here rather than spelling the prefix out again, because a claim that
 * the sweep does not recognise is a claim the sweep deletes — which is what it
 * did on 3 September 2026, to two sessions at once.
 */
export function isClaimBranch(name: string): boolean {
  return name.startsWith(PREFIX);
}

/** `origin/claude/queue-x` and `claude/queue-x` are the same claim. */
function bare(ref: string): string {
  return ref.startsWith("origin/") ? ref.slice("origin/".length) : ref;
}

/** What one `Taken:` line says: the day it was claimed, and the branch holding it. */
export function takenMark(branch: string, today: string): string {
  return `${today}, ${branch}`;
}

/**
 * Who has this item, or undefined when nobody has.
 *
 * The branch answers first because it is the more current of the two: it is
 * gone the instant the lane lands, whereas the `Taken:` line goes with the
 * entry itself and so cannot outlive it either. The line is what answers in a
 * clone that has never seen the branch, and it is the one that would have
 * spoken up on 3 September 2026.
 */
export function claimOn(item: Item, refs: readonly string[]): string | undefined {
  const branch = branchFor(item);
  if (refs.some((r) => bare(r.trim()) === branch)) return branch;
  return item.taken || undefined;
}

/**
 * Whether an item is somebody *else's*, said as the branch holding it.
 *
 * The number in a listing is not a name. It renumbers every time an entry
 * leaves the file, so a session draining two items reads the list once, says
 * `queue done 1`, and finds that 2 has become a third entry that moved up. That
 * happened on 9 September 2026: `done 2` took out an `Asks:` entry another lane
 * was standing in, and it was caught only because the branch it went on to
 * delete was checked out and refused to go. The recovery was
 * `git checkout docs/queue.md`, which the next session would not have known to
 * make.
 *
 * So a claim is asked about before a number is obeyed. The two ways past it are
 * the two that cannot be a stale number: the tree whose own `HEAD` is the claim
 * — the session that took the item — and a caller who wrote the title out.
 */
export function heldElsewhere(
  item: Item,
  refs: readonly string[],
  head: string,
): string | undefined {
  if (branchFor(item) === head) return undefined;
  return claimOn(item, refs);
}

/**
 * **The guard a position has to get past**, and it is not the same guard for
 * every verb.
 *
 * `heldElsewhere` above is the half that asks who is standing on the item, and
 * it is enough for a verb that can be undone: `release` by a stale number gives
 * a free item back, which is a sentence saying nobody was on it and nothing
 * else. It is **not** enough for `done`, and 19 September 2026 is why. A lane
 * closing an item had first written its own finding into `docs/queue.md` —
 * which the queue's own preamble *requires*, in the commit that found it — and
 * that entry sorted above the one being closed. The listing the lane had read a
 * few minutes earlier was stale by exactly one row. `done 18` resolved onto a
 * free entry nobody had worked, removed it, named it, and exited zero.
 *
 * So the two rules are in conflict — file a finding as you go, and read your
 * number off a list — and this is the place to settle it: **a removal is never
 * taken off a position.** `done` passes `removes`, and then a number gets no
 * further however free the entry it landed on is. The refusal prints the title
 * the number *did* resolve to, so the caller reads the same sentence that
 * caught the incident, except now before the deletion rather than after it.
 *
 * A title is let through both halves, and that is the deliberate way out: a
 * caller who wrote the words out has said which entry they mean, and no amount
 * of renumbering can move what they said onto another one.
 */
export function refuseNumbered(
  m: Match,
  verb: string,
  held: string | undefined,
  removes: boolean,
): void {
  if (m.how === "title") return;
  const say = `bun run queue ${verb} ${JSON.stringify(m.item.title)}`;
  if (removes) {
    throw new Error(
      `${verb} takes a title, not a position: the listing renumbers the moment an ` +
        `entry leaves the file, and this lane may have added one itself. ` +
        `${JSON.stringify(m.item.title)} is what that number is on now — ` +
        `if it is the one you mean, say it: ${say}`,
    );
  }
  if (!held) return;
  throw new Error(
    `${JSON.stringify(m.item.title)} is taken — ${held} — and a position is not a name: ` +
      `the listing renumbers. Say it in words if you mean it: ${say}`,
  );
}

/** The items nobody has taken, in queue order. */
export function unclaimed(items: readonly Item[], refs: readonly string[]): Item[] {
  return items.filter((i) => claimOn(i, refs) === undefined);
}

/** An item somebody is on, and the branch saying so. */
export interface Ongoing {
  readonly item: Item;
  readonly branch: string;
}

/**
 * Whether anything is being worked on right now, in the three states worth
 * telling apart. `busy` is the one that matters: it is the answer to "is the
 * queue still moving", which is a question asked of a machine that is about to
 * be turned off, and it has to be answerable without reading a list.
 */
export interface Status {
  readonly state: "done" | "idle" | "busy";
  readonly ongoing: readonly Ongoing[];
  /** Items nobody has taken. */
  readonly waiting: number;
}

export function statusOf(items: readonly Item[], refs: readonly string[]): Status {
  const ongoing: Ongoing[] = [];
  for (const item of items) {
    const branch = claimOn(item, refs);
    if (branch) ongoing.push({ item, branch });
  }
  const waiting = items.length - ongoing.length;
  const state = items.length === 0 ? "done" : ongoing.length > 0 ? "busy" : "idle";
  return { state, ongoing, waiting };
}

/**
 * The status as lines, the word that answers first. A session told "shut the
 * machine down once the queue is finished" reads one word and counts nothing:
 * DONE is nothing left at all, IDLE is nothing in flight, BUSY is somebody
 * still on something.
 */
export function statusLines(status: Status): string[] {
  if (status.state === "done") {
    return ["DONE — the queue is empty and nothing is being worked on."];
  }
  const rest = `${status.waiting} waiting.`;
  if (status.state === "idle") {
    return ["IDLE — nothing is being worked on.", `       ${rest}`];
  }
  const n = status.ongoing.length;
  return [
    `BUSY — ${n} ${n === 1 ? "item is" : "items are"} being worked on:`,
    ...status.ongoing.map((o) => `       ${o.item.title} — ${o.branch}`),
    `       ${rest}`,
  ];
}
