import { drawDetails } from "./creature-detail.js";
import { strokeGlow } from "./glow.js";

/**
 * THE THROB's far half: the side of the body the cannon is *not* looking at,
 * painted in the other ammunition colour.
 *
 * Drawn as a layer over an ordinary living body rather than as a body of its
 * own, the arrangement `shell-draw.ts` and `clasp.ts` already use — the
 * contour, the interior and the colour underneath are a slick's or a bulb's,
 * and this covers half of them. The body has already been turned by
 * `throbTurnMilli` when this is called, so the far half is simply *the half
 * above the seam* in the body's own space and the turn carries it round for
 * free. A second copy of the angle here is how a picture comes to promise a
 * shot the rule refuses.
 *
 * **It used to be green plating and it is not any more.** Green means one
 * thing in this game — a body up the field that a shot does nothing to — and
 * that is exactly what this half has stopped being. It is a live half with a
 * live colour, so it is drawn the way every other live body is drawn: the
 * dark fill, the glowing rim, the same interior marks, all in the colour that
 * kills it. Half a body in one ammunition colour and half in the other is a
 * legible sentence precisely because those two colours already mean *which
 * trigger* to the pair, which is the whole of what this creature asks.
 */

/**
 * Lay the other colour over the half of `body` above the seam. The context is
 * the body's own — turned, scaled and centred — so `lw` arrives already
 * divided by that scale, the way every other line inside a contour is.
 */
export function drawThrobHalf(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  rx: number,
  ry: number,
  isBulb: boolean,
  tint: { rim: string; hex: string; dark: string },
  seamHue: string,
  lw: number,
): void {
  const half = new Path2D();
  half.rect(-rx * 2, -ry * 2, rx * 4, ry * 2);
  ctx.save();
  ctx.clip(half);
  ctx.fillStyle = tint.dark;
  ctx.fill(body);
  // The contour on this half, over the body's own coloured outline: the
  // silhouette is unchanged and which colour that half of it is is not.
  strokeGlow(ctx, body, tint.hex, lw, 1);
  // And the same interior marks the other half wears, mirrored across the
  // seam into this one — `drawDetails` is the one copy of what a body's core
  // looks like, so a throb reads as one creature in two colours rather than a
  // coloured body with a blank stuck to it.
  ctx.save();
  ctx.scale(1, -1);
  drawDetails(ctx, isBulb, rx, ry, tint.rim);
  ctx.restore();
  ctx.restore();

  // And the cut itself, clipped to the body so it stops at the contour rather
  // than running out into the field.
  // Wide enough to cross a club sitting on the seam, not merely the core: the
  // clip is what ends the line, so a short one would stop in mid-air on the
  // two turns of every six where a club straddles the cut. `seamHue` is the
  // two colours mixed, which is neither of them — a cut drawn in one of the
  // ammunition colours would read as that half reaching across the other.
  const seam = new Path2D();
  seam.moveTo(-rx * 2, 0);
  seam.lineTo(rx * 2, 0);
  ctx.save();
  ctx.clip(body);
  ctx.strokeStyle = seamHue;
  ctx.lineWidth = lw * 1.4;
  ctx.stroke(seam);
  ctx.restore();
}
