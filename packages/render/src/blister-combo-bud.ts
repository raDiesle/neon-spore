import { blisterStrokes, blisterSwipeShare, blisterWayOf } from "@neon-spore/sim";
import type { BlisterFrame } from "./blister-bodies.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

const TAU = Math.PI * 2;

/** The petals round the open flower, the top one at twelve. */
const PETALS = 6;

/**
 * BUD, one of COMBO's two bodies (`blister-combo.ts`): a flower up out of
 * the pore with the press as its heart, six petals open round it. The press
 * shuts it — the petals fold up over the heart into a closed bud — and a
 * green stalk comes out of its side and runs along the pull's channel to
 * the knob, as far as the thumb has drawn it, a leaf on it half way. What the press did is on the body, on both screens.
 */
export function drawBudBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  ctx.save();
  stem(ctx, x, y, f.poreY, r);
  if (blisterStrokes(b.c)) {
    stalk(ctx, b, x, y, r);
    shut(ctx, x, y, r);
  } else {
    open(ctx, x, y, r, b.time);
  }
  ctx.restore();
}

/** The stem the flower stands on, down into the pore. */
function stem(ctx: CanvasRenderingContext2D, x: number, y: number, poreY: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, poreY + r * 0.3);
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.42;
  ctx.strokeStyle = rgba(PALETTE.organRim, 0.8);
  ctx.stroke();
  ctx.lineWidth = r * 0.3;
  ctx.strokeStyle = PALETTE.vein;
  ctx.stroke();
}

/** Open: six petals round the heart, a little breathing, and a dark heart the halo sits in. */
function open(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number): void {
  const breathe = 1 + Math.sin(time * 2.4) * 0.04;
  for (let i = 0; i < PETALS; i++) {
    const a = -Math.PI / 2 + (i * TAU) / PETALS + Math.PI / PETALS;
    const len = r * 1.15 * breathe;
    const p = new Path2D();
    p.ellipse(x + Math.cos(a) * len, y + Math.sin(a) * len, r * 0.8, r * 0.52, a, 0, TAU);
    flesh(ctx, p, x + Math.cos(a) * len, y + Math.sin(a) * len, r * 0.8, r);
  }
  ctx.beginPath();
  ctx.arc(x, y, r * 1.02, 0, TAU);
  ctx.fillStyle = rgba(PALETTE.background, 0.6);
  ctx.fill();
  ctx.lineWidth = r * 0.12;
  ctx.strokeStyle = rgba(PALETTE.pod, 0.7);
  ctx.stroke();
}

/** Shut: three petals folded up into a bud, their tips meeting over the heart. */
function shut(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  for (const side of [-1, 1, 0] as const) {
    const p = new Path2D();
    const w = side === 0 ? r * 0.75 : r * 0.9;
    const cx = x + side * r * 0.42;
    p.moveTo(cx, y + r * 0.95);
    p.bezierCurveTo(
      cx - w * 1.3,
      y + r * 0.5,
      cx - w * 0.9,
      y - r * 1.2,
      x + side * r * 0.1,
      y - r * 1.75,
    );
    p.bezierCurveTo(cx + w * 0.9, y - r * 1.2, cx + w * 1.3, y + r * 0.5, cx, y + r * 0.95);
    p.closePath();
    flesh(ctx, p, cx, y - r * 0.4, r * 1.3, r);
  }
}

/** The stalk the shut bud puts out, from its side to the knob, and a leaf on it. */
function stalk(ctx: CanvasRenderingContext2D, b: Body, x: number, y: number, r: number): void {
  const way = WAY[blisterWayOf(b.c)];
  const along = blisterSwipeShare(b.world, b.c);
  const reach = ((b.world.cfg.blisterSwipeMilli * b.l.tile) / 1000) * along;
  const fx = x + way.dx * r * 0.7;
  const fy = y + way.dy * r * 0.7;
  const tx = b.x + way.dx * reach;
  const ty = b.y + way.dy * reach;
  if (Math.hypot(tx - fx, ty - fy) < r * 0.3 || (tx - fx) * way.dx + (ty - fy) * way.dy < 0) return;
  // A sag across the way, so it reads as a stalk drawn out and not a bar.
  const sag = Math.sin(b.time * 3) * r * 0.08 + r * 0.25;
  const mx = (fx + tx) / 2 - way.dy * sag;
  const my = (fy + ty) / 2 + way.dx * sag;
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.quadraticCurveTo(mx, my, tx, ty);
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.38;
  ctx.strokeStyle = rgba(PALETTE.organRim, 0.85);
  ctx.stroke();
  ctx.lineWidth = r * 0.24;
  ctx.strokeStyle = PALETTE.organ;
  ctx.stroke();
  const leaf = new Path2D();
  const lx = (fx + 2 * mx + tx) / 4;
  const ly = (fy + 2 * my + ty) / 4;
  leaf.ellipse(
    lx - way.dy * r * 0.35,
    ly + way.dx * r * 0.35,
    r * 0.42,
    r * 0.2,
    Math.atan2(way.dy, way.dx) + 0.6,
    0,
    TAU,
  );
  ctx.fillStyle = PALETTE.organ;
  ctx.fill(leaf);
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.strokeStyle = rgba(PALETTE.organRim, 0.9);
  ctx.stroke(leaf);
}

/** A petal's fill: lit violet in the middle going to the field's dark, and a rim. */
function flesh(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  x: number,
  y: number,
  reach: number,
  r: number,
): void {
  const g = ctx.createRadialGradient(x, y - reach * 0.3, reach * 0.05, x, y, reach);
  g.addColorStop(0, rgba(PALETTE.hull, 0.95));
  g.addColorStop(1, rgba(PALETTE.hull, 0.35));
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.lineWidth = Math.max(1.5, r * 0.09);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.stroke(path);
}

const WAY = {
  down: { dx: 0, dy: 1 },
  up: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  left: { dx: -1, dy: 0 },
} as const;
