import type { Variant } from "../variant.js";
// region: candidates
import { SHOT_STREAK } from "./cannon-shot/streak/index.js";
import { SHIELD_CHARGE_ARCS } from "./shield-charge/index.js";
import { SHIELD_CHARGE_FLASH } from "./shield-flash/index.js";
import { HULL_WARM } from "./ship-hull.warm/index.js";
// endregion

/**
 * Every candidate currently offered, in the order the pair should show them.
 *
 * Assembled the way `tools/shape-sheet/src/drafts/index.ts` assembles DRAFTS —
 * one import per candidate, one array — for the same reason: adding an answer
 * is one directory and one line, and removing a decided slot is a `git rm -r`
 * and the same line back out again.
 *
 * The left-hand side of the pair is not in here. It is whatever the game draws
 * today, read off the live records, and giving it an entry would be a second
 * copy of shipped values in a tool.
 *
 * An empty array is a correct state, not a broken one: `variant.ts`, `seed.ts`,
 * `run.ts` and this file all stay whether or not a slot is open. They are the
 * seam, the way `Effects` stays whether or not anything is exploding.
 */
export const VARIANTS: Variant[] = [
  HULL_WARM,
  SHOT_STREAK,
  SHIELD_CHARGE_ARCS,
  SHIELD_CHARGE_FLASH,
];
