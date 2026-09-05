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
 */
/** The wet on one ring: a belly shadow, a specular along the top, and a
 * catchlight that slides with the contraction. Clipped to the ring, so the
 * three never reach past a contour the pair is reading a colour off. */
export function drawSlime(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  dir: number,
  squeeze: number,
): void {
  ctx.save();
  ctx.clip(body);
  // The belly. A soft dark band under the ring, so it sits on the ship rather
  // than floating over it.
  const belly = new Path2D();
  belly.ellipse(x, y + ry * 0.95, rx * 1.1, ry * 0.75, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.background;
  ctx.globalAlpha = 0.34;
  ctx.fill(belly);
  // The specular along the top, and the catchlight inside it. Both are white
  // rather than the ring's own colour: what is being drawn is the light, and
  // a highlight in the body's colour reads as a brighter body.
  ctx.globalCompositeOperation = "lighter";
  const sheen = new Path2D();
  sheen.ellipse(x - dir * rx * 0.12, y - ry * 0.52, rx * 0.62, ry * 0.3, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.16;
  ctx.fill(sheen);
  const wet = new Path2D();
  const slide = dir * rx * (0.1 + squeeze * 0.12);
  wet.ellipse(x + slide, y - ry * 0.46, rx * 0.2, ry * 0.16, 0, 0, Math.PI * 2);
  ctx.globalAlpha = 0.4;
  ctx.fill(wet);
  ctx.restore();
}

/**
 * The face: one eye with a catchlight in it, and a mouth under the leading
 * edge.
 *
 * A maggot's head is a hard cap with almost nothing on it, and almost nothing
 * is what survives the forty pixels a body draws at — an eye that says *this
 * end is alive and pointed at the far wall*, and a slot that says it eats. It
 * sat as a bare hole for a version and read as damage rather than as a face.
 */
export function drawFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  dir: number,
  bite: number,
): void {
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
