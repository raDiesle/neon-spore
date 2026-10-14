import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { type GlanceSize, glanceOf, sway } from "./glance-styles.js";

/** How far the mound's sides open and close, in its half-width — and no roll. */
export const LEAD_GLANCE_SIZE: GlanceSize = { reach: 0.4, cock: 0, tilt: 0 };

/**
 * **THE LEAD's body glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn, especially the head*, one entry per boss.
 *
 * The organ at the tip is a head, but a bead a sixth of a tile across turned
 * on its own is not seen. So what turns is the body the head stands on: the
 * mound, the stalk out of it and the head at its tip, as one, **about the
 * foot** (`glance.ts`, a `hold` of 0) — the mound's near side swelling, its
 * far side and the beads' narrowing into the dark. The ridge a bolt stops on
 * (`lead-stop.ts`) is drawn before it and does not turn.
 *
 * **It never rolls.** On the navigator's screen the stalk stands dead upright
 * by design, and a lean there would read as the lean the pilot is shown
 * (`lead-draw.ts`), so `LEAD_GLANCE_SIZE` has no cock and no tilt — and COCK,
 * which would be SWAY, is not offered. **It turns only where it is drawn as
 * a body**, on the navigator's screen; on the pilot's the stalk is a readout
 * and stands still.
 *
 * Taken off VERSUS `lead:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: SWAY, since it has no roll and COCK would be SWAY
 * (`glance-styles.ts`), at `LEAD_GLANCE_SIZE`, in the mound's half-width.
 */
export const LEAD_GLANCE: Glance = glanceOf(sway, LEAD_GLANCE_SIZE);

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;

/**
 * The mound and its stalk as `draw` draws them on `foot` (`r` the mound's
 * half-width, `span` how far the head stands from the foot, in the same
 * pixels), turned as `LEAD_GLANCE` says at `time` seconds. `draw` answers
 * with the outlines the far side's dark is laid over. Still, it is drawn once
 * and exactly as before.
 */
export function drawLeadGlanced(
  ctx: CanvasRenderingContext2D,
  foot: { x: number; y: number; r: number },
  span: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = glanceFrame(LEAD_GLANCE, time, { ...foot, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: LEAD_GLANCE_SIZE.reach, reach: span / foot.r + 1 };
  drawGlancedLayer(ctx, f, shade, draw);
}
