import { type Glance, glancedPoint, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";
import { keelTendons } from "./keel-pose.js";
import { keelPlateHalf, type Point, type Seg } from "./keel-shape.js";
import type { Layout } from "./layout.js";

/**
 * **THE KEEL glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss.
 *
 * A spine, so every vertebra turns, all six in step, each **about its own
 * joint** (`glance.ts`, a `hold` of 0): the joint is what a thumb taps, the
 * ring, halo and verdict are drawn on, and which half of the screen it
 * stands on is whose it is — so none of that moves. Each plate's near end
 * reaches out and its far end shortens into the dark, its ribs and seam with
 * it, and the tendons stay strung from end to end where the turn carries the
 * ends (`keelGlancedTendons`), as a bolt meets the plates where they are
 * drawn (`keel-stop.ts`).
 *
 * Shipped, it does not glance: `KEEL_GLANCE` is still, and VERSUS
 * `keel:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `KEEL_GLANCE_SIZE`, counted in half a plate's length — a large share,
 * because a plate is a tile long.
 */
export const KEEL_GLANCE: Glance = { ...STILL_GLANCE };

/** How far each vertebra turns, in half its length, and how far it rolls. */
export const KEEL_GLANCE_SIZE: GlanceSize = { reach: 0.35, cock: 0.08, tilt: 0.4 };

/** How dark a plate's far end goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in half-lengths: a turned plate and its stroke. */
const REACH = 2;

/** The vertebra at `centre`'s turn at `time`. */
const frameAt = (l: Layout, centre: Point, time: number) =>
  glanceFrame(KEEL_GLANCE, time, { ...centre, r: keelPlateHalf(l), hold: 0 });

/**
 * The vertebra at `centre` as `draw` draws it, turned about its joint as
 * `KEEL_GLANCE` says. `draw` answers with the outlines the far end's dark is
 * laid over. Still, it is drawn once and exactly as before.
 */
export function drawKeelGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  centre: Point,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(l, centre, time);
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: KEEL_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** Where the turn of the vertebra at `centre` carries a point `p` of it. */
export function keelGlancedPoint(l: Layout, centre: Point, time: number, p: Point): Point {
  const f = frameAt(l, centre, time);
  return glanceStill(f) ? p : glancedPoint(f, p);
}

/** The tendons, each strung between two plates' ends where their turns carry them (`keelTendons`). */
export function keelGlancedTendons(
  l: Layout,
  segs: readonly Seg[],
  time: number,
): [Point, Point][] {
  return keelTendons(l, segs).map(([a, b], k) => {
    const from = segs[k];
    const to = segs[k + 1];
    return [
      from === undefined ? a : keelGlancedPoint(l, from.centre, time, a),
      to === undefined ? b : keelGlancedPoint(l, to.centre, time, b),
    ];
  });
}
