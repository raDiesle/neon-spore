import { blobPoints } from "@neon-spore/content";
import { halo } from "./glow.js";
import { drawFrontHead } from "./instar-head.js";
import { drawLamp, drawPlate, drawSeam, type Look, toward } from "./instar-plate.js";
import { instarFarEnd } from "./instar-shape.js";
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

export function drawFront(ctx: CanvasRenderingContext2D, l: Layout, look: Look): void {
  const { f, head, r, fade, hurt, time } = look;
  const rear = instarFarEnd(l, f);
  const neck = { x: head.x, y: head.y - r * 0.95 };
  drawEngines(ctx, rear, r, time, fade);
  const shoulder = { x: neck.x, y: neck.y + r * 0.05 };
  for (const s of [-1, 1]) {
    drawWing(
      ctx,
      look,
      { x: shoulder.x + s * r * 0.55, y: shoulder.y },
      { x: shoulder.x + s * r * 0.4, y: shoulder.y + r * 0.95 },
      { ex: { x: -s * r * 0.85, y: 0 }, ey: { x: 0, y: r * 0.85 } },
    );
  }
  for (let k = 0; k < SEGMENTS; k++) {
    const t = k / (SEGMENTS - 1);
    const c = toward(rear, neck, t);
    const rad = r * (0.2 + 0.5 * t);
    const p = splinePath(
      blobPoints(c.x, c.y, rad, rad * 0.62, 5, 0.05, 0.02, time, 40 + k, 20),
      true,
    );
    drawPlate(ctx, p, fade, 0.35 + 0.2 * t, hurt);
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
  for (const s of [-1, 1])
    halo(ctx, rear.x + s * r * 0.18, rear.y - r * 0.05, size, PALETTE.ember, 0.7 * flick * fade);
}
