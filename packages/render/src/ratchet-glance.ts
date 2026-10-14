import { RATCHET_TEETH, type SimConfig } from "@neon-spore/sim";
import { type Glance, glancedPoint, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import type { Layout } from "./layout.js";
import { type Point, ratchetGirth, ratchetPawlY, ratchetX } from "./ratchet-shape.js";

/** How far the rack turns, in the widest plate's half-width, and how far it rolls. */
export const RATCHET_GLANCE_SIZE: GlanceSize = { reach: 0.4, cock: 0.04, tilt: 0.12 };

/**
 * **THE RATCHET glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss.
 *
 * A machine, so what moves in it turns: the rack of plates and its spring
 * yaw together **about the rack's own column** (`glance.ts`, a `hold` of 0),
 * centred on the seam the pawl bears on, inside a strut that stands still.
 * The plates' near halves open and their far halves close into the dark, and
 * the teeth swing out toward the pawl and away from it. The strut, the lock,
 * the catch and the pawl's pad — the marks a thumb is on — do not move; the
 * pawl's tip follows its shoulder (`ratchetGlancedPoint`, `ratchetPawlArm`),
 * and a bolt meets the plates where they are drawn (`ratchet-stop.ts`).
 *
 * Taken off VERSUS `ratchet:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: COCK, the turn he found the most
 * real (`glance-styles.ts`), at `RATCHET_GLANCE_SIZE`, counted in the widest
 * plate's half-width — large, because the rack is narrow, and a small roll,
 * because it is tall.
 */
export const RATCHET_GLANCE: Glance = glanceOf(cock, RATCHET_GLANCE_SIZE);

/** How dark the far halves go, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in tiles: the spring at the lock and the rack driven into the hull. */
const REACH_TILES = 12;

/** The rack's turn at `time`, about the seam on its column. */
function frameAt(l: Layout, cfg: SimConfig, time: number) {
  const r = ratchetGirth(l, RATCHET_TEETH - 1);
  const at = { x: ratchetX(l, cfg), y: ratchetPawlY(l), r, hold: 0 };
  return glanceFrame(RATCHET_GLANCE, time, at);
}

/**
 * The rack and its spring as `draw` draws them, turned as `RATCHET_GLANCE`
 * says. `draw` answers with the outlines the far halves' dark is laid over.
 * Still, they are drawn once and exactly as before.
 */
export function drawRatchetGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(l, cfg, time);
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = {
    dark: FAR_DARK,
    full: RATCHET_GLANCE_SIZE.reach,
    reach: (REACH_TILES * l.tile) / f.r,
  };
  drawGlancedLayer(ctx, f, shade, draw);
}

/** Where the rack's turn carries a point `p` of it — the shoulder a pawl bears on, a bolt's stop. */
export function ratchetGlancedPoint(l: Layout, cfg: SimConfig, time: number, p: Point): Point {
  const f = frameAt(l, cfg, time);
  return glanceStill(f) ? p : glancedPoint(f, p);
}
