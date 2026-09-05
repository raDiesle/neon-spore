import { blobRadiusMul, type CreatureSilhouette, type Point } from "@neon-spore/content";

/**
 * One bead's plating, as geometry. No world, no creature and no layout — the
 * pass that finds the caged beads and puts this on them is `strand-armour.ts`
 * next door, the same seam `shell-plate.ts` and `shell-draw.ts` are split
 * along and for the same reason.
 *
 * Everything here is in the **body's own local units** — the `rx`/`ry` of the
 * slick, the bulb or the reel underneath — so a plate traces the creature's
 * own outline rather than being a ring pasted over it, and one file cuts
 * armour for all three shapes.
 */

/** Plates around the contour, and the share of each one's slot left as a gap.
 * Six is enough to read as segmented at the size a phone draws a body and few
 * enough that each plate is a plate rather than a tick. */
const PLATES = 6;
const GAP = 0.26;

/** How far the plating's two edges stand outside the body's own contour, as a
 * multiple of its radius at each angle. The inner edge clears the outline
 * rather than sitting on it — the gap between the two is what makes them read
 * as *two* borders — and the outer one stops well short of changing which
 * silhouette the pair name, the constraint `shell-plate.ts` sets out at
 * length for the same reason. */
const ARMOUR_IN = 1.18;
const ARMOUR_OUT = 1.46;

/**
 * How much of the body's own lobing the plating keeps.
 *
 * Not all of it. A bulb has nine lobes and a plate that traced every one of
 * them came out as a scribble around the body — armour is *rigid*, and a hard
 * grey line that wobbles exactly as much as the soft coloured one under it
 * reads as a second aura rather than as a shell. At a little over half, the
 * plating is plainly cut to *this* body — wide and flat over a slick, round
 * over a bulb, and its lobes fall where the body's do — while being the
 * calmer of the two outlines, which is what a hard thing over a soft one
 * looks like.
 */
const SOFTEN = 0.25;

/** Points sampled along one plate's arc. Coarse on purpose, the same argument
 * `shell-plate.ts` makes: a hard edge reads from far fewer points than a soft
 * one needs, at the couple of dozen pixels a body draws at on a phone. */
const ARC_POINTS = 10;

/** The contour at one angle, scaled out by `mul` — the same `blobRadiusMul`
 * the body underneath is drawn with, so a plate follows its lobes instead of
 * cutting across them. */
function contourAt(s: CreatureSilhouette, a: number, t: number, mul: number): Point {
  const m = (1 + (blobRadiusMul(a, s.lobes, s.depth, s.wobble, t, s.seed) - 1) * SOFTEN) * mul;
  return { x: Math.cos(a) * s.rx * m, y: Math.sin(a) * s.ry * m };
}

/** Where one plate begins and ends, in radians. */
function plateSpan(i: number): { from: number; to: number } {
  const step = (Math.PI * 2) / PLATES;
  const span = step * (1 - GAP);
  // One plate centred at the foot of the body, so a cage never reads as
  // hanging off the thread by a corner.
  const from = Math.PI / 2 + i * step - span / 2;
  return { from, to: from + span };
}

/** All six plates as one closed band each: out along the outer edge, back
 * along the inner one. Filled and rimmed in a single path, because six plates
 * are one statement about a body and drawing them one at a time only makes
 * six chances to draw one of them differently. */
export function platesPath(s: CreatureSilhouette, t: number): Path2D {
  const path = new Path2D();
  for (let i = 0; i < PLATES; i++) {
    const { from, to } = plateSpan(i);
    for (let p = 0; p <= ARC_POINTS; p++) {
      const { x, y } = contourAt(s, from + ((to - from) * p) / ARC_POINTS, t, ARMOUR_OUT);
      if (p === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    for (let p = ARC_POINTS; p >= 0; p--) {
      const { x, y } = contourAt(s, from + ((to - from) * p) / ARC_POINTS, t, ARMOUR_IN);
      path.lineTo(x, y);
    }
    path.closePath();
  }
  return path;
}

/** The outer edge of each plate on its own, as an open path — what the light
 * catches, and nothing else. */
export function edgePath(s: CreatureSilhouette, t: number): Path2D {
  const path = new Path2D();
  for (let i = 0; i < PLATES; i++) {
    const { from, to } = plateSpan(i);
    for (let p = 0; p <= ARC_POINTS; p++) {
      const { x, y } = contourAt(s, from + ((to - from) * p) / ARC_POINTS, t, ARMOUR_OUT);
      if (p === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
  }
  return path;
}
