import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";

/** How far a knuckle's sides open and close, in its radius, and how far it rolls. */
export const BATON_GLANCE_SIZE: GlanceSize = { reach: 0.5, cock: 0.21, tilt: 0.4 };

/**
 * **THE BATON's knuckles glance** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * THE BATON is an arm of sockets, and turning the arm would bend the line the
 * beads are passed down. What turns is each socket's knuckle
 * (`baton-socket-draw.ts`), twisting on the arm like a vertebra **about its
 * own centre** (`glance.ts`, a `hold` of 0): the near side swells, the far
 * side narrows and goes dark. The centre is where a bead sits, where a grip's
 * ring and a caption find the socket (`socketPoint`), so all of them stay
 * on it, and the beads, drawn over the arm, do not turn.
 *
 * Each knuckle runs the round from its own place in it, by its socket, so the
 * arm twists down its length rather than as one.
 *
 * Taken off VERSUS `baton:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `BATON_GLANCE_SIZE`, in the knuckle's radius —
 * half again what VERSUS offered, as he asked: it was barely seen.
 */
export const BATON_GLANCE: Glance = glanceOf(cock, BATON_GLANCE_SIZE, temperOf("baton"));

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** Seconds apart in the round one knuckle is from the next. */
const STAGGER = 0.9;

/**
 * A knuckle as `draw` draws it about `at` (`r` its radius at rest), turned as
 * `BATON_GLANCE` says at `time` from socket `i`'s place in the round. `draw`
 * answers with the knuckle's ring, which the far side's dark is laid over, or
 * `null` where there is none. Still, it is drawn once and exactly as before.
 */
export function drawBatonGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  i: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D | null,
): void {
  const f = glanceFrame(BATON_GLANCE, time + i * STAGGER, { ...at, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: BATON_GLANCE_SIZE.reach, reach: 2.5 }, (g) => {
    const ring = draw(g);
    return ring === null ? [] : [ring];
  });
}
