import type { Variant } from "../variant.js";
// region: candidates
import { METEOR_FORGE } from "./creature-meteor/forge/index.js";
import { SKIN_VEIL } from "./creature-skin/veil/index.js";
import { SHIP_BARREL } from "./ship-light/barrel/index.js";
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
 * ## The slots that have left, and how
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
 * pause and come back with it.
 *
 * `creature:strand` left with its slot decided rather than closed, and `mute`
 * **won and shipped**: the reel rolls at six swaps a second in one violet,
 * which is what `strand-bead.ts` and `strand-reel.ts` now draw.
 *
 * `panel:action-face` left by being *chosen*. The owner looked at SHIELD and
 * SUCK beside the two emblems and picked the pictures, so the membrane that
 * swells into the ward and dips into the throat is what
 * `packages/render/src/action-face.ts` draws on every action button now.
 *
 * `crawler:pulse` left the same way, and by the answer a vote is *most* worth
 * having: the owner looked at the pair and could not tell which side was
 * stepped. The cheaper of the two candidates shipped — sixteen positions, and
 * a contour a renderer bakes once instead of nine times a frame
 * (`packages/content/src/crawler-shape.ts`).
 *
 * ## Seven at once, on 8 September 2026
 *
 * The owner read the whole page and emptied most of it in one sitting, which
 * is the throughput this arrangement was built for. Six were **taken into the
 * game**, and each is now the only answer there is: `creature:magnet` / `coil`
 * (`packages/render/src/magnet-coil.ts`), `creature:skin` / `lit`
 * (`living-skin.ts`), `creature:slick` / `pinch` and `creature:bulb` / `six`
 * (`packages/content/src/silhouettes.ts`), and `creature:dart` / `torch`
 * (`dart-torch.ts`). The seventh, `cannon:shot` / `streak`, was **cut** — no
 * vote, no shipped half, the owner simply did not want the question open.
 *
 * Two of that seven were not decided so much as **rehoused**, and they are the
 * first candidates to leave by moving rather than by winning or losing.
 * `creature:dart` / `wake` and the dart plume `torch` displaced are both on
 * the SHAPES tab's TAIL axis now (`tools/director/src/tails/`), where a mark
 * left behind a falling body sits beside the five others of its kind instead
 * of beside one creature; and `creature:throb` / `crown` is a draft in the
 * shape catalogue (`tools/shape-sheet/src/drafts/creatures.ts`), where a
 * contour is measured against the bodies it could be mistaken for. VERSUS
 * asks *which of these two*, and a look nobody is ready to choose between is
 * better kept where it can be browsed than kept as a question nobody answers.
 */
export const VARIANTS: Variant[] = [METEOR_FORGE, SKIN_VEIL, SHIP_BARREL];
