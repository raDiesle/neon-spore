import type { Command } from "@neon-spore/sim";
import type { Hold } from "./touch-hold.js";

/**
 * **`RubCount` from one thumb** — a gesture a host has to keep count of, as it
 * does the pinch (`pinch.ts`), written for THE RIME's halves (§29). The chord
 * was the other, until THE TRIVET left the game on 8 October 2026.
 *
 * A rub is a thumb going back and forth, and what it sends is **how many times
 * it has turned back since it went down**: nought on the press, one more on
 * every reversal, and the last count with `on` false at the lift, which the
 * simulation reads as the count starting again. `touch.ts` answers one sample
 * at a time and keeps no state, so it cannot see a thumb turn: a press on a
 * rubbed face only takes hold, flagged `rub`, and its move and its lift say
 * nothing. The turns are counted by whoever owns the pointers
 * (`rub-turns.ts`); what a count *says* is this page's.
 */

/** How far back a thumb has to come before it has turned, in tiles — a jitter is not a rub. */
export const RUB_TURN = 0.25;

/** Whether a hold is a rubbing thumb, answered by the host that counts its turns. */
export function rubFinger(hold: Hold): hold is Extract<Hold, { kind: "drag" }> & { rub: true } {
  return hold.kind === "drag" && hold.rub === true;
}

/** What a rubbing thumb says: `turns` reversals since it went down, or — with `on` false — lifted. */
export function rubSays(
  hold: Extract<Hold, { kind: "drag" }>,
  turns: number,
  on: boolean,
): Command {
  return { kind: "drag", target: hold.target, on, fromMilli: 0, fromYMilli: 0, id: turns };
}
