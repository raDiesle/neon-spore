import type { Point, StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **THE SEAM's own blow at the hull** (`boss-strike-look.ts`): its crack does
 * not stop at the ridge. It runs on out of the bottom lobe, down through the
 * empty field to the column the pair left open, a jagged split opening in the
 * dark with the ridge's own stone at its lips, and where it meets the plating
 * it throws the grit THE SEAM throws when it is lit. Then the split closes
 * from the top down, and the chips fall.
 *
 * The zigzag is fixed per blow, off the two ends, so the crack does not
 * crawl while it is open.
 */

/** How many kinks the crack takes on its way down. */
const KINKS = 9;
/** How far a kink swings off the straight line, in tiles. */
const SWING = 0.45;
/** The crack's half-width at its widest, in tiles. */
const GAPE = 0.16;
/** Chips thrown off the plating, and how far, in tiles. */
const CHIPS = 7;
const THROW = 1.4;

function kinks(f: StrikeFrame): Point[] {
  const { from, to, tile } = f;
  const pts: Point[] = [];
  for (let i = 0; i <= KINKS; i++) {
    const t = i / KINKS;
    // Pinned at both ends: the crack leaves the lobe and meets the column.
    const off = i === 0 || i === KINKS ? 0 : Math.sin(i * 2.7 + from.x * 0.01) * SWING * tile;
    pts.push({ x: from.x + (to.x - from.x) * t + off, y: from.y + (to.y - from.y) * t });
  }
  return pts;
}

/** A point `t` of the way down the kinked line. */
function along(pts: readonly Point[], t: number): Point {
  const s = Math.max(0, Math.min(1, t)) * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(s));
  const u = s - i;
  const a = pts[i] as Point;
  const b = pts[i + 1] as Point;
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}

export function seamBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { tile } = f;
  const reach = 1 - (1 - f.reach) ** 2;
  // It closes from the top down: the healed end chases the open one.
  const healed = f.after;
  if (healed >= 1) return;
  const pts = kinks(f);
  const n = 28;
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const t = healed + ((reach - healed) * i) / n;
    const p = along(pts, t);
    // Widest in the middle of what is open, pinched to a hair at both ends.
    const u = i / n;
    const w = GAPE * tile * Math.sin(Math.PI * u) ** 0.7 * (1 - f.after * 0.6);
    left.push({ x: p.x - w, y: p.y });
    right.push({ x: p.x + w, y: p.y });
  }
  ctx.save();
  ctx.lineJoin = "miter";
  const path = new Path2D();
  for (const [i, p] of [...left, ...right.reverse()].entries()) {
    if (i === 0) path.moveTo(p.x, p.y);
    else path.lineTo(p.x, p.y);
  }
  path.closePath();
  // The split: the field's own dark showing through, with a cold glow in it.
  ctx.globalAlpha = 1;
  ctx.fillStyle = rgba(PALETTE.background, 0.95);
  ctx.fill(path);
  ctx.strokeStyle = rgba(PALETTE.rock, 0.9);
  ctx.lineWidth = tile * 0.07;
  ctx.stroke(path);
  ctx.strokeStyle = rgba(PALETTE.red, 0.55 * (1 - f.after));
  ctx.lineWidth = tile * 0.05;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const p = along(pts, healed + ((reach - healed) * i) / n);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  // The grit, once it has struck: chips of the ridge's stone off the plating.
  if (f.after > 0) {
    ctx.fillStyle = rgba(PALETTE.rock, 1 - f.after);
    for (let i = 0; i < CHIPS; i++) {
      const a = Math.PI * (1.1 + (0.8 * i) / (CHIPS - 1));
      const d = THROW * tile * f.after;
      const x = f.to.x + Math.cos(a) * d;
      // Thrown up and falling back: a short arc under the field's pull.
      const y = f.to.y + Math.sin(a) * d + 2.2 * tile * f.after * f.after;
      const r = tile * (0.09 + 0.04 * (i % 3));
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r * 0.8);
      ctx.lineTo(x - r * 0.9, y);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}
