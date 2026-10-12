import type { Point } from "@neon-spore/content";
import { ghostFront, passed } from "./goo-beat.js";
import { bodyPath, type GooBody } from "./goo-body.js";
import { entering } from "./goo-enter.js";
import type { GooStyle } from "./goo-style.js";

/**
 * **What calls the thumb to a drop no hand has yet**: WHITE RINGS · FLASH,
 * the owner's pick of the PULL LAB's four CALL looks, 12 October 2026 —
 * asked for as *more yellow colour surrounding maybe coupled with white
 * flashing combined like the path dots*. Under the drop, a breathing halo in
 * its own yellow and white-hot rings out of it (`call`); over it, its rim lit
 * white as the dots' run sets off (`callOver`), so the drop is the first
 * light of the run, then the dots one after another, then the place. `enter`
 * is the seconds since the drop came in (`goo-enter.ts`).
 */

const WHITE = "#FFFFFF";
const CLEAR = "rgba(0,0,0,0)";
/** The halo's reach in drop radii, and how strong it is at the bottom and top of a breath. */
const REACH = 2.5;
const LOW = 0.26;
const HIGH = 0.5;
/** How thick a ring is as it leaves the drop, in drop radii. */
const RING = 0.08;

/** How bright the white flash is: at once as the ghost sets off, as a dot is lit when
 * the ghost passes it — never while the path is still coming in. */
export function flashOf(time: number, enter: number): number {
  return entering(enter) ? 0 : passed(ghostFront(time), 0);
}

/** Put a thumb here: the yellow halo, a white one on the flash, and two rings at a time. */
export function call(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  time: number,
  enter: number,
): void {
  const breathe = 0.5 + 0.5 * Math.sin(time * 4);
  const flash = flashOf(time, enter);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  disc(ctx, at, r * 0.7, r * REACH, style.neon, LOW + (HIGH - LOW) * breathe);
  if (flash > 0.01) disc(ctx, at, r * 0.8, r * 2, WHITE, 0.6 * flash);
  ctx.restore();
  ctx.save();
  for (const lag of [0, 0.5]) {
    const u = (time * 0.85 + lag) % 1;
    const p = bodyPath({ at, r: r * (1.12 + 0.9 * u), seed: 29 }, style, time);
    const w = r * RING * (1 - u) + 0.4;
    // A white core inside a neon glow.
    ctx.strokeStyle = style.neon;
    ctx.globalAlpha = 0.5 * (1 - u);
    ctx.lineWidth = w * 2.6;
    ctx.stroke(p);
    ctx.strokeStyle = WHITE;
    ctx.globalAlpha = 1 - u;
    ctx.lineWidth = w;
    ctx.stroke(p);
  }
  ctx.restore();
}

/** Over the drop: its rim lit white by the flash, as a dot is lit when the ghost passes. */
export function callOver(
  ctx: CanvasRenderingContext2D,
  body: GooBody,
  style: GooStyle,
  time: number,
  enter: number,
): void {
  const flash = flashOf(time, enter);
  if (flash < 0.01) return;
  const rim = bodyPath(body, style, time);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = WHITE;
  ctx.globalAlpha = 0.45 * flash;
  ctx.lineWidth = body.r * 0.36;
  ctx.stroke(rim);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.9 * flash;
  ctx.lineWidth = body.r * 0.1;
  ctx.stroke(rim);
  ctx.restore();
}

function disc(
  ctx: CanvasRenderingContext2D,
  at: Point,
  inner: number,
  outer: number,
  colour: string,
  alpha: number,
): void {
  const g = ctx.createRadialGradient(at.x, at.y, inner, at.x, at.y, outer);
  g.addColorStop(0, colour);
  g.addColorStop(1, CLEAR);
  ctx.fillStyle = g;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(at.x, at.y, outer, 0, Math.PI * 2);
  ctx.fill();
}
