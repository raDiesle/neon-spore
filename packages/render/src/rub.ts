import type { Command } from "@neon-spore/sim";
import type { Hold } from "./touch-hold.js";

/**
 * **`RubCount` from one thumb** — the one gesture a host has to keep count
 * of, written for THE RIME's halves (§29), which left the game on 9 October
 * 2026. The chord and THE VISE's pinch were the others, until the owner
 * ruled one finger a player on 8 October 2026.
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

/**
 * What a rubbing thumb says: `turns` reversals since it went down, or — with
 * `on` false — lifted. THE BLISTER's is the one rub on a body there may be
 * several of, and `id` is the count, so the body rides `fromMilli`
 * (`sim/blister-rub.ts`); every other rub's is nought.
 */
export function rubSays(
  hold: Extract<Hold, { kind: "drag" }>,
  turns: number,
  on: boolean,
): Command {
  const fromMilli = hold.target === "blisterRub" ? (hold.id ?? 0) : 0;
  return { kind: "drag", target: hold.target, on, fromMilli, fromYMilli: 0, id: turns };
}
