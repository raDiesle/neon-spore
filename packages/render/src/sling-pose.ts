import {
  type SimConfig,
  SLING_DRAWS_PER_ARM,
  type SlingState,
  slingAsks,
  slingLitStep,
  slingWindowBeats,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE SLING is posed off** (§32): folded; a tine splayed out to
 * stand; a cord drawn while its step is held; both cords home and the cup
 * lit; a held draw creeping slack as a `both` step's window runs out; and the
 * fork snapped forward, spent.
 *
 * **A draw's tension is read off the count it is spending**, not off a
 * timer: a first-time pull grows from the beats held toward the step's own,
 * a locked arm stands at its `arms` share, and a `both` step held taut decays
 * toward slack by the same share VISE's crack decays — the count is the
 * picture (§28, *Animation*, the rule THE SLING shares with it).
 */

/** How far a `both` step's held cord is let creep back toward slack, unanswered. */
const CREEP = 0.8;

/** How far into its phase the fork is, in beats, this beat's own fraction included. */
function into(s: SlingState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** 0 folded to 1 standing: the tines' one-time swing out into frame. */
export function slingArrived(
  s: SlingState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.slingStillBeats));
}

/** 0 standing to 1 gone: the fork snapping forward and away once its script is spent. */
export function slingGone(s: SlingState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "free") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.slingFreeBeats));
}

/** How much of the lit step's window is left: 1 as it lights, 0 run out. */
export function slingWindowLeft(
  world: World,
  s: SlingState,
  beat: number,
  beatPhase: number,
): number {
  const step = slingLitStep(s);
  if (step === null) return 0;
  return Math.max(0, 1 - into(s, beat, beatPhase) / Math.max(1, slingWindowBeats(world, step)));
}

/**
 * Cord `side`'s tension, 0 slack to 1 drawn fully home: its locked draws'
 * share, pulled further while this step asks it and the seat holds, and
 * eased back toward that floor as a `both` step's window runs unheld.
 */
export function slingTension(
  world: World,
  s: SlingState,
  side: 0 | 1,
  beat: number,
  beatPhase: number,
): number {
  const locked = s.arms[side] / SLING_DRAWS_PER_ARM;
  const step = slingLitStep(s);
  if (step === null) return locked;
  if (step.ask === "both") {
    if (s.loosed[side]) return 1;
    const left = slingWindowLeft(world, s, beat, beatPhase);
    const running = s.holding[side] ? beatPhase / Math.max(1, step.beats) : 0;
    const held = Math.min(1, s.drawnBeats[side] / Math.max(1, step.beats) + running);
    return 1 - CREEP * (1 - left) * (1 - held);
  }
  if (step.ask === "fire") return locked;
  if (!slingAsks(s, side)) return locked;
  const running = s.holding[side] ? beatPhase / Math.max(1, step.beats) : 0;
  const pulling = Math.min(1, s.drawnBeats[side] / Math.max(1, step.beats) + running);
  return Math.max(locked, pulling);
}

/** How bright the cup burns: dark unlit, and dimming as a fire step's window runs out unanswered. */
export function slingCupGlow(world: World, s: SlingState, beat: number, beatPhase: number): number {
  if (!s.yokeLit) return 0;
  const step = slingLitStep(s);
  if (step?.ask === "fire") return 0.55 + 0.45 * slingWindowLeft(world, s, beat, beatPhase);
  return 1;
}
