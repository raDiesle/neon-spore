import type { SimConfig } from "@neon-spore/sim";
import { type Glance, glancedPoint, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { haspCentre, haspShellRadius, type Point } from "./hasp-shape.js";
import type { Layout } from "./layout.js";

/** How far each shell turns, in its radius — a share of the near half's growth — and how far it rolls. */
export const HASP_GLANCE_SIZE: GlanceSize = { reach: 0.22, cock: 0.06, tilt: 0.3 };

/**
 * **THE HASP glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss.
 *
 * A machine, so the full shape turns: the door's three shells yaw together,
 * each **about its own hub** (`glance.ts`, a `hold` of 0), because the hub is
 * where her wheel is turned and the cap sits, and the latch's rail stands off
 * it at a fixed distance — none of what a thumb is on moves. Each shell's near
 * half opens and its far half closes into the dark, a spent clasp as well as a
 * sealed one, so the door reads as one iron thing turning on its pins. The
 * story's chatter and rust go with the shell they are on, and the latch's
 * staple keeps hold of the shell's edge (`haspGlancedPoint`), as does a bolt
 * meeting it (`hasp-stop.ts`).
 *
 * Taken off VERSUS `hasp:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `HASP_GLANCE_SIZE`, counted in the shell's radius.
 */
export const HASP_GLANCE: Glance = glanceOf(cock, HASP_GLANCE_SIZE);

/** How dark a shell's far half goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in shell radii: a spent shell's tail swings well past its own box. */
const REACH = 2.2;

/** Clasp `i`'s turn about its hub at `time`. */
const frameAt = (l: Layout, cfg: SimConfig, i: number, time: number) =>
  glanceFrame(HASP_GLANCE, time, { ...haspCentre(l, cfg, i), r: haspShellRadius(l), hold: 0 });

/**
 * Clasp `i`'s shell as `draw` draws it, turned about its hub as `HASP_GLANCE`
 * says. `draw` answers with the outlines the far half's dark is laid over.
 * Still, it is drawn once and exactly as before.
 */
export function drawHaspGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  i: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(l, cfg, i, time);
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: HASP_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** Where clasp `i`'s turn carries a point `p` of its shell — the staple's foot, a bolt's stop. */
export function haspGlancedPoint(
  l: Layout,
  cfg: SimConfig,
  i: number,
  time: number,
  p: Point,
): Point {
  const f = frameAt(l, cfg, i, time);
  return glanceStill(f) ? p : glancedPoint(f, p);
}
