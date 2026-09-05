/**
 * **The eye's box, and the rim hung on it.** The third piece of one eye —
 * `eye.ts` holds the wet parts, `eye-lens.ts` the aperture and the pupil, and
 * this one holds the *shape* both of those are cut from.
 *
 * It exists because the film used to be an **ellipse**. The lens has had
 * corners since it was built and the socket THE LID wears has had them since
 * that body was drawn, but the pool of fluid standing outside them was a ring
 * sampled round a centre — so THE WARDEN, whose hole is a circle, was a green
 * disc with an eye painted on it. The owner said the boss was still round, and
 * he was looking at the disc rather than at the lens. One shape, sampled by
 * three callers, is the only way that stays fixed.
 */

/** The lens's half-width, as a share of the socket's own. */
export const LENS_W = 0.95;

/**
 * How far the upper lid stands above the corners when the eye is wide — the
 * socket's own half-height, **capped against the width**, and the cap is the
 * whole of what makes this an eye rather than a bulb.
 *
 * THE LID's socket is already an almond and the first number binds there. THE
 * WARDEN's is a circle, and a lens taking nine tenths of a circle in both
 * directions is a disc with two corners stuck on it — which is what the owner
 * was looking at when he said it was too round. Capped at seven tenths of the
 * half-width, the same call inside a round hole comes out about half as tall as
 * it is wide, which is roughly what an eye is. Neither body carries a figure of
 * its own: one eye, one shape, and the socket decides which way the cap falls.
 */
const RISE_MUL = 0.9;
export const RISE_CAP = 0.7;

/**
 * The lower lid's dip below the corners, as a share of the upper lid's rise.
 * Under a half, because that is the proportion on a real eye and it is what
 * says which way up the thing is before a single line is drawn inside it —
 * `lid-shape.ts` spends its own `droop` on exactly the same argument.
 */
const DIP_SHARE = 0.46;

/**
 * The rim's floor, as a share of its own rise — a little deeper than the lens
 * keeps, because this contour has to stand *outside* THE LID's socket and that
 * socket's own droop is 0.62 of a taller number. At the lens's share the film's
 * floor came up inside the body it is meant to pool around.
 */
const RIM_DIP = 0.5;

/** An eye's half-extents: half its width, how far it rises above the corner
 * line and how far it dips below. Every part of an eye is drawn from one of
 * these. */
export interface EyeBox {
  w: number;
  rise: number;
  dip: number;
}

/** The **lens's** box: the aperture at full opening, inside a socket of the
 * given half-extents. */
export function eyeBox(rx: number, ry: number): EyeBox {
  const w = rx * LENS_W;
  const rise = Math.min(ry * RISE_MUL, w * RISE_CAP);
  return { w, rise, dip: rise * DIP_SHARE };
}

/**
 * The **rim's** box: the almond the film and the fringe stand on, `mul` times
 * the socket.
 *
 * Built from the socket rather than from the lens, and the difference matters
 * on THE LID: the lens is what an opening shows and the socket is the body, so
 * a film measured off the lens would shrink under the contour it is meant to
 * pool around. It takes the same cap, which is what keeps a round hole's film
 * an eye and not a ring.
 */
export function rimBox(rx: number, ry: number, mul: number): EyeBox {
  const rise = Math.min(ry, rx * RISE_CAP) * mul;
  return { w: rx * mul, rise, dip: rise * RIM_DIP };
}

/** A point on a rim, and the outward normal there. */
export interface RimPoint {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

/**
 * One point on the closed rim, `s` walking from the left corner over the top to
 * the right corner at a half and back along the bottom.
 *
 * **A sine over a straight run, which is what makes the corners** — the same
 * geometry `lid-shape.ts` argues at length, for the same reason: half an
 * ellipse arrives at each end with a vertical tangent and reads as a slick,
 * and `sin(πu)` over an evenly walked `x` arrives at a finite slope, so the two
 * arcs meet at an angle. The normal falls out of the tangent, so a hair rooted
 * here always leaves the body however the box is proportioned.
 */
export function rimPoint(box: EyeBox, s: number): RimPoint {
  const upper = s < 0.5;
  const u = upper ? s * 2 : (s - 0.5) * 2;
  const h = upper ? -box.rise : box.dip;
  const x = upper ? -box.w + 2 * box.w * u : box.w - 2 * box.w * u;
  const tx = upper ? 2 * box.w : -2 * box.w;
  const ty = h * Math.PI * Math.cos(Math.PI * u);
  const len = Math.hypot(tx, ty) || 1;
  return { x, y: h * Math.sin(Math.PI * u), nx: ty / len, ny: -tx / len };
}
