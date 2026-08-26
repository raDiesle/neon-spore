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
}

export interface HullSilhouette {
  lobes: number;
  depth: number;
  wobble: number;
  cannonRadius: number;
  seed: number;
}

/** Slick: two broad lobes, wide and flat. Tilts and ripples as it travels. */
export const SLICK: CreatureSilhouette = {
  lobes: 2,
  depth: 0.38,
  wobble: 0.02,
  rx: 68,
  ry: 34,
  seed: 2.0,
};

/** Bulb: many fine lobes around a round body. Pumps and sways. */
export const BULB: CreatureSilhouette = {
  lobes: 9,
  depth: 0.1,
  wobble: 0.055,
  rx: 52,
  ry: 52,
  seed: 1.0,
};

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

/**
 * The hull: an ellipse with two lobes, one wobble per second, and a cannon
 * bump. The cannon is not a separate object but a localized deformation of the
 * hull contour at a controllable angle. The shield is the same, narrower and
 * only visible when armed.
 */
export const HULL: HullSilhouette = {
  lobes: 2,
  depth: 0.4,
  wobble: 0.065,
  cannonRadius: 10,
  seed: 0.4,
};

/**
 * A lobe of the hull: the cannon, or the shield while it is armed.
 *
 * Widths are in tiles, not pixels, so a lobe stays the same size relative to
 * the column it stands over whatever the screen does. The lift is vertical
 * (`bumpLift`), and it breathes — a swelling of a living membrane is never
 * quite still, and the breathing is what says the ship is alive rather than a
 * shape parked on a line.
 */
export interface LobeShape {
  /** Half width, in tiles. */
  halfTiles: number;
  /** Share of the half width held at full lift. */
  plateau: number;
  /** Share of the half width the lift falls back to the hull over. */
  shoulder: number;
  /** How far the lobe raises the surface, in tiles. */
  liftTiles: number;
  /** How much the lift breathes, as a share of itself. */
  breath: number;
  /** Breaths per second. */
  breathHz: number;
  /** Phase offset, so the two lobes never breathe in step. */
  breathPhase: number;
}

/**
 * The cannon: narrow, tall, and mostly shoulder — the wide falloff is what
 * rounds the corners where the lobe meets the rest of the membrane, so it
 * reads as the hull swelling rather than a bump glued on.
 */
export const CANNON_LOBE: LobeShape = {
  halfTiles: 0.62,
  plateau: 0.22,
  shoulder: 0.78,
  liftTiles: 0.5,
  breath: 0.16,
  breathHz: 0.55,
  breathPhase: 0,
};

/** The shield plate: wider, flatter, and slower — armour, not a muzzle. */
export const SHIELD_LOBE: LobeShape = {
  halfTiles: 0.85,
  plateau: 0.34,
  shoulder: 0.66,
  liftTiles: 0.34,
  breath: 0.1,
  breathHz: 0.37,
  breathPhase: 2.1,
};

/**
 * The maw: the cannon lobe turned inside out.
 *
 * There is no second shape for it and there must not be — the whole reading is
 * that the *same* swelling that fires is the one that opens. Player 1 presses
 * and the lobe passes through flat and keeps going, into a throat wider than
 * the muzzle was tall. A separate mouth drawn beside the cannon would say the
 * ship has a part for eating; this says the ship opens.
 */
export const MAW = {
  /** Lobe scale at full intake. Negative, which is the entire idea. */
  scale: -1.8,
  /** How much wider the throat is than the muzzle. */
  halfMul: 1.6,
} as const;

/**
 * Hull ellipse dimensions. These define the grid against which all angles are
 * measured. They are not exposed as tuning — the rest of the layout depends on them.
 */
export const HULL_GEOMETRY = {
  cx: 200,
  cy: 215,
  rx: 205,
  ry: 70,
  /** Angle at the top of the hull (straight up). */
  apex: -Math.PI / 2,
};

/**
 * Convert from canvas x-coordinate to the angle that represents that position
 * on the hull. Used by both render (to find where the cannon and shield are)
 * and by control (to let the user drag along the hull).
 */
export function xToHullAngle(x: number): number {
  return HULL_GEOMETRY.apex + (x - HULL_GEOMETRY.cx) / HULL_GEOMETRY.rx;
}
