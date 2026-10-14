import {
  type Glance,
  glancedPoint,
  glanceFrame,
  glanceSqueeze,
  glanceStill,
  STILL_GLANCE,
} from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";
import type { Layout } from "./layout.js";
import { oculusRadius, type Point } from "./oculus-shape.js";

/**
 * **THE OCULUS glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss; and §11.44's own line, *the eye looks to one side, the far leaf
 * foreshortened and dark*.
 *
 * A machine, so the full lens turns: the rim, the glass, the leaves across
 * it, the socket and the core yaw together **about the lens's middle**
 * (`glance.ts`, a `hold` of 0). The middle line is what splits the lens into
 * the two seats' halves (`oculus-grip.ts`), so it stays where it is; the near
 * half opens and the far half closes into the dark. The levers are what a
 * thumb turns and are drawn outside the turn, as are the glare and the sight,
 * which aim at the hull below and leave from where the turn carries the core
 * (`oculusGlancedPoint`). A bolt meets each half of the rim as far out as it
 * is drawn (`oculusGlanceSqueeze`, `oculus-stop.ts`).
 *
 * Shipped, it does not glance: `OCULUS_GLANCE` is still, and VERSUS
 * `oculus:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `OCULUS_GLANCE_SIZE`, counted in the rim's radius.
 */
export const OCULUS_GLANCE: Glance = { ...STILL_GLANCE };

/** How far the lens turns, in its rim's radius, and how far it rolls. */
export const OCULUS_GLANCE_SIZE: GlanceSize = { reach: 0.2, cock: 0.05, tilt: 0.25 };

/** How dark the far half goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in rim radii: the pins stand proud of the rim, and the near half grows. */
const REACH = 1.6;

/** The lens's turn at `time`, about its middle, in its own frame. */
const frameAt = (l: Layout, time: number) =>
  glanceFrame(OCULUS_GLANCE, time, { x: 0, y: 0, r: oculusRadius(l).rim, hold: 0 });

/**
 * The lens as `draw` draws it about its middle, turned as `OCULUS_GLANCE`
 * says. `draw` answers with the outlines the far half's dark is laid over.
 * Still, it is drawn once and exactly as before.
 */
export function drawOculusGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(l, time);
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: OCULUS_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** Where the lens's turn carries a point `p` of it, about its middle — the core a sight leaves from. */
export function oculusGlancedPoint(l: Layout, time: number, p: Point): Point {
  const f = frameAt(l, time);
  return glanceStill(f) ? p : glancedPoint(f, p);
}

/** How far out the turn draws half `side` of the lens, as a share of its own width; 1 still. */
export function oculusGlanceSqueeze(l: Layout, time: number, side: -1 | 1): number {
  const f = frameAt(l, time);
  return glanceStill(f) ? 1 : glanceSqueeze(f, side);
}
