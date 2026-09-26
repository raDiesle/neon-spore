import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE SLING's geometry**: a forked bracket bolted over the middle column,
 * its two tines rising from one crotch, and a cord off each tip a seat draws
 * down toward their own side.
 *
 * **The fork never moves**: only the cords do. Bolted, not hung, so it never
 * lifts into frame the way a falling body does — it is simply not there and
 * then it is, `slingArrived` swinging the tines out from folded rather than
 * dropping the whole thing from above. Everything is laid out about the
 * crotch at the origin; the draw moves the canvas to plant it there.
 */

export interface Point {
  x: number;
  y: number;
}

/** The row the crotch sits at, in tiles below the grid's top. */
const ROW = 2.3;
/** How far a tine's tip stands from the crotch, and how steep it rises. */
const TINE_LEN = 1.05;
const TINE_SPLAY = 0.62;
/** The cup's radius at the crotch, in tiles. */
const CUP_R = 0.34;
/** How far a cord's handle droops from its tip when slack, and when drawn home. */
const SLACK_DROP = 0.32;
const DRAWN_DROP = 1.55;
/** How far a drawn handle is pulled outward, past its own tine, toward the seat's side. */
const DRAWN_OUT = 0.5;

/** The crotch: over the middle column, above the ship. */
export function slingCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** Tine `side`'s tip, folded (`out` 0) or splayed to its full stand (`out` 1). */
export function slingTip(l: Layout, side: 0 | 1, out: number): Point {
  const flip = side === 0 ? -1 : 1;
  const splay = TINE_SPLAY * out;
  return {
    x: flip * TINE_LEN * l.tile * splay,
    y: -TINE_LEN * l.tile * (0.35 + 0.65 * out),
  };
}

/** The cord's handle for tine `side`, at `tension` 0 slack to 1 drawn fully home. */
export function slingHandle(l: Layout, side: 0 | 1, tension: number): Point {
  const flip = side === 0 ? -1 : 1;
  const tip = slingTip(l, side, 1);
  const drop = SLACK_DROP + (DRAWN_DROP - SLACK_DROP) * tension;
  const out = flip * DRAWN_OUT * tension * l.tile;
  return { x: tip.x + out, y: tip.y + drop * l.tile };
}

/** The cup's radius, in pixels. */
export function slingCupRadius(l: Layout): number {
  return CUP_R * l.tile;
}

/** One tine: a tapered spar from the crotch to its tip, folded or splayed by `out`. */
export function slingTinePath(l: Layout, side: 0 | 1, out: number): Path2D {
  const tip = slingTip(l, side, out);
  const flip = side === 0 ? -1 : 1;
  const width = 0.1 * l.tile;
  const nx = -tip.y;
  const ny = tip.x;
  const len = Math.hypot(nx, ny) || 1;
  const wx = (nx / len) * width;
  const wy = (ny / len) * width;
  const near: Point = { x: flip * width * 0.6, y: 0 };
  const far: Point = { x: -flip * width * 0.6, y: 0 };
  const tipA: Point = { x: tip.x - wx * 0.15, y: tip.y - wy * 0.15 };
  const tipB: Point = { x: tip.x + wx * 0.15, y: tip.y + wy * 0.15 };
  return splinePath([near, tipB, tipA, far], true);
}

/** The cord itself, crotch-side tip to the drawn or slack handle. */
export function slingCordPath(l: Layout, side: 0 | 1, tension: number): Path2D {
  const tip = slingTip(l, side, 1);
  const handle = slingHandle(l, side, tension);
  const p = new Path2D();
  p.moveTo(tip.x, tip.y);
  p.lineTo(handle.x, handle.y);
  return p;
}

/** The cup: a small dish at the crotch, between the tines' roots. */
export function slingCupPath(l: Layout): Path2D {
  const r = slingCupRadius(l);
  const p = new Path2D();
  p.ellipse(0, -r * 0.2, r, r * 0.8, 0, 0, Math.PI * 2);
  return p;
}
