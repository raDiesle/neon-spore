import { type AntiphonState, antiphonFull, antiphonHeld, antiphonTurnMilli } from "./antiphon.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import { nextInt } from "./rng.js";
import type { World } from "./world.js";

/**
 * **Which way up the organ stands** — step 8 of `bosses-choreographed.md`
 * §12, *the organ begins turning slowly in place, so his description has to
 * say which way up*.
 *
 * From `antiphonTurnPits` on, while `antiphonRestingTurn` is set, the organ
 * pushes out resting at a **quarter turn the seed picks**, and the rail's
 * decoys are the same contour at the other quarter turns: the shape is no
 * longer the question, its turn is. Only the candidate at the organ's turn is
 * right (`antiphonIsOrgan` is unchanged — it is still a rail index).
 *
 * The thumb's turn stays the look-around it ships as (`antiphon-hand.ts`),
 * and on these levels it **springs back** to the resting turn when the thumb
 * lifts, `antiphonSpringRate` times as fast as it went round, so a turn under
 * a thumb never changes what the answer looks like. The ship is never turned:
 * three hulls told apart by their drawing are question enough.
 *
 * Off by default (the owner left the choice to the session on 8 October
 * 2026, option A of the queue entry): with the figure off nothing here draws
 * from the seed, so every replay already recorded plays the same.
 */

/** Quarter turns to a whole one. */
export const ANTIPHON_QUARTERS = 4;

/** Whether the organ growing now, or standing, rests at a turn of its own. */
export function antiphonTurned(s: AntiphonState, cfg: SimConfig): boolean {
  return cfg.antiphonRestingTurn && s.pits.length >= cfg.antiphonTurnPits && !antiphonFull(s, cfg);
}

/** Ticks of one whole turn under a thumb. */
function wholeTicks(cfg: SimConfig): number {
  return ticksPerBeat(cfg) * cfg.antiphonTurnBeats;
}

/**
 * The organ's resting quarter turn and the decoys' — the organ's first, then
 * one distinct other turn per decoy, drawn in the seed's order. A rail wider
 * than the turns are many leaves the rest at the organ's own turn, for the
 * caller to give another shape.
 */
export function antiphonDrawTurns(world: World, decoys: number): number[] {
  const organ = nextInt(world.rng, ANTIPHON_QUARTERS);
  const rest: number[] = [];
  for (let q = 0; q < ANTIPHON_QUARTERS; q++) if (q !== organ) rest.push(q);
  const out = [organ];
  while (out.length < decoys + 1 && rest.length > 0) {
    const i = nextInt(world.rng, rest.length);
    out.push(rest[i] ?? 0);
    rest.splice(i, 1);
  }
  return out;
}

/**
 * The thumb's turn springs back the short way round once no thumb rests,
 * on a level whose organ rests at a turn. Called on the tick by
 * `stepAntiphonTurn` when neither seat holds.
 */
export function springAntiphonTurn(s: AntiphonState, cfg: SimConfig): void {
  if (!antiphonTurned(s, cfg) || antiphonHeld(s, 1) || antiphonHeld(s, 2)) return;
  const whole = wholeTicks(cfg);
  const t = s.turnTicks % whole;
  if (t === 0) {
    s.turnTicks = 0;
    return;
  }
  const rate = cfg.antiphonSpringRate;
  if (t * 2 <= whole) s.turnTicks = Math.max(0, t - rate);
  else s.turnTicks = t + rate >= whole ? 0 : t + rate;
}

/** A quarter-turn index as thousandths of a turn. */
export function antiphonQuarterMilli(turn: number): number {
  return (turn * 1000) / ANTIPHON_QUARTERS;
}

/**
 * How far round the organ is drawn, in thousandths of a turn: its resting
 * turn and whatever a thumb has added. What `render/antiphon-draw.ts` turns
 * the contour by.
 */
export function antiphonOrganTurnMilli(s: AntiphonState, cfg: SimConfig): number {
  const rest = s.organ === null ? 0 : antiphonQuarterMilli(s.organ.turn);
  return (rest + antiphonTurnMilli(s, cfg)) % 1000;
}
