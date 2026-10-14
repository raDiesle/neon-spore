import { type Glance, glancedPoint, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";
import type { Layout } from "./layout.js";
import { mantleReach, mantleTieY, type Point } from "./mantle-shape.js";

/** How far the shell turns, in its half-width, and how far it rolls. */
export const MANTLE_GLANCE_SIZE: GlanceSize = { reach: 0.18, cock: 0.04, tilt: 0.2 };

/**
 * **THE MANTLE glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss.
 *
 * A hinged shell, so the full shape turns: both valves, their plates, the
 * seam and the core under them yaw together **about the shell's middle**
 * (`glance.ts`, a `hold` of 0), at the height the straps are tied — the
 * height its lean already turns about (`mantle-sway.ts`). The near valve
 * opens and the far one closes into the dark. The knobs and their grooves
 * are what a thumb drags and do not move; each strap keeps hold of its tie
 * where the turn carries it, a tenth of a tile at most, since the ties sit
 * near the middle (`mantleGlancedPoint`), and a bolt meets the shell where
 * it is drawn (`mantle-stop.ts`).
 *
 * Taken off VERSUS `mantle:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `MANTLE_GLANCE_SIZE`, counted in the shell's
 * half-width.
 */
export const MANTLE_GLANCE: Glance = glanceOf(cock, MANTLE_GLANCE_SIZE, temperOf("mantle"));

/** How dark the far valve goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in half-widths: the shell is taller than it is wide, and a shed plate falls. */
const REACH = 2.4;

/** The shell's turn at `time`, about its middle at the ties' height. */
const frameAt = (l: Layout, at: Point, time: number) =>
  glanceFrame(MANTLE_GLANCE, time, {
    x: at.x,
    y: mantleTieY(l, at),
    r: mantleReach(l).rx,
    hold: 0,
  });

/**
 * The shell as `draw` draws it, turned as `MANTLE_GLANCE` says. `draw`
 * answers with the outlines the far valve's dark is laid over. Still, it is
 * drawn once and exactly as before.
 */
export function drawMantleGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(l, at, time);
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: MANTLE_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** Where the shell's turn carries a point `p` of it — a strap's tie, a bolt's stop. */
export function mantleGlancedPoint(l: Layout, at: Point, time: number, p: Point): Point {
  const f = frameAt(l, at, time);
  return glanceStill(f) ? p : glancedPoint(f, p);
}
