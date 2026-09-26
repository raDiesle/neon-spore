import {
  type CystAsk,
  type CystState,
  cystClenched,
  cystClosed,
  cystFrozenBeats,
  cystLitBeats,
  cystLitStep,
  cystSide,
  type World,
} from "@neon-spore/sim";
import type { CystPose } from "./cyst-shape.js";
import { smoothstep } from "./ease.js";

/**
 * **THE CYST's pose, read off the state every frame** (§34): how far in the
 * sac has dropped, how far each flank is pinched and how hard it shakes, how
 * far the swell has blown it up and how far the bottom lobe bulges with a
 * spore. Numbers only; `cyst-draw.ts` bends the outline by them.
 *
 * **A lit flank shudders; a tapped one stops dead.** That is the whole of the
 * tap's picture: the shake is there in `lit` and gone in `frozen`, so the pair
 * see the partner's tap land as a flank that goes still.
 */

/** How hard a lit flank shakes, as a share of its radius, and how fast, per second. */
const SHAKE = 0.07;
const SHAKE_HZ = 7.5;
/** How far a swell sinks back once it has been held all its beats. */
const SINK = 0.85;

/** Beats into the current phase, the beat's fraction counted in. */
export function into(s: CystState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** How far the sac has dropped into place: 0 as it settles in, 1 from the first step. */
export function cystArrived(s: CystState, stillBeats: number, beat: number, beatPhase: number) {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, stillBeats));
}

/** How far through the split the sac is, 0 to 1. */
export function cystSplit(s: CystState, splitBeats: number, beat: number, beatPhase: number) {
  if (s.phase !== "split") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, splitBeats));
}

/** How much of the lit step's window is left, 1 as it lights and 0 as it runs out. */
export function cystLeft(world: World, s: CystState, beat: number, beatPhase: number): number {
  const step = cystLitStep(s);
  if (step === null) return 0;
  const beats = s.phase === "frozen" ? cystFrozenBeats(world, step) : cystLitBeats(world, step);
  return Math.max(0, 1 - into(s, beat, beatPhase) / Math.max(1, beats));
}

/** How far flank `side` is pinched in: its gap between open and shut, 0 to 1. */
export function cystPinch(world: World, s: CystState, side: 0 | 1): number {
  const cfg = world.cfg;
  const span = Math.max(1, cfg.cystOpenMilli - cfg.cystShutMilli);
  return Math.max(0, Math.min(1, (cfg.cystOpenMilli - s.gapMilli[side]) / span));
}

/** How far a pinch or a swell has been counted: its held beats over the step's, 0 to 1. */
export function cystHeldShare(world: World, s: CystState, beatPhase: number): number {
  const step = cystLitStep(s);
  if (step === null) return 0;
  const counting = cystClosed(world, s) || cystClenched(world, s);
  const running = counting ? beatPhase : 0;
  return Math.min(1, (s.heldBeats + running) / Math.max(1, step.beats));
}

/**
 * How far into story step `ask` the sac is: rising to 1 as it lights and
 * falling back through the rest after it, so an answered step eases out.
 */
export function cystPosed(
  s: CystState,
  ask: CystAsk,
  restBeats: number,
  beat: number,
  beatPhase: number,
): number {
  const t = into(s, beat, beatPhase);
  if (s.phase === "lit" && s.steps[s.cursor]?.ask === ask) return smoothstep(Math.min(1, t * 2));
  if (s.phase === "rest" && s.steps[s.cursor - 1]?.ask === ask) {
    return 1 - smoothstep(t / Math.max(1, restBeats));
  }
  return 0;
}

/** The bend for this frame: both pinches, the lit flank's shake, the swell and the spit lobe. */
export function cystPose(
  world: World,
  s: CystState,
  beat: number,
  beatPhase: number,
  time: number,
): CystPose {
  const rest = world.cfg.cystRestBeats;
  const side = s.phase === "lit" ? cystSide(s) : null;
  const shake: [number, number] = [0, 0];
  if (side !== null) shake[side] = SHAKE * Math.sin(time * SHAKE_HZ * Math.PI * 2);
  const swelling = cystPosed(s, "swell", rest, beat, beatPhase);
  // Held, the swell sinks back; and in the rest after it, it stays sunk as it eases out.
  const held =
    cystLitStep(s)?.ask === "swell"
      ? cystHeldShare(world, s, beatPhase)
      : s.phase === "rest"
        ? 1
        : 0;
  return {
    pinch: [cystPinch(world, s, 0), cystPinch(world, s, 1)],
    shake,
    swell: swelling * (1 - SINK * held),
    bulge: cystPosed(s, "spit", rest, beat, beatPhase),
    time,
  };
}
