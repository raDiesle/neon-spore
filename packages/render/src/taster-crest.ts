import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The ridge THE TASTER's blades stand out of**, and the two things the pair
 * can do to it: open a gap where a blade used to be, and cut the gaps through.
 *
 * Its own file beside `taster-blade.ts` for that file's reason — the fan's
 * shapes are one subject and the crest is another — and because the crest is
 * the half of this boss with no colour anywhere on it. It takes a bolt of
 * either (`sim/taster-shot.ts`), which is exactly why it is drawn in the
 * hull's own grey and violet and never in an ammunition colour: the one target
 * in this fight the navigator has no word for.
 */

/**
 * The ridge, left to right, as a closed shape: a shallow arc with a slow
 * ripple along its underside.
 *
 * The ripple is wall-clock own-motion, the membrane's argument said about
 * something solid — a crest drawn as a rectangle would be a lid, and this is
 * a living edge the blades grow out of. Its top is flat, because every blade's
 * base sits on it and a base hanging off a curve would read as a blade coming
 * loose.
 */
export function crestPath(
  left: number,
  right: number,
  y: number,
  thick: number,
  tile: number,
  time: number,
): Path2D {
  const p = new Path2D();
  p.moveTo(left, y);
  p.lineTo(right, y);
  const steps = 12;
  for (let i = steps; i >= 0; i--) {
    const x = left + ((right - left) * i) / steps;
    const wave = Math.sin(time * 0.8 + i * 0.7) * tile * 0.04;
    p.lineTo(x, y + thick + wave);
  }
  p.closePath();
  return p;
}

/**
 * A gap: the crest under a blade that has been struck off, soft and visibly
 * wet — the design's own words, and player 1's target.
 *
 * `wet` is the fight's progress toward cutting the crest through rather than
 * this gap's own depth: the count is one number for all of them
 * (`TasterState.crest`), and a picture that showed a per-gap depth would be
 * inventing a number the simulation does not keep.
 */
export function drawNotch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  thick: number,
  wet: number,
  breath: number,
): void {
  const w = tile * 0.34;
  const deep = thick * (0.7 + 0.5 * wet);
  const dent = new Path2D();
  dent.moveTo(x - w, y);
  dent.quadraticCurveTo(x, y + deep, x + w, y);
  ctx.save();
  ctx.globalAlpha = 0.25 + 0.3 * wet;
  ctx.fillStyle = PALETTE.background;
  ctx.fill(dent);
  ctx.restore();
  // The sheen: what makes it read as wet rather than as a hole, and it is the
  // hull's violet because the gap is the one part of this boss that answers
  // to either colour.
  strokeGlow(ctx, dent, PALETTE.hull, STROKE.inner, 0.3 + 0.4 * wet + 0.1 * breath);
}

/**
 * The crest cut through: a lit seam the whole width of it, and from here the
 * fan can never re-edge itself again (`tasterLift`).
 *
 * It is drawn along the ridge rather than thrown as a transient because it is
 * a **standing** fact for the rest of the fight — the four shots into the gaps
 * bought it, and the pair has to be able to see at any later moment that the
 * shiver is not coming back.
 */
export function drawSeam(
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  y: number,
  tile: number,
  time: number,
): void {
  const seam = new Path2D();
  seam.moveTo(left, y + tile * 0.16);
  seam.lineTo(right, y + tile * 0.16);
  const pulse = 0.45 + 0.15 * Math.sin(time * 2);
  strokeGlow(ctx, seam, PALETTE.hullRim, STROKE.inner, pulse);
}
