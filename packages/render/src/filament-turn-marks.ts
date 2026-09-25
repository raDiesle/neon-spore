import { circleSubpath } from "@neon-spore/content";
import { type FilamentState, filamentGap, filamentTileAt, type SimConfig } from "@neon-spore/sim";
import { filamentPoint, type Point } from "./filament-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The small marks round THE FILAMENT's thumbs**: the arrows that march the
 * way a thumb goes next, the red bar on the last tile the pilot may light,
 * and the window's pips. Cut off `filament-turn-draw.ts`, which says what
 * each is for and when it is drawn, at its limit.
 */

/** The arrows' march, in tiles a second. */
const ARROW_RATE = 1.6;

/** Chevrons marching from tile `from` to tile `to`, one between each pair of tiles. */
export function drawFilamentArrows(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  from: number,
  to: number,
  hex: string,
  time: number,
): void {
  const size = l.tile * 0.13;
  ctx.save();
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = from; i < to; i++) {
    const a = filamentTileAt(s, i);
    const b = filamentTileAt(s, i + 1);
    if (a === null || b === null) break;
    const pa = filamentPoint(l, a);
    const pb = filamentPoint(l, b);
    const march = (((time * ARROW_RATE - (i - from)) % 1) + 1) % 1;
    ctx.globalAlpha = 0.25 + 0.75 * (1 - march);
    chevron(ctx, { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 }, pb.x - pa.x, pb.y - pa.y, size);
  }
  ctx.restore();
}

function chevron(
  ctx: CanvasRenderingContext2D,
  at: Point,
  dx: number,
  dy: number,
  size: number,
): void {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  ctx.beginPath();
  ctx.moveTo(at.x - ux * size - uy * size, at.y - uy * size + ux * size);
  ctx.lineTo(at.x + ux * size * 0.6, at.y + uy * size * 0.6);
  ctx.lineTo(at.x - ux * size + uy * size, at.y - uy * size - ux * size);
  ctx.stroke();
}

/** The red bar across the pilot's path on the last tile he may light before the line goes dark. */
export function drawFilamentMax(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: FilamentState,
): void {
  const i = s.tail + cfg.filamentGapTiles;
  const tile = filamentTileAt(s, i);
  const prev = filamentTileAt(s, i - 1);
  if (tile === null || prev === null || i <= s.head) return;
  const at = filamentPoint(l, tile);
  const back = filamentPoint(l, prev);
  const len = Math.hypot(at.x - back.x, at.y - back.y) || 1;
  const nx = -(at.y - back.y) / len;
  const ny = (at.x - back.x) / len;
  const half = l.tile * 0.3;
  const p = new Path2D();
  p.moveTo(at.x - nx * half, at.y - ny * half);
  p.lineTo(at.x + nx * half, at.y + ny * half);
  strokeGlow(ctx, p, PALETTE.red, STROKE.outline * 1.4, 1);
}

/** The window as pips under a ring: one lit per tile between the thumbs, red when full. */
export function drawFilamentPips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: FilamentState,
  c: Circle,
): void {
  const n = cfg.filamentGapTiles;
  const gap = filamentGap(s);
  const r = l.tile * 0.05;
  const step = r * 3;
  const y = c.y + c.r * 1.75;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x = c.x + (i - (n - 1) / 2) * step;
    ctx.fillStyle = i < gap ? (gap >= n ? PALETTE.red : PALETTE.good) : rgba(PALETTE.dim, 0.6);
    ctx.fill(new Path2D(circleSubpath(x, y, r)));
  }
  ctx.restore();
}
