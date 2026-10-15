import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

const TAU = Math.PI * 2;

/**
 * How much bigger than the blister's radius the body is drawn, so it stands
 * well clear of the yellow press in its middle (`press-drop.ts`, drawn at 0.7
 * of the radius, its call's rings out to about 1.3) — the owner, 15 October
 * 2026: *make sure the graphics are visible to be bigger than the tap (yellow)
 * button*.
 */
export const GROW = 1.5;

/** Discs along each arm: enough that they run together into one limb. */
const STEPS = 22;

/**
 * CRADLE: the creature is under the field and only its two arms come up — out
 * of the pore, round either side of the press and curled over the top, holding
 * the button up like a pearl. The tips stop short of each other, and the pip
 * at twelve sits in the gap. Swaying a little, and lined with suckers on the
 * side that holds.
 */
export function drawCradleBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r * GROW;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  ctx.save();
  for (const side of [-1, 1] as const) arm(ctx, x, y, f.poreY, r, side, b.time);
  ctx.restore();
}

/** A point on a cubic. */
function cubic(a: number, b: number, c: number, d: number, t: number): number {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

function arm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  poreY: number,
  r: number,
  side: number,
  time: number,
): void {
  const sway = Math.sin(time * 2.2 + side) * r * 0.08;
  const px = [
    x + side * r * 0.3,
    x + side * r * 1.95,
    x + side * r * 1.35 + sway,
    x + side * r * 0.42,
  ];
  const py = [poreY + r * 0.3, y + r * 0.2, y - r * 1.75, y - r * 1.4 + sway];
  const pts: { x: number; y: number; w: number }[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    pts.push({
      x: cubic(px[0] ?? 0, px[1] ?? 0, px[2] ?? 0, px[3] ?? 0, t),
      y: cubic(py[0] ?? 0, py[1] ?? 0, py[2] ?? 0, py[3] ?? 0, t),
      w: r * (0.36 - 0.24 * t),
    });
  }
  // Rim first, a little wider, then the flesh over it: only the limb's outside
  // edge keeps a line, and the discs inside it run together.
  const rim = Math.max(1.2, r * 0.08);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.85);
  for (const p of pts) disc(ctx, p.x, p.y, p.w + rim);
  for (const p of pts) {
    const g = ctx.createRadialGradient(p.x - p.w * 0.3, p.y - p.w * 0.3, 0, p.x, p.y, p.w);
    g.addColorStop(0, rgba(PALETTE.hull, 0.95));
    g.addColorStop(1, rgba(PALETTE.hull, 0.6));
    ctx.fillStyle = g;
    disc(ctx, p.x, p.y, p.w);
  }
  // Suckers on the inner side, facing the button.
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.75);
  for (let i = 3; i < STEPS - 1; i += 3) {
    const p = pts[i];
    if (!p) continue;
    const toward = Math.atan2(y - p.y, x - p.x);
    disc(ctx, p.x + Math.cos(toward) * p.w * 0.55, p.y + Math.sin(toward) * p.w * 0.55, p.w * 0.22);
  }
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}
