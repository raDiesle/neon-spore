import { FRONT, view } from "@neon-spore/content";
import { halo } from "./glow.js";
import { drawFrontBody } from "./instar-front-body.js";
import { drawFrontHead } from "./instar-head.js";
import { instarFarEnd } from "./instar-place.js";
import { faded, type Look } from "./instar-plate.js";
import { drawWing } from "./instar-wings.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE INSTAR face-on**: a living ship coming at the screen. The body runs
 * back and up behind the head into the dark — a lit tube of the rig going
 * into depth, seamed and lit with gold lamps (`instar-front-body.ts`), two
 * engines burning at the far end — and the wings spread wide off the
 * shoulders behind the head. Then the head (`instar-head.ts`).
 *
 * Drawn back to front, so the far end of the body is under everything.
 */

/** How far off the eye is for the wings, in head radii: near enough that the tips swept back go small. */
const WING_LENS = 10;

export function drawFront(ctx: CanvasRenderingContext2D, l: Layout, look: Look): void {
  const { f, head, r, fade, time } = look;
  const rear = instarFarEnd(l, f);
  const neck = { x: head.x, y: head.y - r * 0.95 };
  drawEngines(ctx, rear, r, time, fade);
  const shoulder = { x: neck.x, y: neck.y + r * 0.05 };
  const w = view(FRONT, 0, r * WING_LENS);
  for (const s of [-1, 1] as const)
    drawWing(ctx, look, shoulder, w, { x: 0, y: 0, z: s * r * 0.55 }, s);
  drawFrontBody(ctx, look, neck, rear);
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
