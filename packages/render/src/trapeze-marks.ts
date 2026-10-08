import type { SimConfig, TrapezeSide } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { trapezeOnArc } from "./trapeze-shape.js";

/**
 * **THE TRAPEZE's two zones**: the left and the right half of the field under
 * the swing, where a finger swipes toward the middle to push it. The owner,
 * 7 October 2026: *it should be made clear visually in which area what has to
 * be done and when.*
 *
 * **Where**: each zone is its half of the field from the swing's lowest
 * point down to a row above the hull, so a thumb never lands on the cannon.
 * **Whose**: a badge in each, `P1` or `P2`, the seat that pushes there — a
 * call level changes it as the swing heads that way. **When**: a zone is dim
 * while the swing is anywhere else, and lights the moment the swing comes
 * back over it, with a chevron pointing down and in, toward the middle,
 * which is the swipe. On the screen of the seat whose zone it is not, a lit
 * zone is faint: the partner sees it and can say *now*.
 *
 * `trapezeZone` is the one placement the drawing and the thumb share
 * (`trapeze-grip.ts`).
 */

/** How much of a zone shows on the screen of the seat that does not push there. */
const OTHER = 0.35;
/** Rows of the field the zones leave free above the hull, for the cannon. */
const FREE_ROWS = 1.2;

export interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The zone on `side`, in canvas pixels. */
export function trapezeZone(l: Layout, cfg: SimConfig, side: TrapezeSide): Zone {
  const top = trapezeOnArc(l, cfg, 0).y;
  const mid = trapezeOnArc(l, cfg, 0).x;
  const bottom = l.hullY - FREE_ROWS * l.tile;
  const left = side < 0 ? l.gridLeft : mid;
  const w = side < 0 ? mid - l.gridLeft : l.gridLeft + l.cols * l.tile - mid;
  return { x: left, y: top, w, h: Math.max(l.tile, bottom - top) };
}

/** Whether (x, y) is inside `z`. */
export function inZone(z: Zone, x: number, y: number): boolean {
  return x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
}

/**
 * One zone: its frame, its seat's badge, and — while `open` — its light and
 * the chevron pointing in. `mine` is whether this screen's seat pushes here;
 * `pulse` 0..1 breathes the light.
 */
export function drawTrapezeZone(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  z: Zone,
  side: TrapezeSide,
  seat: 1 | 2,
  open: boolean,
  mine: boolean,
  pulse: number,
): void {
  const k = mine ? 1 : OTHER;
  const r = 0.3 * l.tile;
  const frame = new Path2D();
  frame.roundRect(z.x + 0.1 * l.tile, z.y, z.w - 0.2 * l.tile, z.h, r);
  if (open) {
    ctx.fillStyle = rgba(PALETTE.hullRim, (0.08 + 0.08 * pulse) * k);
    ctx.fill(frame);
    strokeGlow(ctx, frame, PALETTE.hullRim, STROKE.inner, k, 1);
    drawChevrons(ctx, l, z, side, k, pulse);
  } else {
    ctx.lineWidth = STROKE.inner;
    ctx.setLineDash([0.18 * l.tile, 0.18 * l.tile]);
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.22 * k);
    ctx.stroke(frame);
    ctx.setLineDash([]);
  }
  drawBadge(ctx, l, z, side, seat, open ? k : 0.45 * k);
}

/** Three chevrons down and in toward the middle, stepping with `pulse`. */
function drawChevrons(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  z: Zone,
  side: TrapezeSide,
  k: number,
  pulse: number,
): void {
  const way = -side;
  const cx = z.x + z.w / 2;
  const cy = z.y + z.h / 2;
  const size = 0.42 * l.tile;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const t = (i - 1) * 0.75 * l.tile + pulse * 0.25 * l.tile;
    const x = cx + way * t;
    const y = cy + 0.4 * t;
    const head = new Path2D();
    head.moveTo(x - way * size, y - size);
    head.lineTo(x, y);
    head.lineTo(x - way * size * 0.2, y + size);
    strokeGlow(ctx, head, PALETTE.hullRim, STROKE.outline, k * (0.45 + 0.25 * i), 1);
  }
}

/** The badge in the zone's top outer corner: the seat that pushes here. */
function drawBadge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  z: Zone,
  side: TrapezeSide,
  seat: 1 | 2,
  k: number,
): void {
  const x = side < 0 ? z.x + 0.75 * l.tile : z.x + z.w - 0.75 * l.tile;
  const y = z.y + 0.6 * l.tile;
  ctx.font = `700 ${Math.round(0.42 * l.tile)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(PALETTE.hullRim, k);
  ctx.fillText(`P${seat}`, x, y);
}
