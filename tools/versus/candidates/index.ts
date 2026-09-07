import type { Variant } from "../variant.js";
// region: candidates
import { SHOT_STREAK } from "./cannon-shot/streak/index.js";
import { MAGNET_HOOKED } from "./creature-magnet/hooked/index.js";
import { METEOR_FORGE } from "./creature-meteor/forge/index.js";
import { STRAND_MUTE } from "./creature-strand/mute/index.js";
import { STRAND_SEALED } from "./creature-strand/sealed/index.js";
import { PANEL_EMBLEM } from "./panel-action/emblem/index.js";
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
 * `ship:hull-skin` / `warm` left this list by being *answered*, which is the
 * only way anything is meant to. The answer was not "violet" or "amber" but
 * both: the amber hull is player two's ship and the violet one is player one's,
 * so the pair can tell whose screen they are looking at without reading a word
 * (`packages/render/src/seat-skin.ts`). A question with a shipped answer is not
 * a question, so the directory went with the entry.
 *
 * `grip:ring-pause` left without a vote, because the question it asked had
 * already been answered somewhere else on the same frame. It asked how the
 * field should say that a body just carried a column cannot be carried again
 * for a beat, and its premise was that nothing said so. Something does: the
 * two white carry arrows beside the body are drawn only while
 * `carryIsReady` (`grip-arrows.ts`), so they go out for the length of the
 * pause and come back with it. `latch`, which stopped the ring turning for
 * those same beats, was a second and much quieter statement of a fact the
 * arrows already make loudly — and a stopped ring reads as a hand *let go*
 * while the beam is still pulling, which is the one thing the grip's picture
 * must not say. The owner could not see the difference on the pair; magnified
 * six times it is there and on a phone it is not.
 *
 * `crawler:pulse` left the same way, and by the answer a vote is *most* worth
 * having: the owner looked at the pair and could not tell which side was
 * stepped. That is not a tie. The slot asked whether a quantised contraction
 * reads as a body ticking, the eye said no, and the cheaper of the two
 * candidates shipped — sixteen positions, and a contour a renderer bakes once
 * instead of nine times a frame (`packages/content/src/crawler-shape.ts`).
 * `fine` went with it: it existed only to buy back half a step nobody could
 * see the whole of.
 */
export const VARIANTS: Variant[] = [
  SHOT_STREAK,
  METEOR_FORGE,
  MAGNET_HOOKED,
  STRAND_SEALED,
  STRAND_MUTE,
  PANEL_EMBLEM,
];
