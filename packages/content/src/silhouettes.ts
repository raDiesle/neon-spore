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

/** Manta: two broad wing-lobes, glides and tilts. */
export const MANTA: CreatureSilhouette = {
  lobes: 2,
  depth: 0.38,
  wobble: 0.02,
  rx: 68,
  ry: 34,
  seed: 2.0,
};

/** Jelly: many fine lobes around the edge, pulses with the bell. */
export const JELLY: CreatureSilhouette = {
  lobes: 9,
  depth: 0.1,
  wobble: 0.055,
  rx: 52,
  ry: 52,
  seed: 1.0,
};

/**
 * Meteor: solid and slow. The raster model does not animate it, and spec 9
 * says it is a dead rock — nothing living. In free flight it could use the
 * crystal model for a starker look; here it is geometrically simple.
 */
export const METEOR = {
  /** Not a blobPath; meteors are drawn geometrically. This is for reference. */
  type: "geometric" as const,
  seed: 5.0,
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
