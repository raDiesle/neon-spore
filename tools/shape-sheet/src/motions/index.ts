import type { OwnMotion } from "@neon-spore/content";
import {
  CANT,
  DRIFT,
  HEAVE,
  LURCH,
  SAG,
  SHIVER,
  SLITHER,
  SWELL,
  TOLL,
  TURN,
  TWITCH,
} from "./plane.js";

export { pose } from "./pose.js";
export { CANT, DRIFT, HEAVE, LURCH, SAG, SHIVER, SLITHER, SWELL, TOLL, TURN, TWITCH };

/**
 * The spare motions: ways a body can move that nothing in the game moves yet.
 *
 * This was one file until it reached the 250-line ceiling. It is now the
 * registry, and the motions themselves are grouped the way `drafts/` groups
 * its cards — by what they are, not one file each:
 *
 * | File | What it holds |
 * |---|---|
 * | `pose.ts` | the five-number helper both groups end in |
 * | `plane.ts` | the eleven that move a body about a flat page |
 *
 * `MOTIONS` below is the **only** place that knows which motions exist — the
 * drafts panel iterates it, and `tools/shape-sheet/src/index.ts` re-exports
 * it. A new motion is one entry in a group file and one line here.
 */
export const MOTIONS: OwnMotion[] = [
  SHIVER,
  TWITCH,
  TURN,
  DRIFT,
  TOLL,
  SWELL,
  LURCH,
  HEAVE,
  SLITHER,
  CANT,
  SAG,
];
