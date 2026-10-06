import { type FlueState, midCol, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import { flueSightAt, flueUnitR, type Point } from "./flue-shape.js";
import type { Layout } from "./layout.js";
import { phaseInto } from "./phase-into.js";

/**
 * **THE FLUE hangs on its shots** (the owner, 6 October 2026: *let the boss
 * hang down on three strings, which is the number of lives … when one shot
 * did not hit, a string is torn and the boss hangs a little distorted … on
 * every new level the strings grow again*). The three strings are the
 * level's shots, in place of the three pips that stood under the sight.
 *
 * A miss cuts the outer one on the left first, and the flue droops on that
 * side; the second cuts the right, and it hangs off the middle one alone,
 * swinging; the third is the wave, and it drops. Between levels the cut ones
 * grow back down from the dark over the rest (`fluePauseBeats`), so a level
 * lights with all three whole.
 *
 * **It turns round the sight**, and only there does it stay still: the sight
 * is where every shot is met, so wherever it hangs a bolt still ends on it.
 * Everything here is read off the boss and the picture's clock; the swing a
 * cut sets going is `FlueFx`'s (`flue-fx.ts`).
 */

/** Where each string holds the flue, in columns off the middle, in the order a miss cuts them. */
const HOLDS = [-3, 3, 0] as const;
/** How far the flue droops on one string cut, in radians, how wide it swings on the middle
 * one alone and how fast, in radians a second, and how far it drops on none, in tiles. */
const DROOP = 0.075;
const SWAY = 0.05;
const SWAY_RATE = 1.3;
const DROP = 0.5;

/** How many strings the flue hangs on. */
export const FLUE_STRINGS = HOLDS.length;

/** Where string `i` holds the flue, on its crown, before the flue is turned. */
export function flueStringFoot(l: Layout, cfg: SimConfig, i: number): Point {
  const sight = flueSightAt(l, cfg);
  return { x: fieldX(l, midCol(cfg) + (HOLDS[i] ?? 0)), y: sight.y - flueUnitR(l) * 0.8 };
}

/** How many strings are cut: one a shot spent, none once the flue is spent. */
export function flueStringsCut(s: FlueState): number {
  if (s.phase === "spent") return 0;
  return Math.max(0, Math.min(FLUE_STRINGS, FLUE_STRINGS - s.shots));
}

/**
 * How far the cut strings have grown back, 0 to 1: over the rest after a
 * level is cleared, and never after the last shot, which is the wave.
 */
export function flueStringsGrown(
  s: FlueState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "rest" || s.shots === 0) return 0;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.fluePauseBeats));
}

/** Which way the first string's side drops when the flue is turned: 1 clockwise. */
function droopSide(l: Layout, cfg: SimConfig): number {
  return flueStringFoot(l, cfg, 0).x < flueSightAt(l, cfg).x ? -1 : 1;
}

/** How far the flue is turned on `cut` strings cut, at rest: the swing's either end. */
export function flueDroop(l: Layout, cfg: SimConfig, cut: number): number {
  const side = droopSide(l, cfg);
  if (cut <= 0) return 0;
  if (cut === 1) return side * DROOP;
  if (cut === 2) return side * DROOP * 0.4;
  return side * DROOP * 2;
}

export interface FlueHang {
  /** How far it is turned round the sight, radians, clockwise. */
  tilt: number;
  /** How far it has dropped, in pixels. */
  drop: number;
  /** How whole each string is: 1 whole, 0 cut, between growing back. */
  whole: number[];
}

/** How THE FLUE hangs this frame, with `swing` the turn a cut set going (`FlueFx`). */
export function flueHang(
  l: Layout,
  cfg: SimConfig,
  s: FlueState,
  beat: number,
  beatPhase: number,
  time: number,
  swing: number,
): FlueHang {
  const cut = flueStringsCut(s);
  const grown = flueStringsGrown(s, cfg, beat, beatPhase);
  const loose = cut === 2 ? SWAY * Math.sin(time * SWAY_RATE) : 0;
  const whole = HOLDS.map((_, i) => (i < cut ? grown : 1));
  return {
    tilt: (flueDroop(l, cfg, cut) + loose) * (1 - grown) + swing,
    drop: cut >= FLUE_STRINGS ? DROP * l.tile : 0,
    whole,
  };
}

/** `p` turned by `tilt` round `about` and dropped by `drop`. */
export function flueHung(p: Point, about: Point, tilt: number, drop: number): Point {
  const dx = p.x - about.x;
  const dy = p.y - about.y;
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  return { x: about.x + dx * c - dy * s, y: about.y + dx * s + dy * c + drop };
}
