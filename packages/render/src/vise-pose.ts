import {
  type SimConfig,
  VISE_SEAMS_PER_LOBE,
  type ViseState,
  viseClosed,
  viseLitStep,
  viseWindowBeats,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE VISE is posed off** (§28, *Animation*): intact; a lobe
 * cracked, then split and hinged open; both split with the kernel bared; the
 * lobes creeping shut over it; and the case split down its spine — with the
 * morphs between them the spec asks for, the lobes peeling back about their
 * hinge rather than fading.
 *
 * **The hold is the crack.** A lit pinch step draws its seam cracking from the
 * top down by the share of its beats the gap has been kept shut, so the count
 * is read off the shell rather than off a number; the gap widening back drops
 * the count to nought and the crack is gone again. A `both` step is the same
 * figure turned round: the lobes creep shut as its window runs out, and the
 * share held pushes them back open.
 */

/** How far a lobe stands open, in radians about its hinge, for each seam cracked. */
const CRACKED = [0, 0.1, 0.42] as const;
/** How far both stand open over a bared kernel. */
const BARED = 0.62;
/** How far they gape when they have closed back over it. */
const COVER = 0.06;
/** How far an unanswered `both` step lets them creep, as a share of the way shut. */
const CREEP = 0.85;
/** How much further the split throws them. */
const THROWN = 0.9;

/** How far into its phase the case is, in beats, the fraction of this one included. */
export function into(s: ViseState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** The drop into frame: 0 still above the field, 1 standing. */
export function viseArrived(s: ViseState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.viseStillBeats));
}

/** How much of the lit step's window is left: 1 as it lights, 0 as it runs out. */
export function viseLeft(s: ViseState, beats: number, beat: number, beatPhase: number): number {
  return Math.max(0, 1 - into(s, beat, beatPhase) / Math.max(1, beats));
}

/** How far the case has split: 0 whole, 1 fallen apart. */
export function viseSplit(s: ViseState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "split") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.viseSplitBeats));
}

/** How much of a lit pinch step has been kept shut, the running beat included while it is. */
export function viseHeldShare(world: World, s: ViseState, beatPhase: number): number {
  const step = viseLitStep(s);
  if (step === null || step.ask === "fire") return 0;
  const running = viseClosed(world, s) ? beatPhase : 0;
  return Math.min(1, (s.heldBeats + running) / Math.max(1, step.beats));
}

/**
 * How far lobe `side` is pinched, 0 open to 1 shut: its gap between the
 * touches on it, read straight off the world. The shell is drawn narrower by
 * it, so a thumb and finger closing are seen closing on the body.
 */
export function viseSqueeze(cfg: SimConfig, s: ViseState, side: 0 | 1): number {
  const span = Math.max(1, cfg.viseOpenMilli - cfg.viseShutMilli);
  return Math.max(0, Math.min(1, (cfg.viseOpenMilli - s.gapMilli[side]) / span));
}

/** Which lobe a lit single pinch works on, or null for anything else. */
export function viseLitSide(s: ViseState): 0 | 1 | null {
  const ask = viseLitStep(s)?.ask;
  if (ask === "left") return 0;
  if (ask === "right") return 1;
  return null;
}

/** Whether both lobes have closed back over the kernel after it was bared. */
export function viseCovered(s: ViseState): boolean {
  return !s.bared && s.cracks[0] >= VISE_SEAMS_PER_LOBE && s.cracks[1] >= VISE_SEAMS_PER_LOBE;
}

/**
 * How far lobe `side` stands open about its hinge, in radians: by its cracks,
 * wide over a bared kernel, gaping over a covered one, creeping shut through
 * a `both` step the pinch has not held, and thrown wide as the case splits.
 */
export function viseOpenAngle(
  world: World,
  s: ViseState,
  side: 0 | 1,
  beat: number,
  beatPhase: number,
): number {
  const cracked = CRACKED[Math.min(VISE_SEAMS_PER_LOBE, s.cracks[side])] ?? 0;
  let open = s.bared ? BARED : viseCovered(s) ? COVER : cracked;
  const step = viseLitStep(s);
  const held = viseHeldShare(world, s, beatPhase);
  if (step?.ask === "both") {
    if (s.bared) {
      const left = viseLeft(s, viseWindowBeats(world, step), beat, beatPhase);
      open = BARED * (1 - CREEP * (1 - left) * (1 - held));
    } else open = COVER + (BARED - COVER) * held;
  } else if (viseLitSide(s) === side) open += 0.04 * held;
  const split = viseSplit(s, world.cfg, beat, beatPhase);
  return split > 0 ? Math.max(open, BARED) + THROWN * split : open;
}
