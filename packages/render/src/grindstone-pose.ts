import {
  GRINDSTONE_FULL_MILLI,
  GRINDSTONE_PASSES_PER_FLAT,
  type GrindstoneState,
  grindstoneClamped,
  grindstoneLitStep,
  grindstoneWindowBeats,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE GRINDSTONE is posed off** (§33, *Animation*): the wheel
 * spinning down into its place; each flat ground in, a patch of it clean;
 * the caliper swinging down and biting; the lit axle held with the jaws
 * creeping loose; and the caliper snapped off with the wheel turning edge-on
 * and falling — each read straight off the world, since the passes, the grit
 * and the beats a clamp has been held are numbers the simulation keeps.
 *
 * **The hold is the swing**, THE TRIVET's figure: a lit clamp on a slack
 * caliper swings both jaws in by the share of its beats held, and a pad let
 * go drops that share to nought and they spring back out. A clamp on a bitten
 * caliper turns it round, THE VISE's creep: the jaws work loose as its window
 * runs out, and the share held presses them back home.
 *
 * **The fall is the turn**: spinning free, the wheel turns edge-on to the
 * field, so the two flats the pair has been reading go away and only the rim
 * is left — the one pose where the face the pair ground is gone.
 */

/** How far a clamp on a bitten caliper lets the jaws creep loose, as a share of the way slack. */
const CREEP = 0.3;
/** How far the wheel turns winding down into place, and spinning free, in radians. */
const WIND = 1.6;
const SPIN_FREE = 5;

/** How far into its phase the wheel is, in beats, the fraction of this one included. */
export function into(s: GrindstoneState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** The spin-down into frame: 0 still above the field, 1 standing. */
export function grindstoneArrived(
  s: GrindstoneState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.grindstoneStillBeats));
}

/** How far the wheel has fallen free: 0 held, 1 gone. */
export function grindstoneFree(
  s: GrindstoneState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "free") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.grindstoneFreeBeats));
}

/** The wheel's turn: winding down as it arrives, still while it is fought, spinning up as it falls. */
export function grindstoneSpin(arrived: number, free: number): number {
  return (1 - arrived) * WIND + free * free * SPIN_FREE;
}

/** How much of the lit step's window is left: 1 as it lights, 0 as it runs out. */
export function grindstoneLeft(
  world: World,
  s: GrindstoneState,
  beat: number,
  beatPhase: number,
): number {
  const step = grindstoneLitStep(s);
  if (step === null) return 0;
  const window = Math.max(1, grindstoneWindowBeats(world, step));
  return Math.max(0, 1 - into(s, beat, beatPhase) / window);
}

/** The share of the lit clamp's beats both jaws have been held, this beat's fraction included while they still are. */
export function grindstoneHeldShare(s: GrindstoneState, beatPhase: number): number {
  const step = grindstoneLitStep(s);
  if (step === null || step.ask !== "clamp") return 0;
  const running = grindstoneClamped(s) ? beatPhase : 0;
  return Math.min(1, (s.heldBeats + running) / Math.max(1, step.beats));
}

/** How far the caliper is shut: 0 slack, 1 bitten home. */
export function grindstoneShut(
  world: World,
  s: GrindstoneState,
  beat: number,
  beatPhase: number,
): number {
  const clamp = grindstoneLitStep(s)?.ask === "clamp";
  const held = grindstoneHeldShare(s, beatPhase);
  if (!s.locked) return clamp ? held : 0;
  if (!clamp) return 1;
  const run = 1 - grindstoneLeft(world, s, beat, beatPhase);
  return 1 - CREEP * run * (1 - held);
}

/** How deep flat `side` is ground: 0 fresh, 1 both its passes taken. A pass is an event, so the depth steps. */
export function grindstoneDepth(s: GrindstoneState, side: 0 | 1): number {
  return Math.min(1, s.passes[side] / GRINDSTONE_PASSES_PER_FLAT);
}

/** The share of flat `side`'s face ground clean of grit: 0 solid, 1 clean. */
export function grindstoneClear(s: GrindstoneState, side: 0 | 1): number {
  return Math.max(0, Math.min(1, 1 - s.gritMilli[side] / GRINDSTONE_FULL_MILLI));
}
