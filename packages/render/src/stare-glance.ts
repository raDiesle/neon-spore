import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { type GlanceSize, glanceOf, look } from "./glance-styles.js";
import type { StareEye } from "./stare-shape.js";

/** How far the head's sides open and close, in the cowl's half-width, and how far it rolls. */
export const STARE_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.1, tilt: 0.35 };

/**
 * **THE STARE's head glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn, especially the head*, one entry per boss.
 *
 * THE STARE is an eye in a cowl, and the eye already rolls in its socket as
 * it opens (`stare-eye-globe.ts`), so what turns here is the head that eye is
 * set in: the cowl, its scars, the eye, the brow, the charge and the score's
 * lashes off the brow, together, **about the eye's centre** (`glance.ts`, a
 * `hold` of 0). The near side swells, the far side narrows into the dark.
 * What a thumb or a bolt meets does not turn: the lashes the charge asks to be
 * pulled stand where the simulation puts them, and the glass a bolt stops on
 * is drawn over the head, level (`stare-draw.ts`).
 *
 * Taken off VERSUS `stare:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: LOOK, holding a look to each side, as a thing
 * that watches does (`glance-styles.ts`), at `STARE_GLANCE_SIZE`, in the
 * cowl's half-width.
 */
export const STARE_GLANCE: Glance = glanceOf(look, STARE_GLANCE_SIZE);

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.55;
/** The cowl's half-width, in the socket's half-widths (`cowlPath`). */
const COWL = 1.55;

/**
 * The head as `draw` draws it about socket `e`, turned as `STARE_GLANCE`
 * says at `time` seconds. `draw` answers with the cowl, which the far side's
 * dark is laid over. Still, it is drawn once and exactly as before.
 */
export function drawStareGlanced(
  ctx: CanvasRenderingContext2D,
  e: StareEye,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(STARE_GLANCE, time, { x: e.cx, y: e.cy, r: e.rx * COWL, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: STARE_GLANCE_SIZE.reach, reach: 2.5 };
  drawGlancedLayer(ctx, f, shade, (g) => [draw(g)]);
}
