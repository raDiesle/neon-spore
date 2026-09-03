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

import type { Item } from "./queue.js";

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

/**
 * The prompt a fresh session is opened with. Copy-pasteable and cold-readable:
 * it names the branch that was already created for it, so the session checks
 * that branch out rather than inventing a name the queue cannot recognise.
 */
export function promptFor(item: Item, branch: string): string {
  const from = item.source === "parked" ? "docs/parked.md" : "docs/queue.md";
  const tree = branch.replace(/^claude\//, "");
  return [
    `Work this item on Neon Spore. It is a technical improvement, not a look —`,
    `it lands on main like any refactor. Read CLAUDE.md first.`,
    "",
    `The branch is already made and is your claim on the item — check it out in`,
    `its own worktree, do not make another:`,
    "",
    `    git worktree add .claude/worktrees/${tree} ${branch}`,
    "",
    `then \`bun install\` from inside that tree (.claude/skills/lane says why).`,
    "",
    `## ${item.title}`,
    "",
    item.body,
    "",
    `When it is green: bun run check, commit, land. Remove the entry from`,
    `${from} in the same commit — \`bun run queue done "${item.title}"\`.`,
    `Landing deletes the branch, which is what releases the item.`,
    `If it turns out to be bigger than one session, leave what you finished`,
    `committed and rewrite the entry to say what is left.`,
  ].join("\n");
}
