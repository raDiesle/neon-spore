import { PALETTE } from "./palette.js";

/**
 * THE THROB's armoured half: the plating that takes up one side of the body
 * and refuses everything that arrives at it.
 *
 * Drawn as a layer over an ordinary living body rather than as a body of its
 * own, the arrangement `shell-draw.ts` and `clasp.ts` already use — the
 * contour, the interior and the colour underneath are a slick's or a bulb's,
 * and this covers half of them. The body has already been turned by
 * `throbTurnMilli` when this is called, so the plating is simply *the half
 * above the seam* in the body's own space and the turn carries it round for
 * free. A second copy of the angle here is how a picture comes to promise a
 * shot the rule refuses.
 *
 * **It is green, and it is `claspShield`'s green on purpose.** That colour
 * already means one thing in this game and it is exactly this one: a body up
 * the field that a shot does nothing to. Spending the ammunition colours on it
 * would be worse than useless — the pair reads red and cyan as *which
 * trigger*, and half a body in the wrong one of those is a sentence that
 * contradicts the other half of the same body.
 */

/** Rings across the plating, as a share of the body's own radius. Three, so it
 * reads as layered armour at a size where a texture would read as noise. */
const RIBS = [0.42, 0.68, 0.94] as const;

/**
 * Lay the plating over the half of `body` above the seam. The context is the
 * body's own — turned, scaled and centred — so `lw` arrives already divided by
 * that scale, the way every other line inside a contour is.
 */
export function drawThrobPlating(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  rx: number,
  ry: number,
  plate: string,
  rim: string,
  lw: number,
): void {
  const half = new Path2D();
  half.rect(-rx * 2, -ry * 2, rx * 4, ry * 2);
  ctx.save();
  ctx.clip(half);
  ctx.fillStyle = plate;
  ctx.fill(body);
  ctx.strokeStyle = rim;
  ctx.lineWidth = lw;
  for (const k of RIBS) {
    const ring = new Path2D();
    ring.ellipse(0, 0, rx * k, ry * k, 0, Math.PI, Math.PI * 2);
    ctx.stroke(ring);
  }
  // The contour on this half, over the body's own coloured outline: the
  // silhouette is unchanged and which half of it is armour is not.
  ctx.stroke(body);
  ctx.restore();

  // And the cut itself, clipped to the body so it stops at the contour rather
  // than running out into the field.
  // Wide enough to cross a club sitting on the seam, not merely the core: the
  // clip is what ends the line, so a short one would stop in mid-air on the
  // two turns of every six where a club straddles the cut.
  const seam = new Path2D();
  seam.moveTo(-rx * 2, 0);
  seam.lineTo(rx * 2, 0);
  ctx.save();
  ctx.clip(body);
  ctx.strokeStyle = rim;
  ctx.lineWidth = lw * 1.4;
  ctx.stroke(seam);
  ctx.restore();
}

/**
 * The plating's two colours, before distance is spent on them.
 *
 * The line is `claspShield` itself rather than its pale rim: the rim is a
 * near-white mint, and at forty pixels it out-shouted the coloured half — the
 * one the pair is actually reading. Armour that draws the eye harder than the
 * thing you can shoot is armour that has been given the wrong job.
 */
export const THROB_PLATE = {
  fill: PALETTE.claspShieldDeep,
  rim: PALETTE.claspShield,
} as const;
