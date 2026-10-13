import type { PulseLane } from "@neon-spore/sim";
import { drawGlanced, type Glance, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import type { GlanceSize } from "./glance-styles.js";
import { pulseLaneOutline } from "./pulse-shape.js";

/**
 * **THE PULSE's arrivals glance** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * The round's boss is its chart, and what the chart is made of is the four
 * bodies falling down the lanes (`pulse-body.ts`). Three of them are alive —
 * the slick, the bulb and the pod — and those are what turn, each as it
 * falls, about its centre (`glance.ts`, a `hold` of 0), so it still meets its
 * socket where the socket is cut. The meteor does not: a rock already turns
 * on its own spin (`drawRockBody`). A veiled arrival does not either — its
 * silhouette is the thing that cycles, and a second motion on it would be a
 * second thing to read.
 *
 * Each arrival runs the round from its own place in it, the note's index, so
 * a lane of them does not turn as one.
 *
 * Shipped, they do not glance: `PULSE_GLANCE` is still, and VERSUS
 * `pulse:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `PULSE_GLANCE_SIZE`, in the arrival's own radius.
 */
export const PULSE_GLANCE: Glance = { ...STILL_GLANCE };

/** How far an arrival's sides open and close, in its radius, and how far it rolls. */
export const PULSE_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.14, tilt: 0.5 };

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** Seconds apart in the round one note is from the next. */
const STAGGER = 0.9;

/** Whether a lane's body is one that turns. */
const turns = (lane: PulseLane): boolean => lane !== "meteor";

/**
 * An arrival as `draw` draws it about `x`,`y` (radius `r`), turned as
 * `PULSE_GLANCE` says at `time` from note `seed`'s place in the round. Still,
 * or a meteor, it is drawn once and exactly as before.
 */
export function drawPulseGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number; lane: PulseLane; seed: number },
  time: number,
  draw: () => void,
): void {
  const { x, y, r } = at;
  const f = glanceFrame(PULSE_GLANCE, time + at.seed * STAGGER, { x: 0, y: 0, r: 1, hold: 0 });
  if (!turns(at.lane) || glanceStill(f)) {
    draw();
    return;
  }
  // Turned in the body's own unit frame, so the far side's dark is laid over
  // the lane's own contour (`pulseLaneOutline`, half-height 1) and not over a
  // circle that reaches past a pod's lobes; the body itself is drawn back in
  // the frame it was asked for.
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(r, r);
  drawGlanced(ctx, f, { dark: FAR_DARK, full: PULSE_GLANCE_SIZE.reach, reach: 2.2 }, () => {
    ctx.save();
    ctx.scale(1 / r, 1 / r);
    ctx.translate(-x, -y);
    draw();
    ctx.restore();
    return [pulseLaneOutline(at.lane)];
  });
  ctx.restore();
}
