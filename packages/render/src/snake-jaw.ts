import { PALETTE } from "./palette.js";
import type { Arena } from "./snake-draw.js";
import { castShadow, clearShadow } from "./snake-skin.js";

/**
 * What one of SNAKE's jaws is: its outline, what is marked on it, and the one
 * shadow the pair of them cast between them.
 *
 * Split off `snake-head.ts` on 20 September 2026, when the head stopped being
 * a wedge. The seam is the round's own: next door is the head as a *thing* —
 * shut or open, how wide, where its eyes are, what is in its mouth — and here
 * is the half of it that is a shape.
 *
 * **A wedge from above is a triangle**, which is what this was: two ruled
 * sides running from a flat neck to a point, with the eyes dropped on. What a
 * viper's head actually does is swell *behind* the eye — the venom gland is
 * the widest part of the animal — and fall away from there into a snout that
 * is blunt. So the outline carries that bulge and that fall.
 */

/** The jaw's own dark, and the colour the head's shadow pass is painted in. */
const JAW_DARK = "#170A2E";

/**
 * The three curves every jaw is: out of the neck into the gland behind the
 * eye, off the gland into the cheek, and round the snout to the middle.
 *
 * Written into a path the caller hands in, because a jaw is filled with its
 * neck cut and stroked without it — two contours that have to be the same
 * curve or the rim will walk off the skin.
 *
 * The widths are not free. The neck is `r * 0.86`, which is the body's own
 * `HEAD_HALF` to within a pixel: a head narrower than its own neck leaves the
 * blunt end the body is capped with drawn in the open, which was the defect
 * this shape was last fixed for. The gland goes wider than that and nothing
 * else does.
 */
function jawCurve(p: Path2D, r: number, side: number): void {
  p.bezierCurveTo(r * 0.2, side * r * 1.05, r * 0.54, side * r * 1.03, r * 0.86, side * r * 0.78);
  p.bezierCurveTo(r * 1.02, side * r * 0.6, r * 1.14, side * r * 0.5, r * 1.22, side * r * 0.38);
  // **The snout is blunt.** The last curve leaves the cheek still a third of
  // the head wide and arrives across the middle rather than along it, so the
  // two jaws meet in a nose instead of in a point — a snake bites with a face,
  // and a wedge that comes to a spike is an arrowhead.
  p.bezierCurveTo(r * 1.36, side * r * 0.3, r * 1.47, side * r * 0.19, r * 1.47, 0);
}

/**
 * Both jaws in turn, each under the transform it is drawn in, with its two
 * contours built: `filled` carries the straight cut across the neck and `edge`
 * does not.
 *
 * That cut is a join and not an edge. Stroked, it drew a bar across the back
 * of the head and the head sat on the body like a hat.
 */
function eachJaw(
  ctx: CanvasRenderingContext2D,
  r: number,
  swing: number,
  run: (side: number, filled: Path2D, edge: Path2D) => void,
): void {
  for (const side of [1, -1]) {
    ctx.save();
    ctx.translate(-r * 0.45, 0);
    ctx.rotate(swing * side);
    const filled = new Path2D();
    filled.moveTo(0, 0);
    // **The back of a head is not a wall.** A straight cut across the neck
    // left the head standing on the body like a stump sawn off — worst when
    // the body runs sideways and the whole flat edge is in view. This flares
    // back over the neck instead and comes forward again to the hinge, which
    // is where the other jaw's does too: they meet at a point on the axis
    // they turn about, so opening the mouth cannot part them there.
    filled.quadraticCurveTo(-r * 0.3, side * r * 0.5, 0, side * r * 0.86);
    jawCurve(filled, r, side);
    filled.closePath();
    const edge = new Path2D();
    edge.moveTo(0, side * r * 0.86);
    jawCurve(edge, r, side);
    run(side, filled, edge);
    ctx.restore();
  }
}

/**
 * The two jaws, lit and rimmed, over one shadow.
 *
 * **One shadow for the head and not one a jaw.** A canvas shadow is painted
 * behind the shape that casts it and over everything already on the canvas, so
 * a second jaw filled with its own shadow on laid a dark band down the middle
 * of the first — the head read as two pieces with a crack between them, which
 * is exactly what a shut mouth is not. The silhouette is laid down once in the
 * jaw's own dark, and the jaws are painted over it with the shadow off.
 */
export function drawJaws(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  r: number,
  swing: number,
  skin: CanvasGradient,
): void {
  castShadow(ctx, arena);
  ctx.fillStyle = JAW_DARK;
  eachJaw(ctx, r, swing, (_side, filled) => ctx.fill(filled));
  clearShadow(ctx);

  eachJaw(ctx, r, swing, (side, filled, edge) => {
    ctx.fillStyle = skin;
    ctx.fill(filled);
    ctx.strokeStyle = PALETTE.hull;
    ctx.lineWidth = 1.8;
    ctx.stroke(edge);
    ctx.clip(filled);
    marks(ctx, r, side);
  });
}

/**
 * What is on a jaw, inside a clip of it: the light along the crown, the ridge
 * over the eye and the nostril near the snout.
 *
 * Three marks and no more. The head is about thirty pixels long on a phone,
 * and the fourth thing drawn on it is the one that turns the other three into
 * grey — the same argument `snake-skin.ts` makes about the reference's scales.
 */
function marks(ctx: CanvasRenderingContext2D, r: number, side: number): void {
  ctx.fillStyle = "rgba(244,231,255,.12)";
  ctx.beginPath();
  ctx.ellipse(r * 0.95, side * r * 0.42, r * 0.46, r * 0.13, side * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(244,231,255,.2)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(r * 0.56, side * r * 0.84);
  ctx.quadraticCurveTo(r * 0.98, side * r * 0.74, r * 1.2, side * r * 0.4);
  ctx.stroke();
  ctx.fillStyle = "rgba(10,6,22,.55)";
  ctx.beginPath();
  ctx.ellipse(r * 1.3, side * r * 0.2, r * 0.075, r * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
}
