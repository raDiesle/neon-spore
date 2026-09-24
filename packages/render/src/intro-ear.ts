import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";

/**
 * **AN EAR, AND NOTHING BUT AN EAR.**
 *
 * The other half of the owner's instruction of 16 September 2026 — *maybe only
 * show the mouth and ear, but they must look like real identifiable as those*
 * — and the harder half. A mouth is recognised by its bow; an ear is
 * recognised by the **spiral**, and a shape with the outline of an ear and
 * nothing inside it is a bean. So there are four parts and all four are
 * needed: the helix running round the rim, the antihelix branching inside it
 * like a Y, the hollow of the concha, and a lobe hanging off the bottom.
 *
 * It is drawn facing `+x` and mirrored for the seat on the other side, so both
 * of them are plainly turned toward each other rather than both toward the
 * reader. The ear the game wants is the one that is listening to a person in
 * the room, which is the whole claim of the scene.
 *
 * `cup` is how hard it is listening: the rim brightens and two arcs of sound
 * arrive from the front. Both of those are the game's own idiom rather than a
 * cartoon's — a neon rim with `strokeGlow` behind it, and nothing holds still
 * (`intro-parts.ts`).
 */

/** One rim of the spiral, as a path in the ear's own units. */
function ridge(r: number, points: readonly number[][]): Path2D {
  const path = new Path2D();
  const [first, ...rest] = points;
  if (!first) return path;
  path.moveTo(first[0]! * r, first[1]! * r);
  for (const p of rest) {
    path.bezierCurveTo(p[0]! * r, p[1]! * r, p[2]! * r, p[3]! * r, p[4]! * r, p[5]! * r);
  }
  return path;
}

/**
 * The ear, centred on `cx,cy`, `r` tall from its middle to its tip, facing
 * `dir` (+1 to the right), listening by `cup` (0..1).
 */
export function introEar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  tint: string,
  dir: 1 | -1,
  cup: number,
): void {
  if (r <= 0) return;
  const listening = Math.max(0, Math.min(1, cup));
  halo(ctx, cx, cy, r * 1.9, tint, 0.3 + 0.32 * listening);

  ctx.save();
  ctx.translate(cx, cy);
  // Turned a little further toward whoever is speaking while it listens, which
  // is what a person does with their head and is the cheapest thing on this
  // screen that reads as attention.
  ctx.rotate(dir * listening * 0.16);
  ctx.scale(dir, 1);

  // The outline: round over the top, down the back, out at the lobe, and up
  // the front past the notch of the tragus.
  const shell = ridge(r, [
    [0.34, -0.8],
    [0.1, -1.06, -0.44, -0.94, -0.54, -0.46],
    [-0.64, -0.04, -0.56, 0.44, -0.3, 0.72],
    [-0.16, 0.94, 0.12, 1.0, 0.2, 0.76],
    [0.26, 0.58, 0.16, 0.44, 0.2, 0.22],
    [0.26, -0.1, 0.44, -0.48, 0.34, -0.8],
  ]);
  shell.closePath();
  ctx.fillStyle = mixHex(tint, "#0B0718", 0.66);
  ctx.fill(shell);
  strokeGlow(ctx, shell, tint, Math.max(1.1, r * 0.13), 1);

  // The hollow, before the ridges that stand out of it: a deeper pocket at the
  // front, and the canal at the bottom of it.
  ctx.beginPath();
  ctx.ellipse(-0.02 * r, 0.1 * r, 0.16 * r, 0.26 * r, -0.28, 0, Math.PI * 2);
  ctx.fillStyle = mixHex(tint, "#0B0718", 0.86);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0.0 * r, 0.2 * r, 0.05 * r, 0.08 * r, -0.28, 0, Math.PI * 2);
  ctx.fillStyle = "#0B0718";
  ctx.fill();

  // **The helix**: the rim folded over, running from the front of the top all
  // the way round to the lobe. This is the line the shape is read by.
  const rim = mixHex(tint, "#FFFFFF", 0.3);
  strokeGlow(
    ctx,
    ridge(r, [
      [0.2, -0.62],
      [-0.02, -0.8, -0.32, -0.68, -0.36, -0.34],
      [-0.4, -0.02, -0.34, 0.26, -0.2, 0.44],
    ]),
    rim,
    Math.max(1, r * 0.09),
    0.9,
  );

  // **The antihelix**: the Y inside it, one arm down and one arm up into the
  // top of the shell. Two strokes, because it forks — a single curve here
  // reads as a second rim and the whole thing goes back to being a bean.
  strokeGlow(
    ctx,
    ridge(r, [
      [-0.04, -0.28],
      [-0.18, -0.06, -0.18, 0.2, -0.06, 0.42],
    ]),
    rim,
    Math.max(1, r * 0.075),
    0.75,
  );
  strokeGlow(
    ctx,
    ridge(r, [
      [-0.04, -0.28],
      [0.04, -0.44, 0.12, -0.5, 0.14, -0.6],
    ]),
    rim,
    Math.max(1, r * 0.075),
    0.75,
  );

  // The lobe's own light, so the bottom reads as hanging flesh rather than as
  // the end of a contour.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath();
  ctx.ellipse(-0.06 * r, 0.66 * r, 0.09 * r, 0.06 * r, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,.38)";
  ctx.fill();
  ctx.restore();

  // What is arriving: two arcs off the front, only while somebody is talking
  // to it.
  if (listening > 0.02) {
    // As an argument: `strokeGlow` sets its own alpha, and the arcs came in
    // whole the frame anybody spoke rather than with the voice.
    for (let i = 1; i <= 2; i++) {
      const arc = new Path2D();
      const at = r * (0.5 + i * 0.28);
      arc.arc(0.1 * r, 0.08 * r, at, -0.7, 0.7);
      strokeGlow(ctx, arc, rim, Math.max(1, r * 0.06), 0.55 / i, listening * 0.8);
    }
  }

  ctx.restore();
}
