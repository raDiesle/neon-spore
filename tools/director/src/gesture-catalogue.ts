import { BUILT_STILL } from "./gesture-built.js";
import { BUILT_FOR_BOSSES } from "./gesture-built-bosses.js";
import { BUILT_MOVING } from "./gesture-built-moves.js";
import { STAY_MISSED } from "./gesture-missed.js";
import type { Gesture } from "./gesture-types.js";
import { WORTH_CONSIDERING } from "./gesture-unbuilt-b.js";

/**
 * Every gesture on CONTROLS › GESTURES, in the order the page shows them:
 * built, specified, worth considering, and missed on purpose. Five files on
 * line count; this is the one list. Nothing is specified today: the last
 * eight the spec asked for were built or ruled out by 30 September 2026.
 */
export const GESTURES: readonly Gesture[] = [
  ...BUILT_STILL,
  ...BUILT_MOVING,
  ...BUILT_FOR_BOSSES,
  ...WORTH_CONSIDERING,
  ...STAY_MISSED,
];
