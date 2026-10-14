import { type Glance, glancedPoint, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { type GlanceSize, glanceOf, sway } from "./glance-styles.js";
import type { Layout } from "./layout.js";
import { type Point, slingTip } from "./sling-shape.js";

/** How far the fork turns, in its half-span, and how far it rolls. */
export const SLING_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.05, tilt: 0.2 };

/**
 * **THE SLING glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss.
 *
 * A machine, so the full fork turns: both tines, the cords off them and the
 * cup in the crotch yaw together **about the crotch** (`glance.ts`, a `hold`
 * of 0), where it is bolted over the middle column. The near tine reaches out
 * and the far one closes into the dark, each cord carried with its tine. A
 * draw is a thumb anywhere on its seat's own panel (`sling-grip.ts`), so
 * nothing a thumb is on moves; the marks round the cords follow them
 * (`slingGlancedPoint`), and a bolt meets the tines and cords where they are
 * drawn (`sling-stop.ts`).
 *
 * Taken off VERSUS `sling:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: SWAY, one slow sine, as a thing that hangs or
 * flows swings (`glance-styles.ts`), at `SLING_GLANCE_SIZE`, counted in the
 * fork's half-span at its tips — a large share, because the fork is barely
 * more than a tile across.
 */
export const SLING_GLANCE: Glance = glanceOf(sway, SLING_GLANCE_SIZE);

/** How dark the far tine goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in half-spans: a drawn cord hangs three of them under the crotch. */
const REACH = 3.6;

/** The fork's turn at `time`, about its crotch. */
const frameAt = (l: Layout, time: number) =>
  glanceFrame(SLING_GLANCE, time, { x: 0, y: 0, r: slingTip(l, 1, 1).x, hold: 0 });

/**
 * The fork as `draw` draws it about its crotch, turned as `SLING_GLANCE`
 * says. `draw` answers with the outlines the far tine's dark is laid over.
 * Still, it is drawn once and exactly as before.
 */
export function drawSlingGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(l, time);
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: SLING_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** Where the fork's turn carries a point `p` of it, about its crotch — a cord's mark, a bolt's stop. */
export function slingGlancedPoint(l: Layout, time: number, p: Point): Point {
  const f = frameAt(l, time);
  return glanceStill(f) ? p : glancedPoint(f, p);
}
