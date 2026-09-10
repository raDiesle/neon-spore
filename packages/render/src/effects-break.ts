import { hasOwnBody, livingPoints, livingSilhouette } from "@neon-spore/content";
import type { Color, CreatureKind, SimEvent } from "@neon-spore/sim";
import { hitFor } from "./body-hit.js";
import { contourClock, livingRadius, livingScale } from "./creature-place.js";
import { colorTrio } from "./creature-tint.js";
import type { Debris } from "./debris.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * Turning a `destroy` into a body coming apart.
 *
 * Its own file rather than four more lines in `effects-ingest.ts`'s switch,
 * which was already within twenty lines of the limit — and because what is
 * awkward here is worth writing down where somebody will read it.
 *
 * **The event says what died, and that is the only thing asked.** `destroy`
 * carries the kind the body was *drawn* as (`wornKind` in the simulation, so a
 * lure arrives here as the slick or the bulb it was wearing), and the contour
 * comes straight off it. It used to come off the colour instead — red is a
 * slick and cyan a bulb — which is right for an ordinary kill and wrong for
 * every body that is neither: a magnet cut into a slick's wedges is the wrong
 * silhouette at a size where the difference is visible.
 *
 * **A kind with no body of its own leaves no pieces.** THE MAGNET, THE GHOST,
 * THE LID, THE CRAWLER, THE BALLOON, THE CHOIR and the rest are drawn by paths
 * of their own rather than by a radial contour, so `livingSilhouette` has
 * nothing to hand back for them and cutting them out of somebody else's
 * outline is the defect above wearing a different coat. Drawing nothing is the
 * honest answer until each of those bodies offers its own outline to be cut.
 *
 * **Which pieces, and how many squares, is the kind's own answer.** Both are
 * read off `hitFor(kind)` (`body-hit.ts`) rather than off `BREAK_LOOK`
 * directly: every kind hands back the same shipped record today, and the
 * lookup is what lets the slick's hit be offered a second answer without the
 * dart's changing with it.
 */

/** Where the pieces come to rest: the ship's own skin line. A body is killed
 * over the hull, so what is left of it falls onto the hull, which is the
 * owner's answer to whether a break may leave anything behind. */
export function breakBody(
  debris: Debris,
  l: Layout,
  time: number,
  e: { col: number; row: number; color: Color; kind: CreatureKind; of?: CreatureKind },
): void {
  if (!hasOwnBody(e.kind)) return;
  const shape = livingSilhouette(e.kind);
  // No creature left to ask, so no `livingBodyMul`: a body that was small (an
  // echo) or large (a rind) breaks at the plain footprint. Both are rarer than
  // the ordinary kill and both are still the right *shape*.
  const r = livingRadius(l.tile, 1);
  const trio = colorTrio(e.color);
  // The same seed shape `scars.ts` uses for the same reason: a break must look
  // identical on both phones, and a column and a row are the only two numbers
  // both of them agree about.
  const seed = Math.imul(e.col + 1, 73856093) ^ Math.imul(e.row + 1, 19349663);
  debris.break({
    look: hitFor(e.kind, e.of).pieces,
    outline: livingPoints(shape, contourClock(seed, time)),
    scale: livingScale(shape, r),
    x: tileCX(l, e.col),
    y: tileCY(l, e.row),
    tile: l.tile,
    floor: l.hullY,
    hex: trio.hex,
    dark: trio.dark,
    seed,
  });
}

/**
 * The kill burst, turned down by however much the look asks for.
 *
 * Here rather than in `effects-spark.ts`'s own table, and not only because that
 * file is at its line limit: the table is a list of what each event costs in
 * particles, and this is a fact about *one look* competing with them. A
 * candidate that gives a body real pieces has to be able to take the squares
 * back in the same breath, or the pair is judging two effects playing at once
 * and cannot say which one it liked.
 *
 * Every other event is handed straight back, so nothing but a kill can be
 * quietened by a break look.
 */
export function breakSparks(e: SimEvent, n: number): number {
  return e.type === "destroy" ? Math.round(n * hitFor(e.kind, e.of).pieces.sparkScale) : n;
}
