import type { Variant } from "../variant.js";
// region: candidates
import { SHOT_STREAK } from "./cannon-shot/streak/index.js";
import { MAGNET_COIL } from "./creature-magnet/coil/index.js";
import { METEOR_FORGE } from "./creature-meteor/forge/index.js";
import { SKIN_LIT } from "./creature-skin/lit/index.js";
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
 * `creature:strand` left with its slot decided rather than closed. Two of its
 * three candidates lost — the sealed ovoid, which teaches a third shape, and
 * `hooked` beside it in the magnet's slot — and `mute` **won and shipped**: the
 * reel rolls at six swaps a second in one violet, which is what
 * `strand-bead.ts` and `strand-reel.ts` now draw. The colour was the whole of
 * the argument. A reel wearing each face's real colour says the sharper thing
 * on paper — *it is one of these two* — and on a phone it puts a red body in
 * front of a navigator who is about to say a colour out loud.
 *
 * `panel:action-face` left by being *chosen*. The owner looked at SHIELD and
 * SUCK beside the two emblems and picked the pictures, so the membrane that
 * swells into the ward and dips into the throat is what
 * `packages/render/src/action-face.ts` draws on every action button now, and
 * `ActionLook` — the record that existed to hold two faces at once — went with
 * the directory. REACH, the third button and the one the candidate never drew,
 * got an emblem of its own in the same language rather than keeping the word:
 * the same swelling with the claw's own rails and open fingers standing out of
 * it, at `reach-arm.ts`'s own proportions.
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
export const VARIANTS: Variant[] = [SHOT_STREAK, METEOR_FORGE, MAGNET_COIL, SKIN_LIT];
