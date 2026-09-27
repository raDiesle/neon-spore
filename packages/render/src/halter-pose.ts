import {
  type HalterState,
  halterLitStep,
  halterPairing,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { phaseInto } from "./phase-into.js";

/**
 * **The clock THE HALTER is posed off** (§36, *Animation*): the seam dropping
 * in alarmed; each segment parting as the pair holds it and cracking open;
 * the centre bared, creeping shut through a guard's window and pressed back
 * open by the pair; and the whole slab split spent — each read straight off
 * the world, since the cracks, the rest and the beats a pair has held are
 * numbers the simulation keeps.
 *
 * **The tell is the tremor's silence.** The plating chatters without rest —
 * unevenly, each plate on its own — and stops dead the instant the lit
 * step's pair holds together (`halterPairing`): no colour, no snap, only the
 * shaking gone. It is twice as hard while the seam is alarmed.
 *
 * **The hold is the parting**, THE TRIVET's figure: the lit segment's plates
 * stand a hair off the seam by the share of its beats held, and a startle or
 * a slip, which zeroes the count, snaps them back shut.
 *
 * **The split is the turn**: spent, every segment parts wide and the slab
 * tips over edge-on, so the plating the pair has been reading goes away.
 */

/** How far a held pair parts the lit segment before it cracks, as a share of cracked. */
const HAIR = 0.35;
/** How far a guard's window lets the bared centre creep shut, as a share of the way. */
const CREEP = 0.55;

/** The segment a step is about: the left, the centre, or the right. */
export type HalterSegment = 0 | 1 | 2;

/** The drop into frame: 0 still above the field, 1 standing. */
export function halterArrived(
  s: HalterState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "alarmed" || s.cursor > 0) return 1;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.halterAlarmBeats));
}

/** How far the seam has split spent: 0 whole, 1 gone. */
export function halterSplit(
  s: HalterState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "spent") return 0;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.halterSpentBeats));
}

/** The segment the lit step is about, or null between steps. A shot is at the centre. */
export function halterLitSegment(s: HalterState): HalterSegment | null {
  const ask = halterLitStep(s)?.ask;
  if (ask === undefined) return null;
  return ask === "left" ? 0 : ask === "right" ? 2 : 1;
}

/** How much of the lit step's window is left: 1 as it lights, 0 as it runs out. */
export function halterLeft(s: HalterState, beat: number, beatPhase: number): number {
  const step = halterLitStep(s);
  if (step === null) return 0;
  return Math.max(0, 1 - phaseInto(s, beat, beatPhase) / Math.max(1, step.beats));
}

/** The share of the lit step's beats its pair has held, this beat's fraction included while it still does. */
export function halterHeldShare(world: World, s: HalterState, beatPhase: number): number {
  const step = halterLitStep(s);
  if (step === null || step.ask === "fire") return 0;
  const running = halterPairing(world, s) !== null ? beatPhase : 0;
  return Math.min(1, (s.heldBeats + running) / Math.max(1, world.cfg.halterHoldBeats));
}

/** How hard the plating shakes: 2 alarmed, 1 on guard, 0 the instant a pair holds and once spent. */
export function halterShake(world: World, s: HalterState): number {
  if (s.phase === "spent") return 0;
  if (halterLitStep(s) !== null && halterPairing(world, s) !== null) return 0;
  return s.phase === "alarmed" ? 2 : 1;
}

/** How far segment `k` has parted: 0 hugged shut, 1 cracked, over 1 split spent. */
export function halterOpen(
  world: World,
  s: HalterState,
  k: HalterSegment,
  beat: number,
  beatPhase: number,
): number {
  const split = halterSplit(s, world.cfg, beat, beatPhase);
  if (s.phase === "spent") return 1 + 0.8 * split;
  const lit = halterLitSegment(s) === k;
  const held = lit ? halterHeldShare(world, s, beatPhase) : 0;
  const open = k === 0 ? s.cracks[0] === 1 : k === 2 ? s.cracks[1] === 1 : s.bared;
  if (!open) return HAIR * held;
  if (k !== 1 || halterLitStep(s)?.ask !== "guard") return 1;
  const run = 1 - halterLeft(s, beat, beatPhase);
  return 1 - CREEP * run * (1 - held);
}

/**
 * Plate `half` of segment `k`'s shake this instant, in pixels at `amp`: three
 * sines no two of which beat together, under a slow swell of its own, so the
 * chatter comes and goes and no two plates keep time.
 */
export function halterTremor(
  time: number,
  k: HalterSegment,
  half: 0 | 1,
  amp: number,
): { x: number; y: number } {
  if (amp <= 0) return { x: 0, y: 0 };
  const seed = k * 2.3 + half * 5.1;
  const swell = 0.35 + 0.65 * Math.sin(time * 1.3 + seed) ** 2;
  const y = Math.sin(time * 29.3 + seed) * 0.6 + Math.sin(time * 47.9 + seed * 1.7) * 0.4;
  const x = Math.sin(time * 37.1 + seed * 0.6) * 0.5;
  return { x: x * amp * swell * 0.5, y: y * amp * swell };
}
