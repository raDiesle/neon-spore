import { type Glance, glancedPoint, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import type { Layout } from "./layout.js";
import { type Point, valveReach, valveSocket, valveWheel } from "./valve-shape.js";

/** How far the face's middle swings, in the drum's half-width, and how far it rolls. */
export const VALVE_GLANCE_SIZE: GlanceSize = { reach: 0.13, cock: 0.04, tilt: 0.25 };

/**
 * **THE VALVE glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss.
 *
 * A machine, so the full shape turns: the drum, its notched rim, its face and
 * everything on it yaw together. The two points a thumb is on are **held**
 * (`glance.ts`, THE INSTAR's eyes): the wheel's hub and the socket's middle,
 * which sit either side of a point between them, so each is squeezed about
 * its own middle and neither moves — the wheel is read as a bearing about
 * that hub and the socket as a circle round it (`valve-grip.ts`). Between and
 * beyond them the face swings: the drum's near end reaches out and its far
 * end closes into the dark. The pins hang under it and do not turn, and a bolt
 * meets the rim where it is drawn (`valve-stop.ts`). Everything here is in
 * the drum's own frame, about its middle, before it lists.
 *
 * Taken off VERSUS `valve:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `VALVE_GLANCE_SIZE`, counted in the drum's
 * half-width.
 */
export const VALVE_GLANCE: Glance = glanceOf(cock, VALVE_GLANCE_SIZE);

/** How dark the far end goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in half-widths: the near end grows past its own. */
const REACH = 1.6;

/** The drum's turn at `time`, held at the wheel's hub and the socket. */
function frameAt(l: Layout, time: number) {
  const wheel = valveWheel(l).at.x;
  const socket = valveSocket(l).at.x;
  const r = valveReach(l).rx;
  const at = { x: (wheel + socket) / 2, y: 0, r, hold: Math.abs(socket - wheel) / 2 / r };
  return glanceFrame(VALVE_GLANCE, time, at);
}

/**
 * The drum's face as `draw` draws it, turned as `VALVE_GLANCE` says, in the
 * drum's own frame. `draw` answers with the outlines the far end's dark is
 * laid over. Still, it is drawn once and exactly as before.
 */
export function drawValveGlanced(
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
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: VALVE_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** Where the drum's turn carries a point `p` of it, in its own frame — a bolt's stop. */
export function valveGlancedPoint(l: Layout, time: number, p: Point): Point {
  const f = frameAt(l, time);
  return glanceStill(f) ? p : glancedPoint(f, p);
}
