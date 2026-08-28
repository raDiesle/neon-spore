import type { OwnMotion } from "@neon-spore/content";
import { APPROACH, CRAWL, PITCH, TURN_IN_DEPTH } from "./depth.js";
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
import { BEAT, HEART, PERISTALSIS } from "./pulse.js";

export { pose } from "./pose.js";
export {
  APPROACH,
  BEAT,
  CANT,
  CRAWL,
  DRIFT,
  HEART,
  HEAVE,
  LURCH,
  PERISTALSIS,
  PITCH,
  SAG,
  SHIVER,
  SLITHER,
  SWELL,
  TOLL,
  TURN,
  TURN_IN_DEPTH,
  TWITCH,
};

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
 * | `depth.ts` | the four that project a body moving in depth onto it |
 * | `pulse.ts` | the three that put an attack in a swell, beside SWELL |
 *
 * `MOTIONS` below is the **only** place that knows which motions exist — the
 * drafts panel iterates it, and `tools/shape-sheet/src/index.ts` re-exports
 * it. A new motion is one entry in a group file and one line here.
 *
 * **A depth variant sits immediately after the motion it answers**, and the
 * order below is the argument for it: nobody can say whether a body reads as
 * turning or as being squashed except by looking at the two of them on one
 * page and one clock, and a page that groups the flat ones together and the
 * dimensional ones together has quietly made the comparison impossible.
 * `docs/dimensional.md` says which of the eleven have no counterpart and why.
 */
export const MOTIONS: OwnMotion[] = [
  SHIVER,
  TWITCH,
  TURN,
  TURN_IN_DEPTH,
  DRIFT,
  TOLL,
  SWELL,
  APPROACH,
  BEAT,
  HEART,
  PERISTALSIS,
  LURCH,
  HEAVE,
  SLITHER,
  CRAWL,
  CANT,
  PITCH,
  SAG,
];
