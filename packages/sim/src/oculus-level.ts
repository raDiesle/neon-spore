import type { SimConfig } from "./config.js";
import { ticksPerBeat } from "./config.js";
import {
  type OculusState,
  type OculusStep,
  oculusBoss,
  oculusBothHeld,
  oculusIsHold,
  oculusLitStep,
  oculusTapsEach,
  oculusTurnNeedMilli,
} from "./oculus.js";
import { oculusPairDone } from "./oculus-step.js";
import type { World } from "./world.js";

/**
 * **How far THE OCULUS's lit pair has come**, by whichever of the three
 * gestures it asks, and the tick it is done.
 *
 * Counted on the tick, after the commands (`boss-hands-scripted.ts`): a hold
 * is worth every tick both thumbs are down, so a hold let go and taken again
 * goes on from the tick it stood at — the owner's *keep current position of
 * process* — rather than from the last whole beat. A tap and a turn are
 * counted as they are heard (`oculus-hand.ts`); all three are judged here, in
 * one place, so the pair shuts the same way whatever shut it.
 *
 * - **a hold** owes its `beats` of both down;
 * - **a tap** owes `need` taps from the pair, half from each seat — a seat
 *   that taps on past its half adds nothing, so neither can do the other's;
 * - **a turn** owes `need` eighths of a turn from *each* lever, made while
 *   both were taken, and the pair has come as far as the lever behind.
 */
export function oculusCounted(world: World): void {
  const s = oculusBoss(world);
  if (s === null) return;
  const step = oculusLitStep(s);
  if (step === null) return;
  if (oculusIsHold(step) && oculusBothHeld(s)) s.heldTicks += 1;
  if (oculusLevelDone(world.cfg, s, step)) oculusPairDone(world, s, step);
}

/** Whether the lit pair is done, in whole numbers. */
export function oculusLevelDone(cfg: SimConfig, s: OculusState, step: OculusStep): boolean {
  if (oculusIsHold(step)) return s.heldTicks >= step.beats * ticksPerBeat(cfg);
  if (step.ask === "tap") {
    const each = oculusTapsEach(step);
    return s.taps[0] >= each && s.taps[1] >= each;
  }
  if (step.ask === "turn") return Math.min(s.turned[0], s.turned[1]) >= oculusTurnNeedMilli(step);
  return false;
}

/**
 * How far the lit pair has come, 0 to 1 — what the leaves sliding across
 * the face are drawn by. Nought when nothing pair-like is lit.
 */
export function oculusLevelShare(cfg: SimConfig, s: OculusState): number {
  const step = oculusLitStep(s);
  if (step === null) return 0;
  if (oculusIsHold(step)) return clamp(s.heldTicks / Math.max(1, step.beats * ticksPerBeat(cfg)));
  if (step.ask === "tap") {
    const each = Math.max(1, oculusTapsEach(step));
    return clamp((Math.min(s.taps[0], each) + Math.min(s.taps[1], each)) / (2 * each));
  }
  if (step.ask === "turn") {
    return clamp(Math.min(s.turned[0], s.turned[1]) / Math.max(1, oculusTurnNeedMilli(step)));
  }
  return 0;
}

/** One lever's own share of a turn, for the knob that has gone ahead of the other. */
export function oculusLeverShare(s: OculusState, side: 0 | 1): number {
  const step = oculusLitStep(s);
  if (step?.ask !== "turn") return 0;
  return clamp(s.turned[side] / Math.max(1, oculusTurnNeedMilli(step)));
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}
