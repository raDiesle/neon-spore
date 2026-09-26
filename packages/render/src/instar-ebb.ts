import { type InstarState, instarStep } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type Figure, instarMorphAt, instarPhaseAt, instarThreat } from "./instar-shape.js";

/**
 * What the window built up — the fire in the mouth, the glow on a blade —
 * easing off over the landing: 1 through the window, down to nought across
 * `landBeats`. A step can land with its jaws shut and its fire still lit (a
 * glob shielded, a jaw pushed to), and without this the fire went out in a
 * frame on the landing tick.
 */
export function instarEbb(s: InstarState, beat: number, beatPhase: number): number {
  const step = instarStep(s);
  if (s.phase !== "land" || step === null) return 1;
  return 1 - smoothstep(instarPhaseAt(s, beat, beatPhase) / step.landBeats);
}

/**
 * How bright the fire in the mouth burns, 0..1: lit a little as the morph
 * into a pose that breathes it comes on, growing with the window, and ebbing
 * over the landing from where the window left it (`held`). The rear and the
 * roar light the same fire: their globs are spat out of it.
 */
export function instarFire(
  s: InstarState,
  f: Figure,
  beat: number,
  beatPhase: number,
  held: number,
): number {
  const pose = instarStep(s)?.pose;
  if (pose !== "breath" && pose !== "rear" && pose !== "roar") return 0;
  if (s.phase === "morph") return f.flame * 0.3 * instarMorphAt(s, beat, beatPhase);
  if (s.phase === "act") return f.flame * (0.3 + 0.7 * instarThreat(s, beat, beatPhase));
  if (s.phase !== "land") return 0;
  const ebb = instarEbb(s, beat, beatPhase);
  return f.flame * (0.3 + 0.7 * held * ebb) * ebb;
}
