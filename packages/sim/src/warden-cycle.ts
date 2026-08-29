import type { SimConfig } from "./config.js";
import type { Color } from "./types.js";

/**
 * THE WARDEN's cycle, as arithmetic.
 *
 * Everything on this page is *derived* — from the wave's beat and from the
 * plates left on the rim. Nothing is stored and nothing is drawn from the rng,
 * which is the claim `bosses.md` 11.4 makes about the whole encounter and this
 * is where it is kept: the colour and the phase both follow from counters the
 * two devices already agree about.
 *
 * Its own file, and not `warden.ts`, for the same reason `simon.ts` is not
 * `mirror.ts`: the choreography moves state and this does not, so `bullet-hit.ts`
 * and render/ can ask what colour the rim carries without pulling a whole boss
 * in.
 */

/** No tether hanging. Not an id — ids are dealt out from 1. */
export const NO_TETHER = 0;

/**
 * A phase, which follows from the plates and nothing else. Only how hard the
 * eye is to name and reach tightens; the line, the pull and the hatch never do,
 * so a pair that learned the fight on its first line has learned it for the
 * whole fight.
 *
 * `above` is read the way `PHASES` in `queen-mark.ts` reads it: the first row
 * whose bound the plates are still over.
 */
export interface WardenPhase {
  name: string;
  above: number;
  /** Columns the pupil slides each beat. */
  drift: number;
}

export const WARDEN_PHASES: readonly WardenPhase[] = [
  { name: "WATCH", above: 3, drift: 1 },
  { name: "NARROW", above: 1, drift: 2 },
  { name: "GLARE", above: -1, drift: 2 },
];

/** The phase these plates put it in. Never stored — plates are the whole of it. */
export function wardenPhase(plates: number): WardenPhase {
  return WARDEN_PHASES.find((p) => plates > p.above) ?? WARDEN_PHASES[WARDEN_PHASES.length - 1]!;
}

/** The beat of the cycle the wave is on: 0 at every attach. */
export function wardenCycleBeat(cfg: SimConfig, waveBeat: number): number {
  const n = cfg.wardenCycleBeats;
  return (((waveBeat - 1) % n) + n) % n;
}

/** Which cycle the wave is on, counted from 0. */
export function wardenCycle(cfg: SimConfig, waveBeat: number): number {
  return Math.floor(Math.max(0, waveBeat - 1) / cfg.wardenCycleBeats);
}

/**
 * The colour the rim carries all cycle, and so the colour the one shot into the
 * eye has to be.
 *
 * **It is the cycle's own parity and nothing else now.** It used to follow which
 * control the rim had hold of — one alternating parameter ran the whole fight —
 * and the clamp has gone. The alternation had to survive it: the colour is the
 * only reason player 2 reaches for both buttons rather than resting a thumb on
 * one, so a rim that stayed red would quietly halve their half of the fight.
 * One line comes down per cycle, so this still alternates line by line.
 */
export function wardenColor(cycle: number): Color {
  return cycle % 2 === 0 ? "red" : "cyan";
}
