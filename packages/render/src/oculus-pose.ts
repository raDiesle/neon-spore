import {
  OCULUS_LEAVES,
  type OculusState,
  oculusBothHeld,
  oculusLitStep,
  type SimConfig,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE OCULUS is posed off** (§27, *Animation*): five poses — open,
 * two leaves shut, four, all six with the socket cracking, shattered — and
 * the one morph between them the spec asks for, a pair of leaves sliding
 * across the face as both thumbs hold it.
 *
 * **The hold is the slide.** A lit shut step draws its pair closing by the
 * share of its beats both leaves have been down, so the pair creeps across
 * while the thumbs stay and the count is read off the face rather than off a
 * number; a thumb lifted drops the count to nought and the pair is back out.
 */

/** Pairs are opposite leaves: leaf `k` and leaf `k + 3` shut together. */
const PAIRS = OCULUS_LEAVES / 2;
/** How far a cracked pair stands open while a reseal is owed. */
const CRACK = 0.45;

/** How far into its phase the lens is, in beats, the fraction of this one included. */
export function into(s: OculusState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** The drop into frame: 0 still above the field, 1 standing. */
export function oculusArrived(
  s: OculusState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.oculusStillBeats));
}

/** The pair a lit step works on: the next to shut, or — for a reseal — one of the shut ones, turn about. */
export function oculusLitPair(s: OculusState): number {
  const step = oculusLitStep(s);
  if (step?.ask === "reseal") return s.cursor % PAIRS;
  return Math.min(PAIRS - 1, s.leavesShut / 2);
}

/** How much of a lit hold step both thumbs have held, the running beat included while both are down. */
export function oculusHeldShare(s: OculusState, beatPhase: number): number {
  const step = oculusLitStep(s);
  if (step === null || (step.ask !== "shut" && step.ask !== "reseal")) return 0;
  const running = oculusBothHeld(s) ? beatPhase : 0;
  return Math.min(1, (s.heldBeats + running) / Math.max(1, step.beats));
}

/**
 * How shut each leaf is, 0 open to 1 shut: every leaf of a shut pair closed,
 * the lit pair sliding across as it is held, a cracked pair standing part
 * open until it is held shut again, and all of them springing open as the
 * lens shatters.
 */
export function oculusShut(
  s: OculusState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number[] {
  const pairsShut = s.leavesShut / 2;
  const step = oculusLitStep(s);
  const lit = oculusLitPair(s);
  const held = oculusHeldShare(s, beatPhase);
  const burst = s.phase === "shatter" ? oculusShatter(s, cfg, beat, beatPhase) : 0;
  const shut: number[] = [];
  for (let k = 0; k < OCULUS_LEAVES; k++) {
    const pair = k % PAIRS;
    let v = pair < pairsShut ? 1 : 0;
    if (step?.ask === "shut" && pair === lit) v = held;
    if (step?.ask === "reseal" && pair === lit) v = 1 - CRACK * (1 - held);
    shut.push(v * (1 - Math.min(1, burst * 2)));
  }
  return shut;
}

/** How far the socket stands open: easing open over a break, open while the sim says so, shut otherwise. */
export function oculusSocket(s: OculusState, beat: number, beatPhase: number): number {
  const step = oculusLitStep(s);
  if (step?.ask === "break") return smoothstep(into(s, beat, beatPhase) / Math.max(1, step.beats));
  return s.socketOpen ? 1 : 0;
}

/** How much of the lit step's window is left: 1 as it lights, 0 as it runs out. */
export function oculusLeft(s: OculusState, beats: number, beat: number, beatPhase: number): number {
  return Math.max(0, 1 - into(s, beat, beatPhase) / Math.max(1, beats));
}

/** How far the lens has shattered: 0 whole, 1 fallen apart. */
export function oculusShatter(
  s: OculusState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "shatter") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.oculusShatterBeats));
}
