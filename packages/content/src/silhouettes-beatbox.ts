import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * Beatbox: a rounded cabinet, and the one body on this roster whose contour is
 * *architecture* rather than an organism.
 *
 * Cut out of `silhouettes.ts` when this shape took that file over its
 * 250-line limit, on the same terms `crystals.ts` and `silhouettes-spare.ts`
 * were: one contour, on its own, because the argument for its numbers is
 * longer than the numbers are. `silhouettes.ts` re-exports it, so nothing
 * that already reaches for `BEATBOX` through that file had to move.
 *
 * **Four lobes, and the seed puts the corners on the diagonals.** A contour's
 * radius is `1 + depth · cos(lobes · a + seed)` (`hullRadiusMul`), so an apex
 * sits wherever `lobes · a + seed` is nought. At `π` with four lobes the
 * apexes land at 45°, 135°, 225° and 315° — corners on the diagonals, and
 * therefore *flats* at the top, the bottom and both sides. That is what makes
 * this read as a box with its edges rounded off standing squarely on its base,
 * rather than as a four-pointed star, and it is the whole shape: move the seed
 * an eighth of a turn and the flats become the corners, which is a diamond
 * balanced on a point.
 *
 * **Four is the last free lobe count and it is spent well here.** Slick has 2,
 * Choir, Throb and Dart have 3, Wisp 5 and Bulb 9, so the axis
 * `tools/shape-sheet/src/nameability.ts` measures separates this from every
 * one of them by a whole count — and unlike the other five, the count here is
 * *visible as a silhouette rather than as a rim*, because four shallow lobes
 * is a recognisable outline (a box) and not a number to be counted round an
 * edge. The pair says "box" and nobody has to count anything.
 *
 * **`depth` is 0.10 and it is deliberately below the countable floor.** It was
 * 0.22 — Wisp's figure, chosen for Wisp's measured reason, that under about 0.2
 * lobes stop being countable and the shape reads as a plain circle on some
 * frames. That was the right number while the four lobes were the only thing
 * this body had to say, and it is the wrong one now: the owner asked for the
 * box to be *more circle like rounded, so we cannot identify the 4 raised so
 * much*, and he is describing a body that has since grown a second and louder
 * feature. What a pair counts on a soundbox is its **arms**, one per beat they
 * got right (`beatboxArms`), and four permanent corners competing with a
 * changing number of arms is two counts on one silhouette.
 *
 * So the lobes are a *squaring* now rather than a count: enough of a flat top
 * and flat sides to keep the body reading as a cabinet standing on its base,
 * and not enough to be mistaken for something to count. The shape it is nearest
 * to at this depth is a bulb, and nothing separates the two by contour any
 * more — which costs nothing, because a bulb is a body that is shot and a box
 * is a body wearing a target lock, a numeral and a row of dots.
 *
 * Slightly wider than it is tall, which is a cabinet's proportion and also a
 * working difference from Bulb's exact 52 × 52. The **swelling** is not here:
 * a box grows and shrinks on every beat, and that is drawn against the beat
 * clock in `render/beatbox.ts` rather than baked into a contour, because a
 * silhouette is what a thing *is* and the pulse is what it is doing.
 */
export const BEATBOX: CreatureSilhouette = {
  lobes: 4,
  depth: 0.1,
  wobble: 0.04,
  rx: 54,
  ry: 48,
  seed: Math.PI,
};

/**
 * **The arms a box has grown**, as the same rim of balls on stalks THE THROB
 * wears.
 *
 * The owner asked for this by name: the box starts rounded, and every beat the
 * navigator taps correctly it *grows an arm*, still part of the body the way
 * the cannon is part of the hull. `ClubbedRim` is exactly that construction
 * and it already ships — the contour is **walked** out of the body, up one
 * side of a neck, round the cap and back down the other, so what comes out is
 * one closed outline and the arm is the same mass as the box rather than a
 * shape drawn beside it (`body-path.ts`). Nothing here is new geometry; it is
 * THE POMMEL's walk given a count that changes.
 *
 * `null` for a box nobody has touched, which is the whole of "starts rounded":
 * with no rim the contour falls back to the four shallow lobes above, and the
 * pair sees a plain rounded cabinet.
 *
 * The numbers are a tuning of the same walk rather than a second opinion about
 * it, and they sit at the other end of it from the throb's. `reach` is nearly
 * four times its 0.26 and `cap` is under its 0.36, because these are *arms* and
 * a throb's are knobs: a short stalk under a big ball reads as a lumpy body,
 * and an arm has to be countable at forty pixels from across a room. `neck` is
 * thinner for the same reason — a stalk as wide as its cap is a lobe.
 *
 * `vary` is nought and it is the one figure that is not a tuning. A throb's rim
 * is uneven so six knobs read as alive; here every arm stands for one beat the
 * pair got right, and arms of visibly different sizes would be saying something
 * about those beats that is not true. They are still not quite equal, and that
 * is the body rather than the rim: a cap is sized against the radius *under*
 * it, and this contour is wider than it is tall, so an arm out of a side is
 * larger than one out of the top. Evening that out would mean sizing caps
 * against an average radius, which is the thing `ClubbedRim.reach` is
 * documented as refusing — half the caps would sit inside the rim.
 */
export function beatboxArms(hits: number, grown: number): CreatureSilhouette {
  if (hits <= 0) return BEATBOX;
  return {
    ...BEATBOX,
    clubs: { clubs: hits, reach: 0.95, cap: 0.32, neck: 0.34, vary: 0, newest: grown },
  };
}
