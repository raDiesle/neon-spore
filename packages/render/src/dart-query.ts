import type { World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import { drawDartArrow, showsDartArrow } from "./dart.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawQuestion } from "./veil-question.js";

/**
 * Player 1's half of THE DART: two arrows and a question mark. The exact
 * complement of `dart-path.ts` next door, on the seat that file refuses.
 *
 * **The pilot used to be shown nothing, and nothing is not the same sentence
 * as "you are not the one who knows".** A dart fell like everything else falls
 * on that screen — a body in a column — so the cannon was moved into that
 * column, and the reason it was the wrong column arrived a beat later as hull.
 * The creature was working exactly as designed and the picture never said so.
 *
 * Three marks, one sentence, and the sentence is *ask*:
 *
 *  - the **two arrows**, one down each diagonal, drawn with the same call that
 *    draws player 2's single one. Two of a mark that means "this way" is the
 *    only way to say "either way" in a vocabulary the pair already has;
 *  - the **question mark** above them, which is the game's word for a seat
 *    that is told nothing — it stands over a veil on the navigator's screen
 *    (`veil-question.ts`) and it is the same glyph, in the same off-white,
 *    here;
 *  - and the **off-white itself**, which is what keeps this from reading as
 *    player 2's arrow. That one is in the body's own colour, because it is a
 *    fact about that body; these are not about the body at all, they are about
 *    the screen they are on.
 *
 * Dimmer than the navigator's arrow, too, and deliberately: a mark that says
 * "unknown" must never carry the weight of one that says "left".
 */

/** The HUD's off-white — the veil question mark's own, not the lure's
 * absence-of-a-palette white. */
const MARK = PALETTE.text;
/** How faint the two arrows are beside player 2's one. */
const ALPHA = 0.5;
/** Where the question mark stands, in body radii above the body's centre:
 * clear of the arrows, which reach to about two. */
const QUESTION_LIFT = 2.8;

export function drawDartQueries(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
): void {
  // The one seat this is for is the one seat `dart-path.ts` will not draw on.
  // Asked that way round rather than `l.role === "p1"` so the two halves can
  // never both appear, or both go missing, on some third role.
  if (showsDartArrow(l)) return;
  for (const c of world.creatures) {
    if (c.kind !== "dart") continue;
    const { x, y } = creatureCenter(l, c, beatPhase);
    const r = creatureRadius(l, c, beatPhase, world.cfg);
    drawDartArrow(ctx, x, y, r, -1, MARK, ALPHA);
    drawDartArrow(ctx, x, y, r, 1, MARK, ALPHA);
    // `drawQuestion` sizes itself off a tile, and a body far up the field
    // draws smaller than its tile (`depthScale`). Handing it the tile this
    // body would have at its own depth is what keeps the glyph the same size
    // as the arrows under it rather than the same size at every row.
    drawQuestion(ctx, r / 0.4, x, y - r * QUESTION_LIFT);
  }
}
