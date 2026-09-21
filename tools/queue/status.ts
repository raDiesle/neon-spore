/**
 * `bun run queue status` — DONE, IDLE or BUSY, and who is on what.
 *
 * Split out of `claim.ts` on 21 September 2026, when a lapsed claim needed
 * saying here and `claim.ts` was four lines under the ceiling. The seam is a
 * real one and not only the count: `claim.ts` answers *who holds this item*,
 * one item at a time, with no opinion about the queue as a whole. This is the
 * view over all of them, and it is the only part of the tool with a caller
 * that is a machine — a session told "shut down once the queue is finished"
 * reads the first word and counts nothing.
 *
 * It is also the reason the split had to be this way round rather than the
 * other: `lapsed.ts` asks `claim.ts` for the branch a title derives, so
 * anything in `claim.ts` that wanted a lapsed claim would have closed a cycle.
 */

import { claimOn } from "./claim.js";
import { type Lapsed, lapsed } from "./lapsed.js";
import type { Item } from "./queue.js";

/** An item somebody is on, and the branch saying so. */
export interface Ongoing {
  readonly item: Item;
  readonly branch: string;
  /** Set when no branch is left holding the claim and it is past the grace (`lapsed.ts`). */
  readonly lapsed?: Lapsed;
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

/**
 * `today` as `YYYY-MM-DD`, for the lapsed mark. Optional, and omitting it is
 * the honest answer rather than a default: a caller with no clock cannot know
 * how old a claim is, and a status that guessed would call a live cloud claim
 * abandoned on the strength of nothing.
 */
export function statusOf(
  items: readonly Item[],
  refs: readonly string[],
  today?: string,
  trunk = "main",
): Status {
  const ongoing: Ongoing[] = [];
  for (const item of items) {
    const branch = claimOn(item, refs);
    if (!branch) continue;
    const gone = today ? lapsed(item, refs, today, trunk) : undefined;
    ongoing.push(gone ? { item, branch, lapsed: gone } : { item, branch });
  }
  const waiting = items.length - ongoing.length;
  const state = items.length === 0 ? "done" : ongoing.length > 0 ? "busy" : "idle";
  return { state, ongoing, waiting };
}

/**
 * The status as lines, the word that answers first. DONE is nothing left at
 * all, IDLE is nothing in flight, BUSY is somebody still on something.
 *
 * **A lapsed claim is still BUSY**, and is marked rather than discounted. It
 * has to be: a missing ref is what a live cloud claim looks like from here,
 * and the whole of `lapsed.ts` is the argument for never acting on one
 * unasked. What the count was hiding is that some of its items are nobody's —
 * three of eight, the day this was written — so the number is said underneath
 * and the sentence that gives one back is said with it.
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
  const gone = status.ongoing.filter((o) => o.lapsed);
  return [
    `BUSY — ${n} ${n === 1 ? "item is" : "items are"} being worked on:`,
    ...status.ongoing.map(
      (o) => `       ${o.item.title} — ${o.branch}${o.lapsed ? " (lapsed)" : ""}`,
    ),
    `       ${rest}`,
    ...(gone.length === 0
      ? []
      : [
          `       ${gone.length} of them ${gone.length === 1 ? "is a lapsed claim" : "are lapsed claims"}: ` +
            "no branch is left holding them. They stay taken until somebody says",
          `       bun run queue release "<title>" — \`bun run queue\` names them.`,
        ]),
  ];
}
