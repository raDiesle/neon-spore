import { mazeCanvasAngle } from "./maze-walls.js";
import { PALETTE } from "./palette.js";

/**
 * **A way into THE MAZE with a light on behind it** — the owner, 5 October
 * 2026: *always shine some yellow light out of entrances*. Every gap that is
 * not on the cannon's column leans a short wedge of `lamp` straight out from
 * the drum, so a pair sees the rooms they could open before one of them is
 * open. The one on the column is `maze-door.ts`'s, and blue.
 */

type Point = { x: number; y: number };

/** How far the light leans out past the rim, as a share of the drum's radius. */
const GLOW_OUT = 0.2;
/** How much wider than the gap the light is where it fades. */
const GLOW_SPREAD = 2.2;
/** How bright it is at the gap, at the top of its breath. */
const GLOW = 0.85;

/**
 * The warm light leaning straight out of a gap that is not on the column: a
 * wedge from the two cut ends out along the drum's radius, widening and fading
 * as it goes. `at` is the way in's angle, spin included, and `gap` half the
 * angle its cut takes up at the rim, both in thousandths of a degree.
 */
export function drawLampOut(
  ctx: CanvasRenderingContext2D,
  d: { cx: number; cy: number; r: number },
  at: number,
  gap: number,
  a: Point,
  b: Point,
  pulse: number,
): void {
  const out = d.r * (1 + GLOW_OUT);
  const half = gap * GLOW_SPREAD;
  const on = (side: 1 | -1): Point => {
    const p = mazeCanvasAngle(at + side * half);
    return { x: d.cx + out * Math.cos(p), y: d.cy + out * Math.sin(p) };
  };
  const mid = mazeCanvasAngle(at);
  const from = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const to = { x: d.cx + out * Math.cos(mid), y: d.cy + out * Math.sin(mid) };
  const glow = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
  glow.addColorStop(0, `${PALETTE.lamp}EE`);
  glow.addColorStop(0.45, `${PALETTE.lamp}55`);
  glow.addColorStop(1, `${PALETTE.lamp}00`);
  const [c, e] = [on(1), on(-1)];
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = GLOW * (0.7 + 0.3 * pulse);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(e.x, e.y);
  ctx.lineTo(b.x, b.y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
