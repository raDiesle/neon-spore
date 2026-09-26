import { BUILT_STILL } from "./gesture-built.js";
import { BUILT_MOVING } from "./gesture-built-moves.js";
import { STAY_MISSED } from "./gesture-missed.js";
import type { Gesture } from "./gesture-types.js";
import { SPECIFIED } from "./gesture-unbuilt.js";
import { WORTH_CONSIDERING } from "./gesture-unbuilt-b.js";

/**
 * Every gesture on CONTROLS › GESTURES, in the order the page shows them:
 * built, specified, worth considering, and missed on purpose. Four files on
 * line count; this is the one list.
 */
export const GESTURES: readonly Gesture[] = [
  ...BUILT_STILL,
  ...BUILT_MOVING,
  ...SPECIFIED,
  ...WORTH_CONSIDERING,
  ...STAY_MISSED,
];
