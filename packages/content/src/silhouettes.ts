import type { CreatureKind } from "@neon-spore/sim";

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

/** Throb: round, soft-lobed. render/ swells and shrinks it with `Creature.throbOpen`. */
export const THROB: CreatureSilhouette = {
  lobes: 6,
  depth: 0.2,
  wobble: 0.09,
  rx: 44,
  ry: 44,
  seed: 7.0,
};

/**
 * Shell: the widest living body there is, and the only one that does not look
 * soft. Two columns of field are spoken for, so the contour says so — and the
 * five lobes are broad and hard-edged rather than fine, which reads as plating
 * instead of flesh. `wobble` is almost nothing on purpose: armour does not
 * ripple, and the stillness is what makes the moment it comes apart legible.
 *
 * Five is not a spare number, it is the only one left. Slick has 2, Runt 4,
 * Throb 6 and Bulb 9, and a shape that lands on a neighbour's count is a shape
 * the pair says the same word for — `bun run shapes:report`'s TOLD APART BY
 * block is where that is read, and it separates this one from the Slick by
 * three lobes and from the Throb by aspect.
 *
 * A new shape rather than a recoloured one, which is the rule
 * (`creatures.ts`): a free silhouette is spent on a creature that behaves
 * differently, and this one is answered by the column first and by the colour
 * only afterwards.
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
 * The silhouette a living kind is drawn with. Call this instead of writing
 * `kind === "bulb" ? BULB : SLICK` by hand — the queen's morph blends two of
 * these, and a second copy of the pairing drifts. `throb` carries no colour
 * but gets a contour, named ahead of the colour-driven fallback.
 *
 * **`lure` is never passed in.** It has no contour of its own — it is drawn as
 * the body it wears — so a caller resolves that first with `wornKind` and asks
 * this about a slick or a bulb. There is deliberately no case for it: one here
 * would be a second, silent answer to the question `wornKind` exists to be the
 * only answer to, and what it would otherwise fall through to is the SLICK
 * fallback, which is a wrong shape rather than an obvious failure.
 */
export function livingSilhouette(kind: CreatureKind): CreatureSilhouette {
  if (kind === "throb") return THROB;
  if (kind === "shell") return SHELL;
  if (kind === "dart") return DART;
  return kind === "bulb" ? BULB : SLICK;
}

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

export interface CrystalSilhouette {
  sides: number;
  depth: number;
  wobble: number;
  seed: number;
}

/**
 * Meteor: angular facets, not a contour. It gets `crystalPath` rather than
 * `blobPath` precisely because it does not live — docs/spec/graphics.md hangs the whole
 * indestructibility rule on that fiction, so the rock must not read as an
 * organism. Almost no wobble, for the same reason.
 */
export const METEOR: CrystalSilhouette = {
  sides: 7,
  depth: 0.15,
  wobble: 0.01,
  seed: 5.0,
};

/**
 * The torch's original shape — more sides and deeper facets than `METEOR`,
 * the same non-living crystal material. The live torch now draws as a plain
 * `METEOR` instead (`packages/render/src/torch.ts`); this silhouette lives on
 * as the shape `packages/render/src/flare.ts` clones from, a starting point
 * for a future creature. Judge changes with `bun run shapes:report` before
 * eyeballing the sheet.
 */
export const TORCH: CrystalSilhouette = {
  sides: 9,
  depth: 0.22,
  wobble: 0.02,
  seed: 8.0,
};

/**
 * The Bulb Queen's shell: the same angular, non-living material as the rock
 * she spits, not a scaled-up `BULB`. Many facets for a big, cracked-plate
 * read, and just enough wobble that the shell visibly shifts and the "faster
 * as she weakens" tell still has something to speed up.
 */
export const QUEEN_SHELL: CrystalSilhouette = {
  sides: 16,
  depth: 0.22,
  wobble: 0.03,
  seed: 9.0,
};

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
