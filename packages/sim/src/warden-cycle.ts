import { hullRow, type SimConfig, ticksPerBeat } from "./config.js";
import { type Color, type CreatureKind, fallTilesPerBeat } from "./types.js";

/**
 * THE WARDEN's cycle, as arithmetic.
 *
 * Everything on this page is *derived* — from the wave's beat, from the plates
 * left on the rim, from how fast a tether falls. Nothing is stored and nothing
 * is drawn from the rng, which is the claim `bosses.md` 11.4 makes about the
 * whole encounter and this is where it is kept: the alternation, the colour,
 * the phase and the timing all follow from two counters both devices already
 * agree about.
 *
 * Its own file, and not `warden.ts`, for the same reason `simon.ts` is not
 * `mirror.ts`: the choreography moves state and this does not, so `commands.ts`
 * and render/ can ask which control is frozen without pulling a whole boss in.
 */

/**
 * Beats the pupil stands open once a tether has been torn in time. The one
 * piece of the cycle that is a written number rather than a derived one:
 * everything else about the timing follows from how fast a tether falls, and
 * this is how long the recoil holds the iris back.
 */
export const WARDEN_OPEN_BEATS = 2;

/** No tether hanging. Not an id — ids are dealt out from 1. */
export const NO_TETHER = 0;

/** Which of the pair's two sliding controls the rim has hold of. */
export type WardenControl = "cannon" | "shield";

/**
 * A phase, which follows from the plates and nothing else. Only how hard the
 * pupil is to name and reach tightens; the timing never does, so a pair that
 * learned the cycle on its first turn has learned it for the whole fight.
 *
 * `above` is read the way `PHASES` in `queen-mark.ts` reads it: the first row
 * whose bound the plates are still over.
 */
export interface WardenPhase {
  name: string;
  above: number;
  /** Columns the pupil slides each beat. */
  drift: number;
  /** The rock the shut iris squeezes out on the vent beat. */
  vent: CreatureKind;
}

export const WARDEN_PHASES: readonly WardenPhase[] = [
  { name: "WATCH", above: 3, drift: 1, vent: "meteor" },
  { name: "NARROW", above: 1, drift: 2, vent: "meteor" },
  { name: "GLARE", above: -1, drift: 2, vent: "meteorMedium" },
];

/** The phase these plates put it in. Never stored — plates are the whole of it. */
export function wardenPhase(plates: number): WardenPhase {
  return WARDEN_PHASES.find((p) => plates > p.above) ?? WARDEN_PHASES[WARDEN_PHASES.length - 1]!;
}

/**
 * Beats a tether takes to reach the hull from the rim — six at the defaults,
 * and the beat the whole cycle table in 11.4 is written against.
 *
 * Derived rather than written down, because the two numbers it is derived from
 * are the ones a tuner would actually reach for: move `wardenRow` or retune
 * the tier the tether falls at and the cycle follows instead of quietly
 * disagreeing with the page that describes it.
 */
export function wardenReachBeats(cfg: SimConfig): number {
  return Math.ceil((hullRow(cfg) - cfg.wardenRow) / fallTilesPerBeat("tether"));
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
 * Which control this cycle clamps. Cannon, shield, cannon, strictly
 * alternating — the pair always knows whose turn it is to be helpless, a cycle
 * before it happens, without being told.
 */
export function wardenClampedControl(cycle: number): WardenControl {
  return cycle % 2 === 0 ? "cannon" : "shield";
}

/** Whose hands that is: the pilot slides the cannon, the navigator the shield. */
export function wardenClampedPlayer(cycle: number): 1 | 2 {
  return wardenClampedControl(cycle) === "cannon" ? 1 : 2;
}

/** The other one — the only one who can pull the line, and the fight in a line. */
export function wardenRescuer(cycle: number): 1 | 2 {
  return wardenClampedPlayer(cycle) === 1 ? 2 : 1;
}

/**
 * The colour the rim carries all cycle, and so the colour the one shot at the
 * core has to be. It follows the clamp rather than being a second alternating
 * thing: one parameter runs the whole fight.
 */
export function wardenColor(cycle: number): Color {
  return wardenClampedControl(cycle) === "cannon" ? "red" : "cyan";
}

/**
 * Ticks of hold that tear a line out of the rim. Rounded once, here, so the
 * hold and the bar drawn on the line can never be measuring different things.
 */
export function wardenPullTicks(cfg: SimConfig): number {
  return Math.max(1, Math.round(cfg.wardenPullBeats * ticksPerBeat(cfg)));
}
