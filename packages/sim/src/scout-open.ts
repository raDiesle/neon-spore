import type { ScoutPoint, ScoutState } from "./scout.js";
import { scoutCurrent } from "./scout.js";

/**
 * **Standing THE SCOUT up**: where home is, and one arena set out as authored.
 *
 * Cut off `scout.ts` on `snake-open.ts`' and `pinball-open.ts`' terms and for
 * their reason — that file is the *shape* of the round and this is the half of
 * it that writes. It came out the day the round gained a second axis of state
 * and took `scout.ts` sixty lines over its limit.
 */

/**
 * Where the mother ship sits, in thousandths of a tile: the bottom middle of
 * the arena, which is where the hull has always been.
 *
 * Read off the field's own size rather than authored, for `mazeCenterMilli`'s
 * reason: a home an author could move would be a different round on a narrow
 * field, and the one thing every arena has in common is where home is.
 */
export function scoutHome(cols: number, rows: number): ScoutPoint {
  return { colMilli: cols * 500, rowMilli: rows * 1000 - 1_000 };
}

/**
 * Stand the scout at the start of one arena, everything back as authored.
 *
 * `boss-round.ts` calls this to reach an arena nothing headless could win to,
 * and `scout-arena.ts` calls it when an arena is cleared — which is what makes
 * the second arena the same arena either way round (`boss-round.ts` says why
 * that matters).
 */
export function scoutStand(scout: ScoutState, index: number, beat: number): void {
  scout.arena = Math.max(0, Math.min(index, scout.arenas.length - 1));
  const arena = scoutCurrent(scout);
  scout.arenaBeat = beat;
  scout.colMilli = arena.startColMilli;
  scout.rowMilli = arena.startRowMilli;
  scout.vColMilli = 0;
  scout.vRowMilli = 0;
  scout.headingMilli = arena.startHeadingMilli;
  scout.turn = 0;
  scout.burning = false;
  scout.carrying = [];
  scout.banked = [];
  scout.mawTick = -1;
  // Copied out rather than referenced: the hazards move, and content is never
  // written to (`SnakeState.rounds` says the same thing one round along).
  scout.hazards = arena.hazards.map((h) => ({ ...h }));
  scout.caughtTick = -1;
  scout.caughtBy = -1;
  // Both hands go with the arena, because the load does: an arena stood up
  // again is a ship carrying nothing, and a line or a prime left standing
  // would be a hand on a ship that is not there yet (`scout-hand.ts`).
  scout.reeling = false;
  scout.primeTick = -1;
}
