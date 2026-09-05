import type { ClubbedRim } from "./body-path.js";

/**
 * Creature and hull parameters for the raster game. These are tuned in
 * legacy/style-guide.html and transcribed here as data.
 *
 * Each creature is defined by lobes, depth, and wobble (shape), plus rx, ry
 * (aspect ratio). The hull shares these shape parameters and adds a cannon,
 * which is itself a bump on the hull contour.
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

/** Slick: two broad lobes, wide and flat. Tilts and ripples as it travels. */
export const SLICK: CreatureSilhouette = {
  lobes: 2,
  depth: 0.38,
  wobble: 0.045,
  rx: 68,
  ry: 34,
  seed: 2.0,
};

/** Bulb: many fine lobes around a round body. Pumps and sways. */
export const BULB: CreatureSilhouette = {
  lobes: 9,
  depth: 0.13,
  wobble: 0.055,
  rx: 52,
  ry: 52,
  seed: 1.0,
};

/**
 * Throb: a small round core wearing six balls on stalks, turning clockwise
 * with half of it plated (`throbTurnMilli` in sim, `living-draw.ts` in render).
 *
 * **The clubs are the turn.** It was six soft lobes on a ball, and a ball is
 * the one shape whose rotation cannot be seen: the whole creature is *which
 * half is pointing at the cannon*, and a body that turns invisibly is a rule
 * with no picture. Six knobs on stalks read their own bearing at forty pixels
 * — and they read a count as well, so the pair can say *three green ones left*
 * rather than reaching for a clock angle neither of them can see.
 *
 * The core is nearly smooth on purpose — lobes under the clubs would be a
 * second rim arguing with the first — and `sizeMul` is here for the reason it
 * is on the Runt and for the opposite result. `drawLiving` scales
 * `max(rx, ry)` onto the fixed body radius every living kind draws at, and a
 * club reaches most of another radius past that, so a throb left at 1 would
 * arrive on the field a third wider than a bulb. 0.67 is the widest club this
 * rim can throw — `reach` and `cap` both at the top of their `vary`, on the
 * crest of a breath — brought back inside the bulb's own footprint, which
 * `packages/content/test/body-path.test.ts` is what holds it to.
 *
 * Walked out of `tools/shape-sheet/src/forms/clubbed.ts`, which drew THE
 * POMMEL with it — `docs/asset-catalogue.md` on what claiming a shape means.
 */
export const THROB: CreatureSilhouette = {
  lobes: 3,
  depth: 0.06,
  wobble: 0.05,
  rx: 44,
  ry: 44,
  seed: 7.0,
  sizeMul: 0.67,
  clubs: { clubs: 6, reach: 0.26, cap: 0.36, neck: 0.46, vary: 0.16 },
};

/**
 * Shell: **retired as a contour, kept as a shape.**
 *
 * THE SHELL used to be a body of its own — the widest living thing there was,
 * five broad hard-edged lobes, almost no wobble. It is not one any more. A
 * shelled arrival is a slick or a bulb wearing plating over the top
 * (`shellBecomes` in sim, `shell-draw.ts` in render), so the two of them are
 * Shell-Slick and Shell-Bulb and neither has a silhouette that is not already
 * in this file. What the armour adds is a margin outside the body's own
 * contour and the splits in it, which is a picture rather than a shape.
 *
 * The parameters stay because they are the only hard-edged *living* contour
 * anyone has tuned — the starting point for a future creature that really is
 * plated flesh, the way `TORCH` outlived the torch it was drawn for.
 * `livingSilhouette` no longer names it, and nothing in the game reads it.
 */
export const SHELL: CreatureSilhouette = {
  lobes: 5,
  depth: 0.3,
  wobble: 0.012,
  rx: 84,
  ry: 50,
  seed: 4.0,
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

// Which kind is drawn with which of the shapes above is *not* here: it is one
// row per kind in `living-look.ts`, beside that kind's own-motion, because
// "is this a body and which one" is a single fact and this file is a sheet of
// tuned numbers. `livingSilhouette` is exported from there and from the
// package index. This file may not import it back — `living-look.ts` reads
// SLICK and BULB from here, and the arrow only points one way.

/**
 * Pod: a capsule with a core, upright and softly ribbed. Three shallow lobes,
 * so it reads as a made object that has been *grown* — the ship eats it, and a
 * ship does not eat machinery. It must not be mistaken for either creature at a
 * glance, which is why it stands taller than it is wide and carries neither of
 * the two ammunition colours.
 */
export const POD: CreatureSilhouette = {
  lobes: 3,
  depth: 0.16,
  wobble: 0.03,
  rx: 36,
  ry: 48,
  seed: 3.0,
};

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
