import type { Layout } from "./layout.js";
import { veilScatter } from "./veil-bolt.js";

/**
 * THE VEIL's *form*: the silhouette a cloud has, and what it sheds out of the
 * bottom of it.
 *
 * Its own file beside `veil.ts` because the two answer different questions.
 * This one is the shape — where the heaps stand, how they breathe, where the
 * bottom edge is — and it is the half a shape tool would want if the cloud
 * ever earns a card. Next door is the *paint*: which colours, how see-through,
 * which seat, and the two seconds of red a wrong shot buys.
 */

/**
 * The billows a cloud is made of: a flat base with three heaps standing on it,
 * as offsets and radii in units of `r`.
 *
 * **Not `blobPath`.** Every other body in this game is a lobed contour and the
 * first version of this was too — seven shallow lobes, on the reasoning that a
 * thunderhead is a stack of billows and a lobe is a billow. It drew a spiky
 * star. A lobed contour has one radius per angle, so its dips are *notches*
 * cut inward from a circle, and a cloud's shape is the opposite: overlapping
 * heaps whose outline is the union of their edges and never dips between them.
 * So this is four subpaths filled as one, which unions them, and the base is
 * wider and lower than the heaps because weather is heavy at the bottom.
 *
 * The union is also why there is no outline stroke below. Stroking a path with
 * four subpaths draws the seams *inside* the silhouette, which reads as four
 * bubbles rather than one cloud; the rim is a slightly larger copy filled
 * underneath instead.
 */
const BILLOWS: readonly { dx: number; dy: number; r: number; ry?: number }[] = [
  { dx: 0, dy: 0.2, r: 1, ry: 0.44 },
  { dx: -0.46, dy: -0.04, r: 0.46 },
  { dx: 0.05, dy: -0.26, r: 0.56 },
  { dx: 0.52, dy: -0.02, r: 0.42 },
];

/** How far the whole shape reaches below its centre — the base's own bottom.
 * The wisps come off this line and the marks are lifted clear of the top. */
export const VEIL_FLATTEN = 0.66;

/** And how far it reaches *above* it — the tallest heap's own top. What stands
 * over a cloud (`veil-marks.ts`) is lifted clear of this rather than of a
 * number typed beside it, so a reshaped cloud does not leave a ring inside its
 * own weather. */
export const VEIL_TOP = 0.82;

/**
 * The silhouette, as one path with four subpaths in it — filled `nonzero`, so
 * what comes out is their union and never their outlines. Each heap breathes
 * on the contour clock, slowly and by a couple of percent, which is the same
 * order of movement `blobPath`'s wobble gives every other body in the game.
 */
export function cloudPath(r: number, t: number): Path2D {
  const p = new Path2D();
  for (const [i, b] of BILLOWS.entries()) {
    const swell = 1 + 0.045 * Math.sin(t * 0.8 + i * 1.7);
    const drift = 0.02 * Math.sin(t * 0.55 + i * 2.3);
    p.ellipse(
      (b.dx + drift) * r,
      b.dy * r,
      b.r * r * swell,
      (b.ry ?? b.r) * r * swell,
      0,
      0,
      Math.PI * 2,
    );
  }
  return p;
}

/**
 * What the cloud sheds. Three soft blobs off the underside, each on its own
 * third of a slow cycle: they appear at the bottom edge, sink a third of a
 * tile and fade out, so the eye is given something that is plainly falling
 * *away* from the body rather than with it.
 *
 * Under the cloud's own contour and outside the clip, which is the whole
 * point — a wisp still inside the weather is not one that has come off it.
 */
export function drawVeilWisps(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  beats: number,
  id: number,
  hex: string,
): void {
  ctx.save();
  ctx.fillStyle = hex;
  for (let k = 0; k < 3; k++) {
    // Each wisp is a third of a cycle behind the last, and a cycle is two
    // beats — slow enough to read as drifting rather than as a stream.
    const phase = (((beats / 2 + k / 3 + veilScatter(id, k) * 0.3) % 1) + 1) % 1;
    const a = Math.sin(phase * Math.PI) * 0.3;
    if (a <= 0.01) continue;
    const wx = x + (veilScatter(id + k * 5, k) * 2 - 1) * r * 0.5;
    const wy = y + r * VEIL_FLATTEN * 0.95 + phase * l.tile * 0.34;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.ellipse(wx, wy, r * 0.22 * (1 - phase * 0.4), r * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
