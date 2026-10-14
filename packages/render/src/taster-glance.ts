import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { type GlanceSize, glanceOf, look } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";

/** How far a blade's flats open and close, in its half-width, and how far it rolls. */
export const TASTER_GLANCE_SIZE: GlanceSize = { reach: 0.4, cock: 0.1, tilt: 0.3 };

/**
 * **THE TASTER's blades glance** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * THE TASTER is a crest the width of the field, and a crest that wide turning
 * would slide its notches off the columns a shot is aimed up. What turns is
 * each blade standing out of it, a knife twisted in its socket, **about its
 * root** (`glance.ts`, a `hold` of 0): the near flat widens, the far one
 * narrows and goes dark, and a roll swings the tip about where the blade
 * meets the crest. The root is where the pilot's pin and pry stand
 * (`taster-grip.ts`), and a shot is judged by column, so neither moves.
 *
 * Each blade runs the round from its own place in it, by its column, so the
 * fan does not turn as one.
 *
 * Taken off VERSUS `taster:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: LOOK, holding a look to each side, as a thing
 * that watches does (`glance-styles.ts`), at `TASTER_GLANCE_SIZE`, in the
 * blade's half-width at its root.
 */
export const TASTER_GLANCE: Glance = glanceOf(look, TASTER_GLANCE_SIZE, temperOf("taster"));

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** Seconds apart in the round one blade is from the next. */
const STAGGER = 0.9;

/**
 * A blade as `draw` draws it standing on `root` (`r` its half-width there,
 * `span` how far its tip reaches from the root, in the same pixels), turned as
 * `TASTER_GLANCE` says at `time` from blade `i`'s place in the round. `draw`
 * answers with the blade's outline, which the far side's dark is laid over,
 * or `null` when there is no blade to draw. Still, it is drawn once and
 * exactly as before.
 */
export function drawTasterGlanced(
  ctx: CanvasRenderingContext2D,
  root: { x: number; y: number; r: number },
  span: number,
  i: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D | null,
): void {
  const f = glanceFrame(TASTER_GLANCE, time + i * STAGGER, { ...root, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: TASTER_GLANCE_SIZE.reach, reach: span / root.r + 1 };
  drawGlancedLayer(ctx, f, shade, (g) => {
    const body = draw(g);
    return body === null ? [] : [body];
  });
}
