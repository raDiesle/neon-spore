/**
 * The ship's own shapes: the hull it is drawn as, the two lobes that stand on
 * it, and the maw one of them turns into.
 *
 * Split out of `silhouettes.ts` when that file hit its size cap, and the seam
 * is the same one `hull-shape.ts` already found next door: everything there
 * falls out of the sky and is answered, everything here is the thing doing the
 * answering. A creature's contour and the ship's are measured by the same
 * radius function and are otherwise nothing to do with each other.
 *
 * `silhouettes.ts` re-exports all of it, so nothing that already reaches for
 * `CANNON_LOBE` through that file has to move.
 */

export interface HullSilhouette {
  lobes: number;
  depth: number;
  wobble: number;
  cannonRadius: number;
  seed: number;
}

/**
 * The hull: an ellipse far wider than the screen with a **rippled** radius
 * function on it, and a cannon bump. The cannon is not a separate object but a
 * localized deformation of the hull contour at a controllable angle. The shield
 * is the same, narrower and only visible when armed.
 *
 * **Fourteen shallow lobes and not two deep ones.** Only the arc around the
 * ellipse's apex is ever in view, so two lobes at a depth of 0.4 put *most of
 * one swell* on the screen: the ship read as a single smooth curve that
 * happened to be higher on one side, and its surface said nothing about itself
 * between the cannon bump and the shield bump. Everything a player read off the
 * top of that ship was something standing on it. The owner took RIDGE out of
 * VERSUS on 9 September 2026: the count is round the whole ellipse rather than
 * across the screen, which is why it takes fourteen to put about three crests
 * in front of the player, one every three or four columns — the scale the eye
 * reads the field at, and the same closed-contour-with-lobes vocabulary every
 * body in this game is drawn in (CLAUDE.md), applied at last to the one object
 * that had been exempt from it.
 *
 * `CANNON_LOBE` and `SHIELD_LOBE` below did not move with it. The cannon still
 * swells where the cannon is and the shield still lifts where the shield is, at
 * the same width and the same height, so nothing a player aims with moved —
 * what changed is the membrane they stand on.
 */
export const HULL: HullSilhouette = {
  lobes: 14,
  depth: 0.12,
  wobble: 0.05,
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
