import { drawEyeFluid, drawEyeFringe, drawEyeLens, type EyeInk } from "./eye.js";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE WARDEN's door, and the eye behind it.
 *
 * Its own file rather than another section of `warden.ts`, because that file is
 * the *body* — two lobed contours cut against each other, the plates, where the
 * hole sits — and this is the one part of the picture that answers a hand. The
 * ring is drawn from the plates and the drift; everything here is drawn from
 * one number, the rope's tension, and that difference is worth a file boundary.
 *
 * **The number arrives already correct and is not eased.** How far these stand
 * open is the only thing the seat that is *not* holding the rope has to go on,
 * so a picture that lagged the rule would lie at exactly the moment somebody is
 * deciding to fire (`sim/warden.ts`).
 */

/**
 * How much of the hole the hatch takes up when it is shut, as a fraction of the
 * hole's own radius. The rest of the hole stays a hole: the one thing this body
 * says about itself is that you can see the field through its middle, and a
 * trapdoor that covered all of that would have taken the boss's silhouette away
 * to gain a door.
 */
export const HATCH = 0.66;

/**
 * How far the seam sways off the straight chord, in fractions of the hole's
 * radius, and how far down it the sway peaks.
 *
 * **The two halves are not half discs.** They were, and a pair of Ds sliding
 * apart is a shutter on a lens rather than a thing opening its eye — which is
 * what the owner was looking at when he called the opening shape boring. The
 * seam here is one S, and *both* lids carry it: the left one ends where the
 * right one begins, so they are still flush when shut and neither is a mirror
 * of the other. What comes apart is two soft margins that bulge past each
 * other, and the pinch at the top and the bottom is where the corners of an
 * eye are.
 */
const SEAM = 0.3;
const SEAM_AT = 0.45;

/**
 * How far inboard of the seam each lid's own fold runs, and how far up and down
 * it goes, both in fractions of the radius. One line per lid, faint, tracking
 * the margin it belongs to — the crease over an eyelid, and the only thing that
 * says the two halves are folds of something rather than two cut plates.
 */
const FOLD = 0.38;
const FOLD_REACH = 0.7;

/**
 * The seam, from the top of the hole to the bottom, as the tail of a path that
 * has already been moved to the top. A cubic rather than a chord: see `SEAM`.
 */
function seam(x: number, cy: number, r: number): string {
  return (
    `C ${x + r * SEAM} ${cy - r * SEAM_AT}` +
    ` ${x - r * SEAM} ${cy + r * SEAM_AT}` +
    ` ${x} ${cy + r}`
  );
}

/**
 * The trapdoor across the middle of the hole: two lids that meet along one
 * curve when the rope is slack and part along it as it comes taut.
 *
 * **It is not a lamp.** How far apart they stand is the tension and nothing
 * else, drawn with no easing between the rule and the picture, because the seat
 * that is not holding the rope cannot feel the pull and this is the only way
 * they have of reading it. Halfway apart means halfway pulled, and it means
 * there is no shot yet.
 */
export function drawHatch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  openness: number,
): void {
  const slide = r * 1.15 * openness;
  ctx.save();
  ctx.fillStyle = PALETTE.rock;
  // Both folds in one path, stroked once after both lids are down, so neither
  // lid's fill can bury the other's crease — the fringe's argument in `eye.ts`,
  // and the reason this body is a flat count of canvas calls whatever it does.
  const folds = new Path2D();
  for (const side of [-1, 1] as const) {
    const x = cx + side * slide;
    // The seam down the middle, then the hole's own edge back up this lid's
    // side of it. Sweep 0 climbs to the right of a chord and 1 to the left, so
    // each lid keeps the half of the rim it started on however far it has gone.
    const sweep = side === 1 ? 0 : 1;
    const lid = new Path2D(
      `M ${x} ${cy - r} ${seam(x, cy, r)} A ${r} ${r} 0 0 ${sweep} ${x} ${cy - r} Z`,
    );
    ctx.fill(lid);
    strokeGlow(ctx, lid, PALETTE.rockDark, STROKE.inner, 0.6);
    const fx = x + side * r * FOLD;
    folds.moveTo(fx, cy - r * FOLD_REACH);
    folds.bezierCurveTo(
      fx + r * SEAM * 0.7,
      cy - r * SEAM_AT * 0.7,
      fx - r * SEAM * 0.7,
      cy + r * SEAM_AT * 0.7,
      fx,
      cy + r * FOLD_REACH,
    );
  }
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(folds);
  ctx.restore();
}

/**
 * The whole eye behind the door: the film around it, the lens and the fringe,
 * in that order.
 *
 * A wrapper rather than three calls at the site, because the *order* is the
 * picture — the fluid stands outside the socket and has to be under the lens,
 * and the fringe stands outside both and has to be over them — and a second
 * caller that got it wrong would be a second eye that looks like a different
 * animal. THE LID makes exactly this call (`render/lid.ts`).
 *
 * `t` is the beat clock: the pupil breathes on it, so both phones breathe
 * together.
 */
export function drawEye(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  hex: string,
  rim: string,
  openness: number,
  t: number,
  time: number,
): void {
  const ink: EyeInk = { hex, rim };
  drawEyeFluid(ctx, cx, cy, r, r, openness, time);
  drawEyeLens(ctx, cx, cy, r, r, ink, openness, t);
  drawEyeFringe(ctx, cx, cy, r, r, ink, openness, time);
}
