import { catmullRomToBezierPath, type Point } from "./shapes.js";

/**
 * THE GHOST's contour, which is the third family of them in this package.
 *
 * `shapes.ts` next door holds the two that were here first — the lobed blob
 * every living body is drawn with, and the faceted crystal a rock is — and it
 * was at its 250-line limit the day this arrived. The seam is not only the
 * line count: those two are *radial*, one radius sampled all the way round a
 * centre, and both are read by the hull, the queen's morph and every shape
 * tool. This one is not radial at all, has one creature, and is the whole of
 * why that creature could not be a blob.
 *
 * **The figures live here too, and nowhere else.** Every other creature's
 * numbers are in `silhouettes.ts` beside the radial contours they tune, and
 * these would be the one entry in that sheet none of its functions can read —
 * no `lobes`, no `depth`, nothing `blobRadiusMul` or `crystalRadiusMul` takes.
 * A shape and the only geometry that can draw it are one fact, so they are one
 * file; `silhouettes.ts` was at its 250-line limit the day this arrived, which
 * is how the question got asked.
 */

/**
 * THE GHOST's outline, as points — a dome over a hem that hangs in tails.
 *
 * **It is not a blob, and that is why it is a function of its own.**
 * `blobRadiusMul` is one radius sampled all the way round, so every lobe it
 * grows appears on the top of the body as well as the bottom: a ghost drawn
 * that way is a bumpy circle. The tails have to be on the underside *only*,
 * with a smooth dome above them, and no radial function does that. The
 * meteor's `crystalRadiusMul` is the precedent — a second contour family for
 * a body the first one cannot describe — and the arrangement is the same one:
 * the parameters live in `silhouettes.ts`, this is the geometry, and
 * `render/ghost.ts` and `tools/shape-sheet` both sample *this*, so what the
 * sheet measures is what the field draws.
 *
 * The box is `2rx` by `2ry`, centred on the origin like every other contour
 * here, and it is walked anticlockwise from the left waist: over the dome to
 * the right waist, down the right wall, along the hem right to left, and back
 * up the left wall to where it started.
 *
 * - `tails` is how many points hang off the hem. Four, on a body 26 px across,
 *   is as many as read as separate things.
 * - `skirt` is the hem's half-depth as a share of `ry`, so `0.22` gives a hem
 *   occupying a little under a quarter of the height. It must stay under 0.5
 *   or the hem's crests climb above the waist and the walls invert.
 * - `wobble` is the same idle breathing every other contour has, on the same
 *   `t`, so a ghost is never quite still and never leaves its tile.
 */
export function ghostOutline(
  rx: number,
  ry: number,
  tails: number,
  skirt: number,
  wobble: number,
  t: number,
  seed: number,
  dome = 24,
): Point[] {
  // Breathing, applied to the whole body rather than per-point: a ghost that
  // rippled along its own outline would read as a slick, which is a shape the
  // pair already has a word for. The two axes pull against each other — wider
  // is shorter — so what it reads as is a held breath rather than a body being
  // resized, which is the bulb's `SWAY_PUMP` argument made on a contour.
  const wx = 1 + wobble * Math.sin(t * 0.9 + seed * 1.7);
  const wy = 1 - wobble * 0.7 * Math.sin(t * 0.53 + seed * 2.3);
  const w = rx * wx;
  const h = ry * wy;
  // Where the hem sits. `amp` is half its depth, so its crests stand at
  // `wall` and its tips reach exactly `h` — the bottom of the box.
  const amp = h * skirt;
  const wall = h - 2 * amp;

  const pts: Point[] = [];
  // The dome: a half-ellipse from the left waist over the top to the right
  // waist. Both waists sit at y = 0, which is where the walls take over.
  for (let i = 0; i <= dome; i++) {
    const a = Math.PI * (1 - i / dome);
    pts.push({ x: Math.cos(a) * w, y: -Math.sin(a) * h });
  }
  // Down the right wall. Two points, so the spline through them is straight
  // rather than bulging out of the body's own width.
  pts.push({ x: w, y: wall * 0.5 });
  // The hem, right to left. It starts and ends on a crest at exactly `wall`,
  // which is where each wall stops, so the two joins are invisible.
  const steps = Math.max(8, tails * 8);
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    pts.push({ x: w - 2 * w * s, y: h - amp - amp * Math.cos(2 * Math.PI * tails * s) });
  }
  // And back up the left wall. The waist itself is the dome's first point, so
  // it is not repeated — the loop closes onto it.
  pts.push({ x: -w, y: wall * 0.5 });
  return pts;
}

/** THE GHOST's outline as a path. `ghostOutline` is the geometry; this is the
 * one call the canvas makes, the way `blobPath` is for a lobed body. */
export function ghostPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  tails: number,
  skirt: number,
  wobble: number,
  t: number,
  seed: number,
): string {
  const pts = ghostOutline(rx, ry, tails, skirt, wobble, t, seed).map((p) => ({
    x: cx + p.x,
    y: cy + p.y,
  }));
  return catmullRomToBezierPath(pts);
}

/**
 * THE GHOST's figures. A separate interface from `CreatureSilhouette` because
 * none of that one's fields mean anything here: there are no `lobes` running
 * round a centre and no `depth` for them to run at — see `ghostOutline` in
 * `ghost-shape.ts`, which is not a radial contour at all.
 */
export interface GhostSilhouette {
  /** Half-width and half-height of the box the body is drawn in. */
  rx: number;
  ry: number;
  /** Points hanging off the hem. */
  tails: number;
  /** The hem's half-depth as a share of `ry`. Under 0.5, or the walls invert. */
  skirt: number;
  wobble: number;
  seed: number;
}

/**
 * Ghost: a dome with a hem of four tails under it, taller than it is wide.
 *
 * **Nothing else in the game has a flat-ish bottom edge**, and that is what
 * the shape is spent on. Every other living body is a closed lobed blob whose
 * outline says the same thing all the way round; this one has a top and a
 * bottom, so it reads as a body that is *hanging* rather than one that is
 * falling — which is the right word for the only creature in the game that
 * leaves by going up.
 *
 * Four tails and not five: at the 26 px a body is drawn at, five is a fringe
 * and four is four things.
 *
 * **46 × 60, and the aspect is a decision rather than a look.** `longAxis`
 * calls a body tall only past `LONG_AXIS_RATIO`, a quarter again as long as it
 * is wide, and at 56 this shape measured *round* — the same bucket as the bulb
 * and the throb, which are the two it most needs not to be confused with
 * across a voice delay. At 60 it is the tall one, and the bestiary's own rule
 * about being distinct when spoken is answered by the geometry rather than by
 * hoping the tails carry it at 26 px.
 */
export const GHOST: GhostSilhouette = {
  rx: 46,
  ry: 60,
  tails: 4,
  skirt: 0.22,
  wobble: 0.05,
  seed: 6.0,
};
