import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The torch's own arrow on the pilot's strip** — the owner, 16 October 2026:
 * *when a torch is approaching it must be much more visible for P1, so the
 * arrow must be very visible, with animation, and bigger.*
 *
 * Every other blip is a small flat triangle whose alpha says how soon, which
 * is right for a body the pair can answer late. A torch is the one rock they
 * cannot (`comms.ts`), and the pilot's strip is the only screen that carries
 * it, so a faint grey wedge at 0.18 alpha was the whole warning for a call
 * that has to start now. This one is as wide as both its columns, never fainter
 * than `FLOOR`, lit from behind in the torch's own ember, and it moves: it
 * knocks downward into its column and throws an echo of its own outline
 * outward on the same beat, so a glance that lands anywhere near the top of
 * the screen catches it.
 *
 * It stays on the strip. Nothing points into the field (`field.ts`'s
 * `drawRadar` header, spec 5.8); the arrow's tip reaches the field's top edge
 * at the bottom of its knock and no further.
 */

/** The faintest the arrow is ever drawn, however far off the torch still is. */
const FLOOR = 0.7;
/** Knocks a second: the arrow's drop and the echo leaving it share one clock. */
const KNOCK_HZ = 1.6;
/** How far the arrow drops at the bottom of a knock, in pixels. */
const DROP = 4;

/** How tall the arrow stands above and below its blip's own `y`, so whatever
 * is hung over it (the eye) goes above its top rather than through it. */
export function torchArrowTop(l: Layout, y: number, span: number): number {
  return y - arrowHeight(l, span) * 0.6;
}

function arrowHeight(l: Layout, span: number): number {
  return Math.min(26, l.tile * span * 0.42);
}

export function drawTorchArrow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  span: number,
  alpha: number,
  time: number,
): void {
  const a = Math.max(FLOOR, alpha);
  const phase = (time * KNOCK_HZ) % 1;
  // Down fast and back up slowly: a knock rather than a float.
  const knock = phase < 0.25 ? phase / 0.25 : 1 - (phase - 0.25) / 0.75;
  const h = arrowHeight(l, span);
  const half = (l.tile * span) / 2 - 2;
  const cy = y + knock * DROP;

  ctx.save();
  halo(ctx, x, cy, half * 1.5, PALETTE.ember, (0.28 + 0.22 * knock) * a);

  // The echo: the same outline, leaving the arrow and fading as it grows.
  ctx.globalAlpha = a * (1 - phase) * 0.7;
  ctx.strokeStyle = PALETTE.emberRim;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";
  chevron(ctx, x, cy, half, h, 1 + phase * 0.7);
  ctx.stroke();

  ctx.globalAlpha = a;
  ctx.fillStyle = PALETTE.rock;
  chevron(ctx, x, cy, half, h, 1);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ember;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // A hot core down the middle, so the arrow reads as lit and not as painted.
  ctx.globalAlpha = a * (0.55 + 0.45 * knock);
  ctx.fillStyle = PALETTE.emberRim;
  chevron(ctx, x, cy + h * 0.06, half * 0.42, h * 0.5, 1);
  ctx.fill();
  ctx.restore();
}

/** A downward wedge round (x, y), its tip at the bottom: `half` wide either
 * side and `h` tall, scaled about its own middle by `k`. */
function chevron(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  half: number,
  h: number,
  k: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.4 * k);
  ctx.lineTo(x - half * k, y - h * 0.6 * k);
  ctx.lineTo(x, y - h * 0.32 * k);
  ctx.lineTo(x + half * k, y - h * 0.6 * k);
  ctx.closePath();
}
