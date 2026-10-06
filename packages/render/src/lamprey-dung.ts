import { blobPoints } from "@neon-spore/content";
import { type Creature, lampreyBoss, spanOf, type World } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { rockRadius } from "./rock-size.js";
import { splinePath } from "./spline.js";

/**
 * **THE LAMPREY's dung** (the owner, 6 October 2026: *it could poop, which
 * then has to be turned with the shield*): a rock to the simulation — a plain
 * `meteor` the shield answers like any other (`sim/lamprey-roam.ts`) — and a
 * brown heap to the eye, laid over the stone `drawMeteor` put down, so it
 * reads as the eel's and as a thing to shield rather than to shoot.
 *
 * **The shape is two BULB · CLOVERs stacked**, a draft the shape sheet had
 * free (`tools/shape-sheet/src/drafts/offered.ts`): a wide one under a
 * smaller one, their four lobes wobbling on the clock, with stink rising off
 * the top. Drawn the same on both screens.
 */

/** BULB · CLOVER's numbers, off the shape sheet. */
const CLOVER = { lobes: 4, depth: 0.34, wobble: 0.045, seed: 1 } as const;

/** Whether `c` is dung the eel let go of and still falling. */
export function isLampreyDung(world: World, c: Creature): boolean {
  return lampreyBoss(world)?.dung.includes(c.id) === true;
}

/** The heap over a dung rock at `x`, `y`. */
export function drawLampreyDung(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
): void {
  const r = rockRadius(l, spanOf(c)) * 1.1;
  const heap = (cx: number, cy: number, rx: number, ry: number, t: number) =>
    splinePath(
      blobPoints(cx, cy, rx, ry, CLOVER.lobes, CLOVER.depth, CLOVER.wobble, t, CLOVER.seed),
      true,
    );
  const under = heap(x, y + r * 0.2, r, r * 0.68, time * 1.3);
  const over = heap(x + r * 0.08, y - r * 0.38, r * 0.62, r * 0.46, time * 1.3 + 1.7);
  ctx.save();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.lampreyDungDark;
  for (const part of [under, over]) {
    ctx.fillStyle = PALETTE.lampreyDung;
    ctx.fill(part);
    ctx.stroke(part);
  }
  // A shine on the top, from the key light's side.
  ctx.fillStyle = rgba("#FFFFFF", 0.18);
  ctx.beginPath();
  ctx.ellipse(x - r * 0.12, y - r * 0.5, r * 0.18, r * 0.09, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // The stink: three wavy lines rising off it, on the clock.
  ctx.lineWidth = STROKE.inner;
  ctx.lineCap = "round";
  for (let i = -1; i <= 1; i++) {
    const rise = (time * 0.6 + i * 0.33 + 1) % 1;
    ctx.strokeStyle = rgba(PALETTE.lampreyDung, 0.8 * (1 - rise));
    ctx.beginPath();
    const bx = x + i * r * 0.35;
    const by = y - r * (0.9 + rise * 0.7);
    for (let k = 0; k <= 6; k++) {
      const f = k / 6;
      const px = bx + Math.sin(f * Math.PI * 2 + time * 3 + i) * r * 0.08;
      const py = by - f * r * 0.45;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}
