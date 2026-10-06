import { LIGHT_HALF } from "@neon-spore/content";
import { paintFilm } from "./baton-flesh.js";
import { drawHurt } from "./boss-hurt.js";
import { flueUnitPath, flueUnitR, type Point } from "./flue-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **What THE FLUE is made of** since the owner asked for it *more alien
 * living* on 6 October 2026: each unit a ring of dark plum flesh rather than
 * a sooted rock — lit from the key, two grooves running round it where the
 * ring folds, a pore or two, a vein in the sheen's violet, a wet film high
 * on the left — and a fringe of cilia along the top of the row, stirring.
 *
 * **Dark, and in neither cannon's colour**: the owner had the flue drawn
 * flat on 5 October 2026 so the sight's red and cyan could be seen, and that
 * reason stands — the flesh is low in value and violet, its light the
 * creature half of the key's (value only), and nothing on it glows but a
 * faint edge. The cilia stop short of the sight's own units.
 *
 * The flesh is still `flueSoot` and its creases `flueSootDark`, so the
 * palette names the frame tests count are the ones the drawing fills. Every
 * width is off the unit's radius or the tile, and nothing here is kept
 * between frames: the breath and the stir are read off `time`.
 */

/** How far in from the segment's edge its two grooves run, as a share of its radius. */
const GROOVE = 0.42;
/** The wet film's strength, and the vein's. */
const FILM = 0.36;
const VEIN = 0.3;
/** The cilia on each unit's crown: how many, how long and how far either side of the crown they stand. */
const CILIA = 3;
const CILIUM_LONG = 0.24;
const CILIA_SPREAD = 0.28;

/**
 * Unit `k` at `at`: flesh, lit from the key, its grooves, pores and vein, red
 * with a blow landed. Returns its outline round its own middle, for the
 * gullet to be cut back over it.
 */
export function drawFlueSegment(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  k: number,
  at: Point,
  hurt: number,
  time: number,
): Path2D {
  ctx.save();
  ctx.translate(at.x, at.y);
  const unit = flueUnitPath(l, k, time);
  const r = flueUnitR(l);
  ctx.fillStyle = PALETTE.flueSoot;
  ctx.fill(unit);
  ctx.save();
  ctx.clip(unit);
  litRound(ctx, -0.15 * r, -0.25 * r, r, LIGHT_HALF.creature);
  drawGrooves(ctx, r);
  drawPores(ctx, r, k);
  drawVein(ctx, r, k);
  ctx.restore();
  paintFilm(ctx, 0, 0, r, FILM);
  drawHurt(ctx, unit, hurt);
  ctx.lineWidth = STROKE.outline;
  ctx.lineJoin = "round";
  ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.95);
  ctx.stroke(unit);
  strokeGlowFaded(ctx, unit, PALETTE.sheenRim, STROKE.inner, 0.3, 0.5);
  ctx.restore();
  return unit;
}

/** Two folds running round the ring, each a dark crease with a lit lip under it. */
function drawGrooves(ctx: CanvasRenderingContext2D, r: number): void {
  for (const side of [-1, 1]) {
    const x = side * r * GROOVE;
    const fold = new Path2D();
    fold.moveTo(x, -r);
    fold.quadraticCurveTo(x + side * r * 0.14, 0, x, r);
    ctx.lineWidth = r * 0.09;
    ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.55);
    ctx.stroke(fold);
    ctx.save();
    ctx.translate(side * r * 0.06, 0);
    ctx.lineWidth = r * 0.035;
    ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.18);
    ctx.stroke(fold);
    ctx.restore();
  }
}

/** A pore or two on the ring's face, wet and dark, placed off `k` so no two rings match. */
function drawPores(ctx: CanvasRenderingContext2D, r: number, k: number): void {
  const n = 1 + (k % 2);
  for (let i = 0; i < n; i++) {
    const px = Math.sin(k * 2.3 + i * 2.1) * r * 0.25;
    const py = (i === 0 ? -0.55 : 0.6) * r + Math.cos(k * 1.7) * r * 0.08;
    const pr = r * (0.075 + 0.02 * ((k + i) % 2));
    ctx.fillStyle = rgba(PALETTE.flueSootDark, 0.8);
    ctx.beginPath();
    ctx.ellipse(px, py, pr * 1.25, pr, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(PALETTE.sheenRim, 0.3);
    ctx.beginPath();
    ctx.ellipse(px, py + pr * 0.55, pr * 0.8, pr * 0.3, 0, 0, Math.PI);
    ctx.fill();
  }
}

/** A vein in the sheen's violet down the ring, with one branch, bent a little differently on each. */
function drawVein(ctx: CanvasRenderingContext2D, r: number, k: number): void {
  const bend = Math.sin(k * 1.9) * r * 0.22;
  const vein = new Path2D();
  vein.moveTo(-r * 0.1, -r * 0.95);
  vein.bezierCurveTo(bend, -r * 0.4, -bend, r * 0.3, r * 0.08, r * 0.95);
  vein.moveTo(bend * 0.4, -r * 0.2);
  vein.quadraticCurveTo(r * 0.3, -r * 0.1, r * 0.34 + bend * 0.2, r * 0.25);
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.05;
  ctx.strokeStyle = rgba(PALETTE.sheenMid, VEIN);
  ctx.stroke(vein);
}

/**
 * A fringe of cilia on unit `k`'s crown at `at`, each stirring on its own
 * phase of `time` — in the flesh's own colour, so they read as part of the
 * body and not as a mark.
 */
export function drawFlueCilia(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  k: number,
  at: Point,
  time: number,
): void {
  const r = flueUnitR(l);
  const long = CILIUM_LONG * l.tile;
  const hairs = new Path2D();
  for (let i = 0; i < CILIA; i++) {
    const across = (i - (CILIA - 1) / 2) * CILIA_SPREAD * r;
    const root = { x: at.x + across, y: at.y - r * (0.94 - 0.1 * Math.abs(across / r)) };
    const sway = Math.sin(time * 2.1 + k * 1.3 + i * 2.2) * long * 0.45;
    hairs.moveTo(root.x, root.y);
    hairs.quadraticCurveTo(root.x + sway * 0.3, root.y - long * 0.6, root.x + sway, root.y - long);
  }
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, l.tile * 0.035);
  ctx.strokeStyle = PALETTE.flueSoot;
  ctx.stroke(hairs);
  ctx.restore();
}
