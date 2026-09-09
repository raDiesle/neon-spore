import type { Variant } from "../variant.js";
import { BREAK_SHATTER } from "./creature-break/shatter/index.js";
// region: candidates
import { METEOR_FORGE } from "./creature-meteor/forge/index.js";
import { SKIN_VEIL } from "./creature-skin/veil/index.js";
import { EYE_GLAZE } from "./eye-iris/glaze/index.js";
import { EYE_TURN } from "./eye-iris/turn/index.js";
import { GHOST_LATITUDE } from "./ghost-tears/latitude/index.js";
import { GHOST_SLIDE } from "./ghost-tears/slide/index.js";
import { MAZE_RAIL } from "./maze-walls/rail/index.js";
import { MAZE_WELL } from "./maze-walls/well/index.js";
import { JOIN_BOTH } from "./panel-join/both/index.js";
import { JOIN_ORGANS } from "./panel-join/organs/index.js";
import { JOIN_ROOF } from "./panel-join/roof/index.js";
import { SHELL_SLAB } from "./shell-plate/slab/index.js";
import { SHELL_WORN } from "./shell-plate/worn/index.js";
import { CRATER_SPALL } from "./ship-crater/spall/index.js";
import { TORCH_BLOOM } from "./torch-veil/bloom/index.js";
import { TORCH_FIFTH } from "./torch-veil/fifth/index.js";
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
 *
 * **What this page has already decided is `../DECIDED.md`.** Every slot that
 * has been opened and how it left — taken into the game, cut, rehoused, or
 * taken and changed — used to be this comment, and it had become a changelog
 * long enough to push the file past its 250-line ceiling. It is worth reading
 * before a slot is opened: two of the questions on it were asked, answered and
 * then asked again in a better shape, and one look was taken and immediately
 * changed, none of which the candidates still standing show.
 */
export const VARIANTS: Variant[] = [
  METEOR_FORGE,
  SKIN_VEIL,
  JOIN_ROOF,
  JOIN_ORGANS,
  JOIN_BOTH,
  BREAK_SHATTER,
  CRATER_SPALL,
  SHELL_SLAB,
  SHELL_WORN,
  EYE_TURN,
  EYE_GLAZE,
  GHOST_LATITUDE,
  GHOST_SLIDE,
  TORCH_FIFTH,
  TORCH_BLOOM,
  MAZE_WELL,
  MAZE_RAIL,
];
