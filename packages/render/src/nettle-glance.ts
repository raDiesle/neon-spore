import { type Glance, glancedPoint, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import type { NettleBell } from "./nettle-stop.js";

/** How far the bell turns, in its radius, and how far it rolls. */
export const NETTLE_GLANCE_SIZE: GlanceSize = { reach: 0.16, cock: 0.05, tilt: 0.25 };

/**
 * **THE NETTLE glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn, especially the head*, one entry per boss.
 *
 * A jellyfish's head is its bell, so the bell turns, and everything that
 * hangs from it with it — the crown or the underside, the arms, the curtain,
 * the core. It turns **about its own middle** (`glance.ts`, a `hold` of 0),
 * where the core burns and the mouth's marks sit: the near side opens, the
 * far side closes and goes dark. The marks stay where the script planted
 * them, as they already do while the bell pulses and flinches
 * (`nettle-draw.ts`), and a bolt meets the bell where it is drawn
 * (`nettle-stop.ts`).
 *
 * Taken off VERSUS `nettle:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `NETTLE_GLANCE_SIZE`, counted in the bell's radius
 * — kept moderate, because a mark on the rim drifts off its part by the share
 * it turns.
 */
export const NETTLE_GLANCE: Glance = glanceOf(cock, NETTLE_GLANCE_SIZE);

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.55;
/** How far the layer reaches, in bell radii: the arms and the curtain hang well below it. */
const REACH = 2.6;

const frameAt = (bell: NettleBell, time: number) =>
  glanceFrame(NETTLE_GLANCE, time, { ...bell, hold: 0 });

/**
 * The body as `draw` draws it, turned about the bell's middle as
 * `NETTLE_GLANCE` says. `draw` answers with the outlines the far side's dark
 * is laid over. Still, it is drawn once and exactly as before.
 */
export function drawNettleGlanced(
  ctx: CanvasRenderingContext2D,
  bell: NettleBell,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(bell, time);
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: NETTLE_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** Where the bell's turn carries a point `p` of the body — a bolt's stop. */
export function nettleGlancedPoint(
  bell: NettleBell,
  time: number,
  p: { x: number; y: number },
): { x: number; y: number } {
  const f = frameAt(bell, time);
  return glanceStill(f) ? p : glancedPoint(f, p);
}
