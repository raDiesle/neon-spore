import { RIME_FULL_MILLI, type RimeState, rimeLitStep, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE RIME is posed off** (§29, *Animation*): opaque; a half
 * clear; both clear and the core bare; a surge crawling back in from the rim;
 * and the pane shattered — each read straight off the world, since the frost
 * is a number the simulation already keeps per half.
 *
 * **The wipe is the patch.** A half's clear patch is as wide as its frost is
 * gone, so every reversal a thumb makes is seen opening the glass, and a beat
 * nobody rubbed is seen closing it again.
 */

/** How far into its phase the lens is, in beats, the fraction of this one included. */
export function into(s: RimeState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** The drop into frame: 0 still above the field, 1 standing. */
export function rimeArrived(s: RimeState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.rimeStillBeats));
}

/** How much of the lit step's window is left: 1 as it lights, 0 as it runs out. */
export function rimeLeft(s: RimeState, beat: number, beatPhase: number): number {
  const step = rimeLitStep(s);
  if (step === null) return 0;
  return Math.max(0, 1 - into(s, beat, beatPhase) / Math.max(1, step.beats));
}

/** How far the pane has fallen apart: 0 whole, 1 gone. */
export function rimeShatter(s: RimeState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "shattered") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.rimeShatterBeats));
}

/** How clear half `side` stands: 0 frosted solid, 1 bare glass. */
export function rimeClear(s: RimeState, side: 0 | 1): number {
  return 1 - Math.max(0, Math.min(RIME_FULL_MILLI, s.rimeMilli[side])) / RIME_FULL_MILLI;
}

/**
 * How far a lit surge has crawled in from the rim, 0 at the rim to 1 over
 * the core: it gains on the pane as the shield step's beats run out.
 */
export function rimeSurge(s: RimeState, beat: number, beatPhase: number): number {
  if (rimeLitStep(s)?.ask !== "shield") return 0;
  return 1 - rimeLeft(s, beat, beatPhase);
}

/** The core's size and how bright it burns: a little smaller and brighter for every hit, THE VISE's figure. */
export function rimeCoreHurt(hits: number): { size: number; bright: number } {
  return { size: Math.max(0.55, 1 - 0.12 * hits), bright: Math.min(1, 0.55 + 0.2 * hits) };
}
