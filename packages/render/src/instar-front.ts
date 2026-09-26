import { blobPoints, FRONT, view } from "@neon-spore/content";
import { halo } from "./glow.js";
import { drawFrontHead } from "./instar-head.js";
import { drawScales } from "./instar-hide.js";
import { instarFarEnd } from "./instar-place.js";
import { drawLamp, drawPlate, drawSeam, faded, type Look, toward } from "./instar-plate.js";
import { drawWing } from "./instar-wings.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE INSTAR face-on**: a living ship coming at the screen. The body runs
 * back and up behind the head into the dark — plated segments, each smaller
 * than the one before it, seamed and lit with gold lamps, two engines burning
 * at the far end — and the wings spread wide off the shoulders behind the
 * head. Then the head (`instar-head.ts`).
 *
 * Drawn back to front, so the far end of the body is under everything.
 */

/** Segments between the engines and the back of the head. */
const SEGMENTS = 5;

/**
 * Each segment's own idle wobble on `Form.angle`, same reasoning as the
 * jaw's and brow's `JAW_WOBBLE`/`BROW_WOBBLE` (`instar-head.ts`,
 * `docs/style-guide.md`'s "Depth on a body that already ships"): a
 * segment's `Form` never sets an `angle` either, so it has always shaded at
 * a bare `0`. One wobble, phase-offset per segment the same way the lamps'
 * pulse already is (`time * 2.4 - k * 0.8`), so the five plates don't turn
 * in step.
 */
const SEGMENT_WOBBLE = 0.05;
const SEGMENT_WOBBLE_PERIOD = 5.0;

/** How far off the eye is for the wings, in head radii: near enough that the tips swept back go small. */
const WING_LENS = 10;

export function drawFront(ctx: CanvasRenderingContext2D, l: Layout, look: Look): void {
  const { f, head, r, fade, hurt, time } = look;
  const rear = instarFarEnd(l, f);
  const neck = { x: head.x, y: head.y - r * 0.95 };
  drawEngines(ctx, rear, r, time, fade);
  const shoulder = { x: neck.x, y: neck.y + r * 0.05 };
  const w = view(FRONT, 0, r * WING_LENS);
  for (const s of [-1, 1] as const)
    drawWing(ctx, look, shoulder, w, { x: 0, y: 0, z: s * r * 0.55 }, s);
  for (let k = 0; k < SEGMENTS; k++) {
    const t = k / (SEGMENTS - 1);
    const c = toward(rear, neck, t);
    const rad = r * (0.2 + 0.5 * t);
    const p = splinePath(
      blobPoints(c.x, c.y, rad, rad * 0.62, 5, 0.05, 0.02, time, 40 + k, 20),
      true,
    );
    const wobble =
      SEGMENT_WOBBLE * Math.sin((time * (Math.PI * 2)) / SEGMENT_WOBBLE_PERIOD - k * 0.8);
    const form = { x: c.x, y: c.y, r: rad, ry: rad * 0.62, angle: wobble };
    drawPlate(ctx, p, fade, 0.35 + 0.2 * t, hurt, form);
    drawScales(ctx, p, form, rad * 0.24, fade);
    const y = c.y + rad * 0.15;
    drawSeam(
      ctx,
      { x: c.x - rad * 0.7, y },
      { x: c.x, y: y + rad * 0.3 },
      { x: c.x + rad * 0.7, y },
      fade,
      0.4,
    );
    const pulse = 0.6 + 0.4 * Math.sin(time * 2.4 - k * 0.8);
    for (const s of [-1, 1])
      drawLamp(ctx, { x: c.x + s * rad * 0.62, y: c.y }, rad * 0.06, fade, pulse);
  }
  drawFrontHead(ctx, look);
}

/** The two engines at the far end: a steady burn, flickering. */
function drawEngines(
  ctx: CanvasRenderingContext2D,
  rear: { x: number; y: number },
  r: number,
  time: number,
  fade: number,
): void {
  const flick = 0.75 + 0.25 * Math.sin(time * 21);
  const size = Math.max(4, Math.round((r * 0.32) / 4) * 4);
  for (const s of [-1, 1]) {
    const x = rear.x + s * r * 0.18;
    const y = rear.y - r * 0.05;
    halo(ctx, x, y, size, PALETTE.ember, 0.7 * flick * fade);
    // The nozzle: a ring of hide round the burn, and its white-hot core.
    ctx.save();
    ctx.strokeStyle = faded(PALETTE.rockDark, fade);
    ctx.lineWidth = Math.max(1, r * 0.035);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.09, r * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = faded(PALETTE.emberRim, fade, 0.8 * flick);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.045, r * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
