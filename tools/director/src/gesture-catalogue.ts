import { BUILT_STILL } from "./gesture-built.js";
import { BUILT_FOR_BOSSES } from "./gesture-built-bosses.js";
import { BUILT_MOVING } from "./gesture-built-moves.js";
import { STAY_MISSED } from "./gesture-missed.js";
import { RULED_OUT } from "./gesture-missed-ruled.js";
import type { Gesture } from "./gesture-types.js";

/**
 * Every gesture on CONTROLS › GESTURES, in the order the page shows them:
 * built, specified, and missed on purpose. Five files on line count; this is
 * the one list. Nothing is specified today: the last eight the spec asked for
 * were built or ruled out by 30 September 2026. Nothing is worth considering
 * either: the owner ruled out the last two and took CALL AND RESPONSE off as
 * no control at all — a way of using TAP RHYTHM with the beat — on 10 October
 * 2026.
 */
export const GESTURES: readonly Gesture[] = [
  ...BUILT_STILL,
  ...BUILT_MOVING,
  ...BUILT_FOR_BOSSES,
  ...STAY_MISSED,
  ...RULED_OUT,
];
