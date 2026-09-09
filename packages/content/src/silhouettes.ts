import type { ClubbedRim } from "./body-path.js";

/**
 * Creature parameters: lobes, depth and wobble for the shape, `rx` and `ry` for
 * the aspect. Most were tuned in `legacy/style-guide.html`; the ones that were
 * not say where they came from.
 */
export interface CreatureSilhouette {
  lobes: number;
  depth: number;
  wobble: number;
  rx: number;
  ry: number;
  seed: number;
  /** Extra scale below `drawLiving`'s usual fixed footprint. Unset but on the Runt. */
  sizeMul?: number;
  /**
   * A rim of balls on stalks worn over the body, for the one kind that has one.
   * Present and the contour is *walked* rather than sampled by angle —
   * `livingPath` in `body-path.ts` is where that decision is taken, and it is
   * the only place it may be.
   */
  clubs?: ClubbedRim;
}

/**
 * Slick: two broad lobes on the long axis joined at a deep waist — two sacs
 * holding on to each other, where `seed` 2.0 and `depth` 0.38 drew a bean with
 * its lobes across the body. `ry` went 34 to 48 in the same move, because a
 * waist this deep is cut out of the *height*: the pinch alone left the body on
 * the 20-26 px drawn floor, and 48 puts it at 24.4-28.0 with an aspect of 2.3
 * rather than 2.8 : 1. Swallows as it travels (`motions-event.ts`).
 * `creature:slick` / `pinch`, taken in 8 Sept 2026.
 */
export const SLICK: CreatureSilhouette = {
  lobes: 2,
  depth: 0.52,
  wobble: 0.045,
  rx: 68,
  ry: 48,
  seed: 0,
};

/**
 * Bulb: six lobes deep enough to be counted, on a perfectly round body — nine
 * at `depth` 0.13 was a rim moving seven pixels, a texture and not a count. Six
 * is free on the one axis `nameability.ts` measures, and it is the shape a
 * *spore* has. Fills and vents. `creature:bulb` / `six`, taken in 8 Sept 2026.
 */
export const BULB: CreatureSilhouette = {
  lobes: 6,
  depth: 0.24,
  wobble: 0.055,
  rx: 52,
  ry: 52,
  seed: 1.0,
};

/**
 * Dart: between the two bodies the pair already knows, because that is what
 * the owner asked for — "a little bit of Slick and Bulb" — and because the
 * creature is not a stranger to them, it is one of them that has learned to
 * steer. The slick's flat proportion, the bulb's habit of carrying lobes, and
 * one thing neither of them has: a point.
 *
 * **The seed is the whole shape and it is not a free number.** A contour's
 * radius is `1 + depth · cos(lobes · a + seed)` (`hullRadiusMul`), so a lobe's
 * apex sits wherever `lobes · a + seed` is zero. At `2π` with three lobes the
 * apexes land at 0° and ±120° — one straight along the body's own long axis,
 * two swept back behind it. Every other seed in this file is a phase nobody
 * has to think about; this one is *where the point is*, and moving it turns
 * the creature into a trefoil pointing nowhere.
 *
 * **`depth` and the aspect are then one decision, not two.** The nose only
 * reads while the two rear lobes are shorter than it, and how much shorter is
 * set by how flat the ellipse under them is — the same depth on a rounder body
 * gives three equal arms and a propeller, on a flatter one an arrowhead so
 * thin the drawn size falls under the 20 px floor. 0.55 on 64 × 34 is where
 * both hold: a nose, two swept fins, and 26-29 px drawn at the card size
 * `bun run shapes:report` measures.
 *
 * That nose is half of "the shape says where it is going next". The other half
 * is `render/src/dart.ts`, which leans the body along the diagonal it is about
 * to take and flips it about its own centre so the point leads either way.
 *
 * Three lobes is free. Slick has 2, Throb 6, Shell 5 and Bulb 9, and a shape
 * landing on a neighbour's count is a shape the pair says the same word for —
 * TOLD APART BY separates this one from the slick by the lobe count alone,
 * which is the narrowest margin in that table. What the table cannot see is
 * that a dart is never level: it is leaning or jetting on every beat it is
 * alive, and the slick does neither.
 */
export const DART: CreatureSilhouette = {
  lobes: 3,
  depth: 0.55,
  wobble: 0.03,
  rx: 64,
  ry: 34,
  seed: Math.PI * 2,
};

/**
 * Wisp: a bell with a scalloped hem — five shallow lobes on a round body,
 * where it used to be four deep ones.
 *
 * **The count is still what separates it, and the depth is what changed.**
 * Every other axis was already crowded when this body arrived: slick is flat
 * and the other three are round, so aspect cannot separate a fifth body from
 * Bulb and Throb, and every living kind draws at the same fixed footprint, so
 * size cannot either. Lobe count is what is left, it is the axis
 * `tools/shape-sheet/src/nameability.ts` measures, and 5 is as free as 4 was.
 *
 * What 4 lobes at `depth` 0.3 produced on the field was a four-pointed star.
 * That is a fine unique silhouette and the wrong picture for a thing that
 * jumps: a jump is read off squash, stretch and a trailing fringe
 * (`render/wisp-body.ts`), and corners fight all three — a star flattening is
 * a star with bent points, not a mass meeting the ground. Five lobes at 0.22
 * is the same claim made softly: a rim that scallops rather than one that
 * spikes, which is what the hem of a bell actually does.
 *
 * 0.22 and not less, and the floor is measured rather than chosen: below about
 * 0.2 `nameability` stops being able to count the lobes at all and the span
 * opens to 3–5, which is a body that reads as one shape on some frames and
 * another on others — worse than either. That test is the gate; this number
 * sits just inside it.
 *
 * Only one player ever sees this one, and player 2 has to say what it is *and*
 * where across a voice delay to somebody who cannot check. What makes the word
 * come out in one piece is now as much what hangs *under* the contour — five
 * streamers no other body on this roster has — as the contour itself.
 *
 * The wobble is still the highest on the roster and the reason is unchanged: a
 * body that only one of them can see should not look solid. It is a hologram
 * of a thing rather than a thing, and a contour that breathes twice as hard as
 * a bulb's is what says so without a second colour or a second effect.
 */
export const WISP: CreatureSilhouette = {
  lobes: 5,
  depth: 0.22,
  wobble: 0.12,
  rx: 46,
  ry: 46,
  seed: 6.0,
};

/**
 * Choir: one voice of a chorus, and there are three of them in a body.
 *
 * **Round, and deliberately neither of the two the pair has a word for.** A
 * choir carries no colour at all until the pilot's gesture lands, so a voice
 * drawn as a bulb would tell the navigator *cyan* off the silhouette alone —
 * which is the leak `showsVeilCore` refuses about a halo, said about a shape.
 * Nine fine lobes is a bulb, two broad flat ones is a slick and five deep ones
 * is a wisp; three shallow lobes on a nearly round body is a fourth reading,
 * plainly rounded and plainly none of them. Three of them is also the count of
 * voices, which is a rhyme rather than an argument but costs nothing.
 *
 * It is smaller than any body the pair shoots (`rx`, `ry` against BULB's 52),
 * because three of these standing together must not read as three slicks — the
 * mass is one arrival and the voices in it are its parts.
 *
 * **`living-look.ts` still answers `null` for the kind, and must.** That table
 * says "this body is drawn as one contour with one own-motion", and a choir is
 * three; `render/choir.ts` reads this shape three times and places them itself.
 * A row over there would hand the kind to `drawLiving`, which would draw one.
 */
export const CHOIR: CreatureSilhouette = {
  lobes: 3,
  depth: 0.16,
  wobble: 0.05,
  rx: 44,
  ry: 42,
  seed: 3.0,
};

// Which kind is drawn with which of the shapes above is *not* here: it is one
// row per kind in `living-look.ts`, beside that kind's own-motion, because
// "is this a body and which one" is a single fact and this file is a sheet of
// tuned numbers. `livingSilhouette` is exported from there and from the
// package index. This file may not import it back — `living-look.ts` reads
// SLICK and BULB from here, and the arrow only points one way.

// The angular family — the rock, the torch and the queen's shell — is
// `crystals.ts` next door, cut out when THE THROB's clubbed rim took this file
// over its limit. Re-exported here so nothing that already reaches for one
// through this file has to move.
export {
  type CrystalSilhouette,
  METEOR,
  QUEEN_SHELL,
  TORCH,
} from "./crystals.js";
// The ship's own shapes live next door — see `ship-silhouettes.ts` for the
// seam. Re-exported here so nothing that already reaches for them through this
// file has to move.
export {
  CANNON_LOBE,
  HULL,
  HULL_GEOMETRY,
  type HullSilhouette,
  type LobeShape,
  MAW,
  SHIELD_LOBE,
  xToHullAngle,
} from "./ship-silhouettes.js";
// THE BEATBOX's contour is `silhouettes-beatbox.ts` next door, cut out when
// this file went over its limit. Re-exported here so nothing that already
// reaches for it through this file has to move.
export { BEATBOX, beatboxArms } from "./silhouettes-beatbox.js";
// THE THROB is the one body in this family whose contour is **walked** rather
// than sampled by angle — `clubs`, and the branch it takes in `body-path.ts`'
// `livingPath` — so it and the rim it wears are `silhouettes-clubbed.ts` next
// door, cut out when this file came back to its limit. Re-exported here so
// nothing that already reaches for it through this file has to move.
export { THROB } from "./silhouettes-clubbed.js";
// The two contours in this family that are **not a body on the roster** — the
// retired shell and the pod's capsule — are `silhouettes-spare.ts` next door,
// cut out when THE BARB took this file over its limit. Re-exported here so
// nothing that already reaches for one through this file has to move.
export { POD, SHELL } from "./silhouettes-spare.js";
