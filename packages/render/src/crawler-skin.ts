import type { CrawlerLinkDraw } from "./crawler-look.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The wet on a maggot, and the little on its face**, which is the whole of
 * what makes THE CRAWLER read as alive rather than as a row of shapes.
 *
 * Cut out of `crawler.ts` when the rework that gave the worm overlapping rings
 * took that file over its 250-line limit, and along a seam it already had:
 * next door is *the run* — which ring is which material, where each one stands,
 * what order they are painted in — and none of it is a light. This is the
 * light, and it is the half the owner will keep asking for changes to, because
 * *slimy, alien and living* is a judgement made with an eye.
 *
 * Nothing here knows what a world or a creature is. It takes a contour, a
 * centre, two radii and where the ring stands in its own contraction, and it
 * draws on top of whatever colour the caller has already filled.
 *
 * The wet itself left on 10 September 2026: the owner took GUT
 * (`crawler-gut.ts`) over the placed pores this file carried, and
 * `tools/versus/DECIDED.md` has what they were. What stays is the face.
 */
/**
 * The face: one eye with a catchlight in it, and a mouth under the leading
 * edge.
 *
 * A maggot's head is a hard cap with almost nothing on it, and almost nothing
 * is what survives the forty pixels a body draws at — an eye that says *this
 * end is alive and pointed at the far wall*, and a slot that says it eats. It
 * sat as a bare hole for a version and read as damage rather than as a face.
 */
export function drawFace(d: CrawlerLinkDraw): void {
  const { ctx, rx, ry, dir, squeeze: bite } = d;
  const x = 0;
  const y = 0;
  const eye = new Path2D();
  eye.ellipse(x + dir * rx * 0.34, y - ry * 0.3, rx * 0.16, ry * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.background;
  ctx.fill(eye);
  const spark = new Path2D();
  spark.ellipse(x + dir * rx * 0.39, y - ry * 0.38, rx * 0.06, ry * 0.08, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.85;
  ctx.fill(spark);
  ctx.globalAlpha = 1;
  // The mouth, opening and shutting on the contraction: a short arc under the
  // leading tip rather than a hole through the cap.
  const mouth = new Path2D();
  const lip = x + dir * rx * 0.62;
  const gape = ry * (0.16 + (bite + 1) * 0.07);
  mouth.moveTo(lip - dir * rx * 0.12, y + ry * 0.24);
  mouth.quadraticCurveTo(lip + dir * rx * 0.16, y + ry * 0.24 + gape, lip, y + ry * 0.5);
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(mouth);
}
