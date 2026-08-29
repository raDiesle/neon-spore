import { circleSubpath } from "@neon-spore/content";
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
 * The trapdoor across the middle of the hole: two plates that meet when the
 * rope is slack and part as it comes taut.
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
  for (const side of [-1, 1]) {
    const x = cx + side * slide;
    // A half disc as a path string, the way every other contour here is built:
    // the frame test draws through a canvas that takes one and refuses the rest.
    const sweep = side === 1 ? 1 : 0;
    const half = new Path2D(`M ${x} ${cy - r} A ${r} ${r} 0 0 ${sweep} ${x} ${cy + r} Z`);
    ctx.fill(half);
    strokeGlow(ctx, half, PALETTE.rockDark, STROKE.inner, 0.6);
  }
  ctx.restore();
}

/**
 * The eye behind the door, and it has to read as an eye rather than as a
 * coloured circle appearing.
 *
 * Two lids, opening on the same number the hatch does: a lens whose gap grows
 * from a closed slit to a round eye, an iris in the rim's colour filling it, and
 * a pupil that goes from a line to a disc as the lids come apart. Both lids and
 * door are one quantity — there are not two things to keep in step, which is
 * what stops the picture drifting from the rule.
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
): void {
  const w = r * 0.92;
  const h = r * 0.9 * openness;
  const lens = new Path2D(
    `M ${cx - w} ${cy} Q ${cx} ${cy - h * 2} ${cx + w} ${cy} Q ${cx} ${cy + h * 2} ${cx - w} ${cy} Z`,
  );
  ctx.save();
  ctx.fillStyle = hex;
  ctx.globalAlpha = 0.35 + 0.5 * openness;
  ctx.fill(lens);
  ctx.restore();
  strokeGlow(ctx, lens, rim, STROKE.inner, 0.8 + openness * 0.6);

  // The pupil: a slit while the lids are nearly shut, a disc when they are
  // wide. It breathes, so a fully open eye is never a still picture.
  const pulse = 0.85 + 0.15 * Math.sin(t * Math.PI * 2);
  const pr = Math.min(h * 0.8, w * 0.34) * pulse;
  if (pr <= 0) return;
  const pupil = new Path2D(circleSubpath(cx, cy, pr));
  ctx.save();
  ctx.globalAlpha = openness;
  ctx.fillStyle = PALETTE.background;
  ctx.fill(pupil);
  strokeGlow(ctx, pupil, rim, STROKE.inner, 1.2 * openness);
  ctx.restore();
}
