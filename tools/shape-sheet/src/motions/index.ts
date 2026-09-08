import { type OwnMotion, SWAY_PUMP, TILT_RIPPLE } from "@neon-spore/content";
import { RECOIL, SETTLE, TUMBLE, WIND } from "./borrowed.js";
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
import { BEAT, HEART, JET, PERISTALSIS } from "./pulse.js";

export { pose } from "./pose.js";
export {
  APPROACH,
  BEAT,
  CANT,
  CRAWL,
  DRIFT,
  HEART,
  HEAVE,
  JET,
  LURCH,
  PERISTALSIS,
  PITCH,
  RECOIL,
  SAG,
  SETTLE,
  SHIVER,
  SLITHER,
  SWELL,
  TOLL,
  TUMBLE,
  TURN,
  TURN_IN_DEPTH,
  TWITCH,
  WIND,
};

/**
 * The spare motions: ways a body can move that nothing in the game moves.
 *
 * "Yet" was true until 8 September 2026, when the slick's TILT · RIPPLE and
 * the bulb's SWAY · PUMP were retired for SWALLOW and BLOOM — so the list now
 * holds two of a second kind, a motion the game *stopped* moving with. They
 * are here rather than deleted for CLAUDE.md's reason: a look that is taken
 * out is kept where it can be seen, and the only place a motion can be seen is
 * on a body, on a clock, beside the one that replaced it. They are imported
 * from `@neon-spore/content` and never copied, so what animates here is the
 * record itself and cannot drift from the day it shipped.
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
 * | `borrowed.ts` | the four read off other games — see `docs/tower-defence.md` |
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
  // Immediately after TURN for the same reason a depth variant is: TUMBLE is
  // that rotation with a second clock on it, and whether the tremor is visible
  // at all can only be answered by the two of them on one page. WIND is the
  // third of that family and the only one whose rate is not constant.
  TUMBLE,
  WIND,
  DRIFT,
  TOLL,
  SWELL,
  APPROACH,
  BEAT,
  HEART,
  // Beside the other three that pulse, and last of them, because it is the one
  // that is only half a gesture: the other half is the contour's, and a card
  // showing JET on a body that does not squeeze is showing a bob.
  JET,
  PERISTALSIS,
  LURCH,
  SETTLE,
  HEAVE,
  RECOIL,
  SLITHER,
  CRAWL,
  CANT,
  PITCH,
  SAG,
  // Last, and the only two here that are retired rather than unspent: the
  // slick's and the bulb's own motions until SWALLOW and BLOOM replaced them.
  // At the end rather than beside their kin, because a reader browsing for a
  // motion to spend wants the unspent ones first.
  TILT_RIPPLE,
  SWAY_PUMP,
];
