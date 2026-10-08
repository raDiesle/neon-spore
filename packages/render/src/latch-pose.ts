import { type LatchState, latchLitStep, type SimConfig } from "@neon-spore/sim";
import { smoothstep as ease } from "./ease.js";

/**
 * **How THE LATCH stands this frame**, read off the simulation and nothing
 * else (§11.61): how far the colony has dropped in, how far it has been torn
 * away at the end, how hard it is rearing for a yank, and how far the rope
 * the puller is hauling has stretched it toward the ship.
 *
 * Every number is nought to one, so the shape (`latch-shape.ts`) can blend
 * between the figures rather than cut: hanging, stretched, reared, gone.
 */
export interface LatchPose {
  /** Nought while it drops in from above, one once hung. */
  arrived: number;
  /** Nought while it hangs, one once torn loose and gone off the top. */
  gone: number;
  /** One at the top of a rear, the beat before it yanks. */
  rear: number;
  /** How far between the last knot and the next the rope has come: the stretch. */
  sag: number;
}

/** Hung at rest: dropped in, not rearing, nothing hauled — for what is placed before a frame is drawn. */
export const LATCH_AT_REST: LatchPose = { arrived: 1, gone: 0, rear: 0, sag: 0 };

export function latchPose(
  s: LatchState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): LatchPose {
  const now = beat + beatPhase;
  const since = now - s.phaseBeat;
  const arrived = s.phase === "enter" ? ease(since / Math.max(1, cfg.latchEnterBeats)) : 1;
  const gone = s.phase === "spent" ? ease(since / Math.max(1, cfg.latchSpentBeats)) : 0;
  return { arrived, gone, rear: latchRear(s, cfg, now), sag: latchSag(s, cfg) };
}

/**
 * The rear: up over `latchRearBeats` to the yank, then snapping back down in
 * the beat after it — so the pair sees it coming and sees it land.
 */
export function latchRear(s: LatchState, cfg: SimConfig, now: number): number {
  if (s.yankBeat < 0 || latchLitStep(s) === null) return 0;
  const rearBeats = Math.max(1, cfg.latchRearBeats);
  const left = s.yankBeat - now;
  if (left > rearBeats) {
    // After a yank the next is `latchYankEveryBeats` away; the beat just
    // after the last one is the snap back down.
    const after = cfg.latchYankEveryBeats - left;
    return after >= 0 && after < 1 ? 1 - ease(after) : 0;
  }
  return ease(1 - left / rearBeats);
}

/** The rope hauled past the last knot, as a share of the way to the next. */
export function latchSag(s: LatchState, cfg: SimConfig): number {
  const knot = Math.max(1, cfg.latchKnotMilli);
  return Math.max(0, Math.min(1, (s.hauledMilli - s.floorMilli) / knot));
}
