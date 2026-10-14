import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";

/** How far the bearing turns, in halves of its mount — a share of the near half's growth — and how far it rolls. */
export const VANE_GLANCE_SIZE: GlanceSize = { reach: 0.13, cock: 0.06, tilt: 0.4 };

/**
 * **THE VANE's bearing glances on its hub** — the owner, 9 and 10 October
 * 2026: *body parts of living things turn ... or if mechanical the full boss
 * shape*, one entry per boss.
 *
 * It is a made thing, so the whole bearing turns: the mount it is bolted to,
 * the bolt circle and the hub (`vane-bearing.ts`). It turns **about its
 * centre** (`glance.ts`, a `hold` of 0), because the hub is the one part of
 * the boss a shot reaches and a thumb presses (`vaneHubAt`,
 * `vaneHousingCircle`): the middle stays on its column while the mount's near
 * end grows longer and lighter and its far end shortens and goes dark, and the
 * pins bunch on the far side of the hub and spread on the near one. The arm,
 * its guards and its tip are drawn after and do not turn — the tip is the fold
 * line the pair reads a column off.
 *
 * Taken off VERSUS `vane:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `VANE_GLANCE_SIZE`, in halves of the mount's length
 * — small, because the split rides the mount's far end a tile out and the end
 * may not leave it.
 */
export const VANE_GLANCE: Glance = glanceOf(cock, VANE_GLANCE_SIZE);

/** Half the mount's length, in tiles (`vane-bearing.ts`). */
const MOUNT_HALF = 1.15;
/** How dark the far end goes, reached at the widest turn. */
const FAR_DARK = 0.7;

/**
 * The bearing as `draw` draws it about the hub at `px`,`py` (radius `hub`),
 * turned as `VANE_GLANCE` says at `time`. Still, it is drawn once and exactly
 * as before.
 */
export function drawVaneGlanced(
  ctx: CanvasRenderingContext2D,
  tile: number,
  px: number,
  py: number,
  hub: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => void,
): void {
  const r = tile * MOUNT_HALF;
  const f = glanceFrame(VANE_GLANCE, time, { x: px, y: py, r, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: VANE_GLANCE_SIZE.reach, reach: 1.6 }, (g) => {
    draw(g);
    // What the far half's dark is laid over: the mount and the bolt circle.
    const shape = new Path2D();
    shape.rect(px - r, py - tile * 0.26, 2 * r, tile * 0.46);
    // Both wound clockwise, so the two fill as one under the nonzero rule.
    shape.moveTo(px + hub * 1.4, py);
    shape.arc(px, py, hub * 1.4, 0, Math.PI * 2);
    return [shape];
  });
}
