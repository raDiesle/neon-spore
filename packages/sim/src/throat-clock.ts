import type { SimConfig } from "./config.js";
import type { ThroatState } from "./throat.js";

/**
 * **THE THROAT's cadence**: how often the gullet inhales, how long the pair
 * has until it does, and how much of the eversion is left to run.
 *
 * Cut out of `throat.ts` on 19 September 2026, when the cinch and the haul
 * would have put that file over its 250-line limit. The seam is the one its
 * own header had already drawn — *this file is the shape, the geometry and
 * the questions asked of both* — and the cadence is neither: it is the count
 * player 2 says out loud, and the only thing on this page is that count and
 * the two answers derived from it.
 *
 * Nothing here touches `World` and nothing here writes. That is what lets the
 * cinch live in `throat-step.ts` without a cycle: the debt is a number on the
 * state, and the grid it is owed against is read from here (`throatBreathes`).
 */

/**
 * Beats between inhales, in this phase. 1 in `open` is the design's
 * *continuously rather than on a clock*, and 0 in `everts` is a boss that has
 * stopped eating because it is busy turning inside out.
 */
export function throatEvery(cfg: SimConfig, b: ThroatState): number {
  if (b.phase === "everts") return 0;
  if (b.phase === "open") return 1;
  return b.phase === "quick" ? cfg.throatTightBeats : cfg.throatInhaleBeats;
}

/**
 * Beats of the eversion still to run, or 0 once it is over.
 *
 * Counted rather than stored for `phaseBeat`'s reason: the beat the tube
 * started turning through itself is the origin of everything the picture draws
 * of it, so a second countdown would be a second place the answer lived.
 */
export function throatEvertBeatsLeft(cfg: SimConfig, b: ThroatState, beat: number): number {
  return Math.max(0, cfg.throatEvertBeats - (beat - b.phaseBeat));
}

/**
 * Whether the throat's own cadence falls on this beat.
 *
 * Counted from `phaseBeat` rather than from the wave's start, so a cadence
 * that tightens starts its new count where the phase did. A pair who had to
 * subtract an old origin from a new number would be doing the boss's
 * bookkeeping instead of its arithmetic.
 *
 * **The cadence and the breath are two questions**, and this one is the grid.
 * A thumb on a slack ring steals the inhale this answers `true` for and owes
 * it back a beat at a time, so what actually happens on a beat is
 * `throatBreathes` (`throat-step.ts`) — and the grid stays a pure function of
 * the phase, which is what player 2's readout is drawn from.
 */
export function throatInhales(cfg: SimConfig, b: ThroatState, beat: number): boolean {
  const every = throatEvery(cfg, b);
  if (every <= 0) return false;
  return (((beat - b.phaseBeat) % every) + every) % every === 0;
}

/**
 * **Beats until the next inhale**, 0 on an inhale beat — player 2's bar, and
 * the one number she has to say out loud.
 *
 * Here rather than in `render/` because the cadence's origin and its stride are the boss, and a second copy of the modulo in the
 * file that draws the bar is a throat that inhales on one screen and waits on
 * the other under any change to either number.
 */
export function throatToInhale(cfg: SimConfig, b: ThroatState, beat: number): number {
  const every = throatEvery(cfg, b);
  if (every <= 0) return -1;
  const since = (((beat - b.phaseBeat) % every) + every) % every;
  return since === 0 ? 0 : every - since;
}
