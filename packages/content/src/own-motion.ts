import type { CreatureKind } from "@neon-spore/sim";

/**
 * Own-motion: what a shape does while it is not going anywhere.
 *
 * The contour in `shapes.ts` breathes — that is the wobble, and it is a
 * property of the outline. This is the other half: the whole body swaying,
 * tilting, pumping, drifting. Two blobs with the same lobes read as different
 * creatures because one swings and the other shivers, and at 26 px that
 * difference is most of what a player has.
 *
 * It lives here, beside the silhouettes, for one reason: it used to be typed
 * out inside `render/creatures.ts`, where nothing outside the running game
 * could see it. A shape tool that wants to show a creature as it actually
 * moves would have had to re-type `sin(t * 1.9)`, and a second copy of a
 * motion is exactly how the sheet ends up judging a sway the game does not
 * have.
 *
 * Spec 5.8 is strict about what own-motion may touch: **nothing.** A creature
 * never leaves its column, so `dx` and `dy` are small and are measured in
 * tiles rather than pixels — a sway is a fraction of a lane at every screen
 * size, or it is a different sway on a tablet.
 */

/** Where a body sits this instant, relative to where the simulation put it. */
export interface Pose {
  /** Sideways offset, in tiles. Well under half a lane, always. */
  dx: number;
  /** Vertical offset, in tiles. */
  dy: number;
  /** Rotation, radians. */
  rot: number;
  /** Horizontal scale, 1 being the silhouette's own width. */
  sx: number;
  /** Vertical scale. */
  sy: number;
}

/** A named motion: a pose as a pure function of seconds. */
export interface OwnMotion {
  name: string;
  /** One line, the way a silhouette's note is one line. */
  note: string;
  poseAt(t: number): Pose;
}

/** A body doing nothing at all. The identity pose. */
export const REST: Pose = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 };

/**
 * The bulb: a wide slow sway with a faster pump inside it. The pump is
 * volume-preserving — as wide as it gets, it gets that much flatter — so it
 * reads as something breathing rather than as a shape being resized.
 */
export const SWAY_PUMP: OwnMotion = {
  name: "SWAY · PUMP",
  note: "slow sway, faster pump, volume held",
  poseAt(t) {
    const swing = Math.sin(t * 1.9);
    const pump = Math.sin(t * 3.1);
    return { dx: swing * 0.17, dy: 0, rot: swing * 0.18, sx: 1 + pump * 0.1, sy: 1 - pump * 0.1 };
  },
};

/**
 * The slick: a tilt whose rotation lags its own drift by half a radian, and a
 * ripple across the width. The lag is what makes it read as a flat thing being
 * dragged through something rather than a rigid body being rocked.
 */
export const TILT_RIPPLE: OwnMotion = {
  name: "TILT · RIPPLE",
  note: "drift, tilt lagging behind it, ripple across the width",
  poseAt(t) {
    return {
      dx: Math.sin(t * 1.35) * 0.11,
      dy: Math.sin(t * 2.2) * 0.05,
      rot: Math.sin(t * 1.35 + 0.5) * 0.22,
      sx: 1 + Math.sin(t * 2.2) * 0.09,
      sy: 1,
    };
  },
};

/**
 * The motion a living kind is drawn with. Call this rather than writing
 * `kind === "bulb" ? SWAY_PUMP : TILT_RIPPLE` by hand, for the same reason
 * `livingSilhouette` exists: the pairing of a kind to its picture is one fact,
 * and a second copy of it is how a creature ends up swaying like the other one.
 */
export function livingMotion(kind: CreatureKind): OwnMotion {
  return kind === "bulb" ? SWAY_PUMP : TILT_RIPPLE;
}
