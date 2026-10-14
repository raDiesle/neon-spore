import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";

/** How far the body's middle swings, in body radii, and how far it rolls. */
export const WARDEN_GLANCE_SIZE: GlanceSize = { reach: 0.13, cock: 0.06, tilt: 0.3 };

/**
 * **THE WARDEN's body glances about its eye** — the owner, 9 and 10 October
 * 2026: *body parts of living things turn, especially the head ... or if
 * mechanical the full boss shape*, one entry per boss.
 *
 * Its eye is the thing a thumb holds and a shot goes in at (`warden-grip.ts`,
 * `wardenEyeCircle`), and the rope is tied to its underside, so the eye, its
 * hatch and the rope do not move. What turns is the horseshoe round it: the
 * body is drawn as two planes meeting at the eye (`glance.ts`), the two points
 * where the hole is widest held, so the hole stays round the eye while the
 * material above it swings toward one side — that side bunching and going
 * dark, the other opening — as a head turns about the eye it is looking out
 * of. The swing is kept inside the hatch's margin, so the top of the hole
 * never slides out from behind the door.
 *
 * Taken off VERSUS `warden:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `WARDEN_GLANCE_SIZE`, in body radii.
 */
export const WARDEN_GLANCE: Glance = glanceOf(cock, WARDEN_GLANCE_SIZE, temperOf("warden"));

/** How dark the far side goes at its edge, reached at the widest swing. */
const FAR_DARK = 0.5;

/**
 * The body as `draw` draws it, turned about the eye at `eye` — the hole's
 * radius `hole`, the body's `r` — as `WARDEN_GLANCE` says at `time`. `draw`
 * answers with the body's contour, which the far side's dark is laid over.
 * Still, it is drawn once and exactly as before.
 */
export function drawWardenGlanced(
  ctx: CanvasRenderingContext2D,
  eye: { x: number; y: number },
  r: number,
  hole: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(WARDEN_GLANCE, time, { x: eye.x, y: eye.y, r, hold: hole / r });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: WARDEN_GLANCE_SIZE.reach, reach: 1.5 }, (g) => [
    draw(g),
  ]);
}
