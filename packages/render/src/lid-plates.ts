import { strokeGlow } from "./glow.js";
import type { LidPlates } from "./lid-look.js";

/**
 * THE SHIPPED ARMOUR on THE LID: two plates, and the gap between them.
 *
 * Cut out of `lid.ts` when the plates got a record (`lid-look.ts`), so that a
 * second answer could sit beside this one. Nothing changed a pixel in the
 * move: the same rectangles, grooves and lit edges, in the same order.
 *
 * Rectangles clipped to the eye's own outline rather than shapes cut to it —
 * the caller holds that clip, because the lens under them is clipped to the
 * same path and opening it twice would be two clips for one shape. The plates
 * *slide*, so their inner edges have to be straight and their outer ones have
 * to be the socket's, and the clip gives both from one path; a plate cut to the
 * contour would have to be re-cut on every frame the body breathes on, and
 * would still be a second copy of where the socket is.
 *
 * The inner edges are lit in the lens's colour whatever the tension, so a shut
 * lid still tells the pair which trigger to load — that seam is the whole of
 * why the armour here buys timing rather than surprise (`lid.ts` in sim).
 */
export function drawPlates(d: LidPlates): void {
  const { ctx, open, gap, rx, ry, plate, edge, light, line } = d;
  const w = rx * 2.2;
  for (const side of [-1, 1] as const) {
    const inner = side * gap;
    ctx.fillStyle = plate;
    ctx.fillRect(side < 0 ? inner - w : inner, -ry * 1.2, w, ry * 2.4);
  }
  // Two grooves per plate, at fixed fractions of its own width, so they travel
  // with the plate and say it is a thing that moved rather than a shape that
  // shrank. One path for all four: the fringe's argument in `eye.ts`, and the
  // reason the whole body is a flat count of canvas calls whatever it is doing.
  const grooves = new Path2D();
  for (const side of [-1, 1] as const) {
    for (const f of [0.35, 0.7] as const) {
      const gx = side * gap + side * rx * f;
      grooves.moveTo(gx, -ry);
      grooves.lineTo(gx, ry);
    }
  }
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = edge;
  ctx.lineWidth = line * 0.7;
  ctx.stroke(grooves);
  ctx.restore();

  // The two inner edges, lit — one path again, and the light stops at the
  // socket because the caller's clip is still open.
  const edges = new Path2D();
  for (const side of [-1, 1] as const) {
    edges.moveTo(side * gap, -ry);
    edges.lineTo(side * gap, ry);
  }
  strokeGlow(ctx, edges, light, line * 0.9, 0.8 + open * 0.8);
}
