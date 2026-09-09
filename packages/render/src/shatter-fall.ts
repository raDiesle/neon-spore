import type { Shard } from "./shatter.js";

/**
 * Where a piece is, some time after the body came apart.
 *
 * A **closed form** and not an integration, which is the one decision in this
 * file. Stepping a piece frame by frame makes where it is a fact about how many
 * frames the phone managed, so two devices with different frame rates put the
 * same debris in different places; and it makes the bench impossible, because
 * `tools/breaks` draws one break at seven moments at once and has no frames to
 * step. A function of `t` answers both: the same seed and the same second give
 * the same picture on a phone, on the other phone, and on a sheet.
 *
 * The arc is ballistic and there is deliberately no air in it. Drag on a piece
 * this small over half a second is a curve nobody can see, and it costs the
 * closed form its exactness — the moment a piece lands stops being solvable and
 * becomes something a caller iterates for.
 *
 * **Landing is the owner's answer**, given on 9 September 2026 when he was
 * asked whether a break may leave anything behind: debris keeps falling, lands
 * on the band and fades there. So a piece has a floor, and what it does on
 * reaching it is the second half of this file.
 */

/** How a piece falls, and what it does when it arrives. */
export interface Fall {
  /** Downward pull, body-local units per second squared. */
  readonly gravity: number;
  /** How long a piece is on screen at all, seconds. */
  readonly life: number;
  /** The share of `life` spent fading out at the end, 0..1. */
  readonly fade: number;
  /**
   * Where the ground is, body-local — the band under the column, handed down
   * from wherever the caller knows the layout. Left out when there is nothing
   * to land on, and then a piece simply falls out of the picture.
   */
  readonly floor?: number;
  /** How much of its speed a piece keeps along the ground when it lands. */
  readonly skid: number;
}

/** Where a piece is, and how solid it still is, at one moment. */
export interface ShardPose {
  readonly x: number;
  readonly y: number;
  /** Radians. */
  readonly angle: number;
  /** 0..1. At 0 there is nothing left to draw. */
  readonly alpha: number;
  /** Whether it has arrived. A paint puts a settled piece flat on the band. */
  readonly landed: boolean;
}

/**
 * How long a landed piece takes to stop sliding and stop turning.
 *
 * One number for both, because they are one event: a piece that stopped
 * spinning while still sliding reads as a thing being dragged, and a piece
 * still spinning after it has stopped moving reads as a thing on ice. A fifth
 * of a second is under a third of a beat, so the settle is over before the pair
 * has looked back up the column.
 */
const SETTLE = 0.2;

/** When the floor is met, if it ever is: the positive root of the fall.
 * Returned as `Infinity` rather than as a null, so every comparison below is
 * an ordinary one and no branch has to ask whether there is a floor. */
function landsAt(s: Shard, f: Fall): number {
  if (f.floor === undefined) return Number.POSITIVE_INFINITY;
  const drop = f.floor - s.y;
  if (drop <= 0) return 0;
  if (f.gravity <= 0) return s.vy > 0 ? drop / s.vy : Number.POSITIVE_INFINITY;
  const g = f.gravity;
  const root = Math.sqrt(s.vy * s.vy + 2 * g * drop);
  return (root - s.vy) / g;
}

/**
 * Where one piece is at `t` seconds, and how much of it is left.
 *
 * Before the landing it is thrown and pulled. After it, it is on the floor
 * sliding to a halt over `SETTLE` — the exponential's own tail, so nothing
 * arrives with a corner in its motion.
 */
export function shardAt(s: Shard, t: number, f: Fall): ShardPose {
  const held = Math.max(0, Math.min(t, f.life));
  const land = landsAt(s, f);
  const air = Math.min(held, land);
  const x = s.x + s.vx * air;
  const y = s.y + s.vy * air + 0.5 * f.gravity * air * air;
  const angle = s.spin * air;

  const start = f.life * (1 - Math.max(0, Math.min(1, f.fade)));
  const alpha =
    held <= start ? 1 : Math.max(0, 1 - (held - start) / Math.max(1e-3, f.life - start));

  if (held <= land) return { x, y, angle, alpha, landed: false };

  // On the ground: the horizontal speed it kept, bled away over `SETTLE`, and
  // the turn going with it. `1 - e^-u` is the distance that decay covers, so
  // the piece is still moving on the frame it lands and has stopped by the end.
  const after = held - land;
  const decay = 1 - Math.exp(-after / SETTLE);
  return {
    x: x + s.vx * f.skid * SETTLE * decay,
    y: f.floor ?? y,
    angle: angle + s.spin * f.skid * SETTLE * decay,
    alpha,
    landed: true,
  };
}
