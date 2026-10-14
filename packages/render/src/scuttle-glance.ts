import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";

/** How far a plate's ends open and close, in its half-width, and how far it rolls. */
export const SCUTTLE_GLANCE_SIZE: GlanceSize = { reach: 0.4, cock: 0.12, tilt: 0.2 };

/**
 * **THE SCUTTLE's hanging parts glance** — the owner, 9 and 10 October 2026:
 * *body parts of living things turn ... or if mechanical the full boss
 * shape*, one entry per boss.
 *
 * The slab spans the top of the field and its sockets are the count, each
 * over the column its throw lands in, so neither turns. What turns is each
 * part hanging under it on its thread, a tag on a string, **about its own
 * centre** (`glance.ts`, a `hold` of 0): the near end swells, the far end
 * narrows and goes dark, and the top of its middle — where the thread meets
 * it (`scuttleThread`) — stays where it was. The centre is where a thumb
 * takes the part (`scuttle-grip.ts`) and what a bolt is stopped against
 * (`scuttle-stop.ts`), so neither moves either.
 *
 * Each part runs the round from its own place in it, by its socket, so the
 * parts hanging at once do not turn as one.
 *
 * Taken off VERSUS `scuttle:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: COCK, the turn he found the most
 * real (`glance-styles.ts`), at `SCUTTLE_GLANCE_SIZE`, in the plate's
 * half-width.
 */
export const SCUTTLE_GLANCE: Glance = glanceOf(cock, SCUTTLE_GLANCE_SIZE, temperOf("scuttle"));

/** How dark the far end goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** Seconds apart in the round one socket's part is from the next. */
const STAGGER = 1.1;

/**
 * A hanging part as `draw` draws it about `at` (`r` its half-width), turned as
 * `SCUTTLE_GLANCE` says at `time` from socket `i`'s place in the round. `draw`
 * answers with the plate's outline, which the far end's dark is laid over.
 * Still, it is drawn once and exactly as before.
 */
export function drawScuttleGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  i: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(SCUTTLE_GLANCE, time + i * STAGGER, { ...at, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: SCUTTLE_GLANCE_SIZE.reach, reach: 1.6 }, (g) => [
    draw(g),
  ]);
}
