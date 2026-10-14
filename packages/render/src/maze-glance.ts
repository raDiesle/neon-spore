import { type Glance, glancedPoint, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";

/** How far the muscle's sides open and close, in its radius, and how far it rolls. */
export const MAZE_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.12, tilt: 0.45 };

/**
 * **THE MAZE's heart glances** — the owner, 9 and 10 October 2026: *body parts
 * of living things turn ... or if mechanical the full boss shape*, one entry
 * per boss.
 *
 * The drum is a made thing and it already turns — that is the round — so
 * what glances is the one living thing in it, the heart in the middle
 * (`maze-heart.ts`): the muscle, its chamber and the clock on its skin. It
 * turns **about its centre** (`glance.ts`, a `hold` of 0), because the centre
 * is where a shot arrives and where both thumbs take hold of it under `grip`:
 * the near side swells, the far side narrows into the dark. The veins, the
 * aura and the wound's ring are drawn outside it and do not turn — they run
 * out to the wall of the room, which does not move, and each is rooted where
 * the turned muscle has put its edge (`mazeGlancedPoint`).
 *
 * Taken off VERSUS `maze:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `MAZE_GLANCE_SIZE`, in the muscle's own radius.
 */
export const MAZE_GLANCE: Glance = glanceOf(cock, MAZE_GLANCE_SIZE);

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;

/**
 * The muscle as `draw` draws it about `x`,`y` (radius `r`), turned as
 * `MAZE_GLANCE` says at `time`. `draw` answers with the muscle's contour,
 * which the far side's dark is laid over. Still, it is drawn once and exactly
 * as before.
 */
export function drawMazeGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(MAZE_GLANCE, time, { ...at, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: MAZE_GLANCE_SIZE.reach, reach: 1.6 }, (g) => {
    return [draw(g)];
  });
}

/** Where the turned muscle has put a point `p` of it — a vein's root meets it there. */
export function mazeGlancedPoint(
  at: { x: number; y: number; r: number },
  time: number,
  p: { x: number; y: number },
): { x: number; y: number } {
  return glancedPoint(glanceFrame(MAZE_GLANCE, time, { ...at, hold: 0 }), p);
}
