import { SEAM_POINTS, type SeamState, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE SEAM is posed off** (§26, *Animation*): four poses — the
 * crack dark, one point sealed, two sealed, split — with no morph between
 * them but the one lobe that sheds its teeth as its point closes, eased over
 * the rest that follows the seal.
 */

/** How far into its phase the ridge is, in beats, the fraction of this one included. */
export function into(s: SeamState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** The drop into frame: 0 still above the field, 1 standing. */
export function seamArrived(s: SeamState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.seamStillBeats));
}

/**
 * How open each point is: 1 until it is sealed, 0 after, and the point
 * sealed by the step just answered closing over the rest that follows it.
 */
export function seamOpen(s: SeamState, cfg: SimConfig, beat: number, beatPhase: number): number[] {
  const closing = s.phase === "rest" && s.steps[s.cursor - 1]?.seals === true ? s.sealed - 1 : -1;
  const shut = smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.seamRestBeats));
  const open: number[] = [];
  for (let k = 0; k < SEAM_POINTS; k++) {
    if (k === closing) open.push(1 - shut);
    else open.push(k < s.sealed ? 0 : 1);
  }
  return open;
}

/** The point a lit point step asks for: the next unsealed one, down the crack. */
export function seamLitPoint(s: SeamState): number {
  return Math.min(SEAM_POINTS - 1, s.sealed);
}

/** How much of the lit step's beats are left: 1 as it lights, 0 as it runs out. */
export function seamLeft(s: SeamState, beats: number, beat: number, beatPhase: number): number {
  return Math.max(0, 1 - into(s, beat, beatPhase) / Math.max(1, beats));
}

/** How far the whole crack has gaped for grit: eased open over the step's first beat. */
export function seamGape(s: SeamState, gritting: boolean, beat: number, beatPhase: number): number {
  if (!gritting) return 0;
  return smoothstep(into(s, beat, beatPhase));
}

/** How far the sealed ridge has split: 0 whole, 1 fallen apart. */
export function seamSplit(s: SeamState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "split") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.seamSplitBeats));
}
