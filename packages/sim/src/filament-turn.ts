import type { SimConfig } from "./config.js";
import { type FilamentState, filamentGap, filamentTiles, filamentTracing } from "./filament.js";

/**
 * **Whose move THE FILAMENT is waiting on, and for how long.**
 *
 * The owner, 25 September 2026, on the fight as it shipped: *not clear when
 * following is correct or not*, and *some timer when it is too late to follow
 * … some timer when player 1 does not start, so it is not infinite and the
 * ship takes damage.* So the line has a clock. It runs from the beat the line
 * last moved — either thumb, or the trace beginning — and when it runs out
 * with the line still where it was, the filament strikes the hull, which under
 * his rule of 12 September is the wave (`filament-step.ts`, `wave-fail.ts`).
 *
 * **One clock, because the line is one thing.** Each move of either thumb is
 * the line moving, and it restarts the clock for both. Who is being waited on
 * is not a second clock but a reading of the two indices: the pilot may light
 * his next tile only while she is inside the window, and the navigator may
 * take hers only while there is a lit tile behind his — so at a gap of one it
 * is his move, at the window it is hers, and between the two it is either's.
 * The first tile is given longer (`filamentStartBeats`) than every one after
 * it (`filamentStallBeats`), because the first is where the pair finds the
 * line at all.
 *
 * Every name here is a reading the screens draw from, and the step's own
 * clock is the only writer of what it reads (`stillBeat`).
 */

/** The seat bits `filamentWaitingOn` answers in: the pilot, the navigator, or both. */
export const FILAMENT_PILOT = 1;
export const FILAMENT_NAVIGATOR = 2;

/** The index of the armed filament's root, or `-1` once none is armed. */
function rootIndex(s: FilamentState): number {
  const tiles = filamentTiles(s);
  return tiles === null ? -1 : tiles.length - 1;
}

/** Whether the pilot may light his next tile without the line going dark:
 * the head is not at the root and the navigator is inside the window. */
export function filamentPilotMay(s: FilamentState, cfg: SimConfig): boolean {
  return filamentTracing(s) && s.head < rootIndex(s) && filamentGap(s) < cfg.filamentGapTiles;
}

/** Whether the navigator has a lit tile to take: one behind his, or his own
 * when his is the root — the pull. */
export function filamentNavigatorMay(s: FilamentState): boolean {
  if (!filamentTracing(s)) return false;
  const next = s.tail + 1;
  return next < s.head || (next === s.head && s.head === rootIndex(s));
}

/** Whether a tile the pilot lit now would be the snap: one already lit this beat. */
export function filamentTooSoon(s: FilamentState, beat: number): boolean {
  return s.headBeat === beat;
}

/** Which seats the line is waiting on, as `FILAMENT_PILOT | FILAMENT_NAVIGATOR` bits; 0 while it is not traced. */
export function filamentWaitingOn(s: FilamentState, cfg: SimConfig): number {
  return (
    (filamentPilotMay(s, cfg) ? FILAMENT_PILOT : 0) |
    (filamentNavigatorMay(s) ? FILAMENT_NAVIGATOR : 0)
  );
}

/** Beats the line may stand still from `stillBeat`: longer for the first tile. */
export function filamentStallBeats(s: FilamentState, cfg: SimConfig): number {
  return s.head === 0 ? cfg.filamentStartBeats : cfg.filamentStallBeats;
}

/** The beat the line strikes on if nobody moves it before then. */
export function filamentLateBeat(s: FilamentState, cfg: SimConfig): number {
  return s.stillBeat + filamentStallBeats(s, cfg);
}
