import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";

/** How far the body's sides open and close, in its half-width, and how far it rolls. */
export const LEDGER_GLANCE_SIZE: GlanceSize = { reach: 0.34, cock: 0.08, tilt: 0.15 };

/**
 * **THE LEDGER's body glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * THE LEDGER is metal, so what turns is the whole body: both halves and the
 * seam between them, **about the seam** (`glance.ts`, a `hold` of 0, centred
 * half-way down it). The seam is the one place a bolt reaches the body
 * (`ledger-stop.ts`), and it stays on its column while the near half swells
 * and the far half narrows into the dark. The cord's foot is in the ship's
 * plating and is drawn before the body, so it does not turn, and neither do
 * the pilot's rings and the beads drawn after it.
 *
 * Taken off VERSUS `ledger:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `LEDGER_GLANCE_SIZE`, in the body's half-width.
 */
export const LEDGER_GLANCE: Glance = glanceOf(cock, LEDGER_GLANCE_SIZE, temperOf("ledger"));

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.55;

/**
 * The body as `draw` draws it about `at` (`r` its half-width, `ry` its
 * half-height, in the same pixels), turned as `LEDGER_GLANCE` says at `time`
 * seconds. `draw` answers with the halves' outlines, which the far side's
 * dark is laid over. Still, it is drawn once and exactly as before.
 */
export function drawLedgerGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  ry: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = glanceFrame(LEDGER_GLANCE, time, { ...at, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: LEDGER_GLANCE_SIZE.reach, reach: ry / at.r + 1 };
  drawGlancedLayer(ctx, f, shade, draw);
}
