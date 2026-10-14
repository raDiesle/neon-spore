import { flueUnitR } from "./flue-shape.js";
import { type Glance, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";
import type { Layout } from "./layout.js";

/**
 * **THE FLUE glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn*, one entry per boss.
 *
 * The flue's flesh is the part that turns: every unit yaws **about its own
 * middle** (`glance.ts`, a `hold` of 0), its level's lobe turning with it,
 * the near flank opening and the far one closing into the dark — and the
 * turn runs along the body, each unit `STAGGER` behind the one before, so
 * the flue ripples end to end like one living thing. The whole flue turned
 * about the sight was tried first: it spans the field, so its near end ran
 * off the screen. The gullet, the spore in it, the sight, the scale and the
 * glass stay where they hang, so the call and the shot keep their moment;
 * nothing a thumb or a bolt meets is on a unit.
 *
 * Shipped, it does not glance: `FLUE_GLANCE` is still, and VERSUS
 * `flue:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `FLUE_GLANCE_SIZE`, counted in a unit's radius.
 */
export const FLUE_GLANCE: Glance = { ...STILL_GLANCE };

/** How far a unit turns, in its radius, and how far it rolls. */
export const FLUE_GLANCE_SIZE: GlanceSize = { reach: 0.36, cock: 0.12, tilt: 0.35 };

/** How far behind the unit before it each unit turns, in seconds: a ripple, not a row in step. */
const STAGGER = 0.22;
/** How dark the far flank goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in unit radii: a segment is wider than tall, and its film glows past it. */
const REACH = 2.4;

/**
 * Unit `k` as `draw` draws it about its middle at the origin, turned as
 * `FLUE_GLANCE` says. `draw` answers with the outlines the far flank's dark
 * is laid over. Still, it is drawn once and exactly as before.
 */
export function drawFlueUnitGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  k: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = glanceFrame(FLUE_GLANCE, time - k * STAGGER, { x: 0, y: 0, r: flueUnitR(l), hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: FLUE_GLANCE_SIZE.reach, reach: REACH }, draw);
}
