import { type Glance, type GlanceFrame, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { type GlanceSize, glanceOf, sway } from "./glance-styles.js";

/**
 * **THE ANTIPHON's mantle glances** — the owner, 9 and 10 October 2026:
 * *body parts of living things turn ... or if mechanical the full boss
 * shape*, one entry per boss.
 *
 * The organ and the candidates on the rail are read by their outline and
 * their turn, which is the whole of this fight, and the owner has already
 * taken depth off them once (5 October 2026), so they do not turn; a pit is
 * a fifth of a tile and turned on its own would not be seen. What turns is
 * the mantle, the body across the top, **about its middle** (`glance.ts`, a
 * `hold` of 0): one end comes forward and swells, the other goes back,
 * narrows and darkens. The pits are drawn after it at their own spots
 * (`antiphon-depth.ts`: *nothing it says moves*), and the far end at its
 * narrowest still reaches past the last of them. A bolt is stopped on the
 * underside the turn has drawn (`antiphon-stop.ts` asks `antiphonMantleFrame`),
 * so one up an outer column the far end has drawn back from goes on by. Once
 * it is still it stops turning, as its light does, because that is what still
 * means.
 *
/** How far the mantle's ends open and close, in its half-width, and how far it rolls. */
export const ANTIPHON_GLANCE_SIZE: GlanceSize = { reach: 0.14, cock: 0.03, tilt: 0.2 };

/**
 * **SWAY** (`glance-styles.ts`), at `ANTIPHON_GLANCE_SIZE`: one end toward
 * the field and then the other and back on one slow sine. VERSUS
 * `antiphon:glance` offered it beside LOOK and COCK, and the owner took it
 * on 14 October 2026, seeing no difference between the three.
 */
export const ANTIPHON_GLANCE: Glance = glanceOf(sway, ANTIPHON_GLANCE_SIZE);

/** How dark the far end goes, reached at the widest turn. */
const FAR_DARK = 0.5;

/**
 * The mantle as `draw` draws it about `at` (`r` its half-width), turned as
 * `ANTIPHON_GLANCE` says at `time` seconds unless it is `still`. `draw`
 * answers with its outline, which the far end's dark is laid over. Still, it
 * is drawn once and exactly as before.
 */
export function drawAntiphonGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  time: number,
  still: boolean,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = antiphonMantleFrame(at, time, still);
  if (f === null) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: ANTIPHON_GLANCE_SIZE.reach, reach: 1.2 };
  drawGlancedLayer(ctx, f, shade, (g) => [draw(g)]);
}

/**
 * The mantle's turn about `at` at `time`, or `null` while it is drawn
 * unturned — still, or `ANTIPHON_GLANCE` still. The picture and the stopper
 * both ask here, so a bolt meets the underside that is drawn.
 */
export function antiphonMantleFrame(
  at: { x: number; y: number; r: number },
  time: number,
  still: boolean,
): GlanceFrame | null {
  const f = glanceFrame(ANTIPHON_GLANCE, time, { ...at, hold: 0 });
  return still || glanceStill(f) ? null : f;
}
