import type { World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import { drawDartArrow, showsDartArrow } from "./dart.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * Player 1's half of THE DART: two arrows inside a target lock. The exact
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
 *  - the **target lock** around both of them and the body under them, which is
 *    the game's one picture for a seat that is being shown a contact and not
 *    what it is (`target-lock.ts`). It replaced a question mark that stood in
 *    the same place, for the reason that file carries: four markings for one
 *    idea is three too many;
 *  - and the **off-white itself**, which is what keeps this from reading as
 *    player 2's arrow. That one is in the body's own colour, because it is a
 *    fact about that body; these are not about the body at all, they are about
 *    the screen they are on.
 *
 * Dimmer than the navigator's arrow, too, and deliberately: a mark that says
 * "unknown" must never carry the weight of one that says "left".
 */

/** The HUD's off-white — not the lure's absence-of-a-palette white, which is
 * spent on *do not shoot* and has to stay spent. */
const MARK = PALETTE.text;
/** How faint the two arrows are beside player 2's one. */
const ALPHA = 0.5;
/**
 * The frame's half-extents, in body radii, and where its centre sits above the
 * body's own.
 *
 * A portrait rectangle rather than a square, because what is being locked is
 * not the body alone: the two arrows stand about two radii above it
 * (`drawDartArrow`), and a frame that cut across them would have picked out
 * half of its own sentence. So the box holds the body and both arrows, and
 * nothing of it comes within a radius of the contour underneath.
 */
const BOX_HALF_W = 1.35;
const BOX_HALF_H = 1.78;
const BOX_LIFT = 0.48;

export function drawDartQueries(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  /** The wall clock, for the lock's flicker (`target-lock.ts`). */
  time: number,
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
    // Sized off the body's own radius rather than off a tile: a body far up
    // the field draws smaller than its tile (`depthScale`), and a frame that
    // ignored that would stand a fixed size around a shrinking creature.
    drawTargetLock(ctx, x, y - r * BOX_LIFT, r * BOX_HALF_W, r * BOX_HALF_H, MARK, time, 0.9, c.id);
  }
}
