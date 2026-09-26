import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE RIME's geometry**: where the lens stands, and the paths it is made of.
 *
 * **The lens is two drafts combined** (`tools/shape-sheet/src/drafts/`): its
 * outline is BULB · PEBBLE — six lobes so shallow they are barely there, *a
 * body with no feature at all* — because the glass has nothing to recognise
 * and the frost on it is the whole of what is read; and the frost is THE
 * CAIRN's seven faceted units, *seven rocks in one outline, seams left to
 * count*: seven sheets of ice laid over the glass, each a seven-sided rock,
 * their seams left showing, so the shatter drops them apart one sheet at a
 * time. PEBBLE's own risk, that a circle is a rock, does not reach a pane of
 * glass three tiles across that is frosted pale; THE CAIRN's pile is the ice
 * here, not the body.
 *
 * **A half is split down the spine**: the pilot's on the left, the
 * navigator's on the right, the same as the seats are sat. The clear patch a
 * wipe leaves is a round opening in the frost, centred on its half, as wide
 * as the frost is gone — the wipe's own shape made visible (§29, *Animation*).
 *
 * Every path is laid round the lens's middle at the origin; the draw moves
 * the canvas, so the drop and the shatter are transforms.
 */

export interface Point {
  x: number;
  y: number;
}

/** The row the lens stands at, in tiles below the grid's top. */
const ROW = 2.7;
/** The lens's half-width and half-height, in tiles: PEBBLE's 54 by 50. */
const RX = 1.4;
const RY = 1.3;
/** PEBBLE's edge: six lobes this deep, under a wobble larger than they are. */
const LOBES = 6;
const DEPTH = 0.035;
const WOBBLE = 0.045;
const SEED = 7.4;
/** Samples round the outline. */
const N = 48;
/** The core, as a share of the half-width. */
const CORE = 0.3;
/** THE CAIRN's unit: seven sides, and seven of them. */
const SIDES = 7;
export const RIME_SHEETS = 7;

/** The middle of the lens: over the middle column, near the top of the field. */
export function rimeCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** How far above its place the lens still is, `arrived` of the way in. */
export function rimeLift(l: Layout, arrived: number): number {
  return (1 - arrived) * 3 * l.tile;
}

/** The lens's half-width and half-height, in pixels. */
export function rimeRadius(l: Layout): { rx: number; ry: number } {
  return { rx: RX * l.tile, ry: RY * l.tile };
}

/** A point on the outline at angle `a`: PEBBLE's shallow lobes under its wobble, the same both sides of the spine. */
function edge(l: Layout, a: number): Point {
  const { rx, ry } = rimeRadius(l);
  const c = Math.abs(Math.cos(a));
  const m =
    1 + DEPTH * Math.cos(LOBES * a) + WOBBLE * Math.sin(3 * Math.atan2(Math.sin(a), c) + SEED);
  return { x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m };
}

/** The whole pane. */
export function rimeLensPath(l: Layout): Path2D {
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) pts.push(edge(l, (i * Math.PI * 2) / N));
  return splinePath(pts, true);
}

/** Half `side`'s pane — the pilot's (0) on the left, the navigator's (1) on the right — closed along the spine. */
export function rimeHalfPath(l: Layout, side: 0 | 1): Path2D {
  const flip = side === 0 ? -1 : 1;
  const pts: Point[] = [];
  for (let i = 0; i <= N / 2; i++) {
    const p = edge(l, -Math.PI / 2 + (i * Math.PI) / (N / 2));
    pts.push({ x: p.x * flip, y: p.y });
  }
  const p = splinePath(pts, false);
  const { ry } = rimeRadius(l);
  p.lineTo(0, ry);
  p.lineTo(0, -ry);
  return p;
}

/** The middle a half's clear patch opens from. */
export function rimeHalfMiddle(l: Layout, side: 0 | 1): Point {
  const { rx } = rimeRadius(l);
  return { x: (side === 0 ? -1 : 1) * rx * 0.5, y: 0 };
}

/**
 * The clear patch on half `side`, `clear` of the way to the whole half: a
 * round opening with a ragged edge, as wide as the frost is gone — linear
 * rather than by area, since the half's own edge cuts the opening's far side off.
 */
export function rimePatchPath(l: Layout, side: 0 | 1, clear: number): Path2D {
  const { rx, ry } = rimeRadius(l);
  const at = rimeHalfMiddle(l, side);
  const reach = Math.hypot(rx * 0.5, ry) * 1.12;
  const r = reach * Math.max(0, Math.min(1, clear));
  const pts: Point[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    const rag = 1 + 0.09 * Math.sin(5 * a + side * 2.1) * (i % 2 === 0 ? 1 : 0.6);
    pts.push({ x: at.x + Math.cos(a) * r * rag, y: at.y + Math.sin(a) * r * rag });
  }
  return splinePath(pts, true);
}

/** The pane shrunk to `share` of itself: the inner edge of a surge crawling in from the rim. */
export function rimeInnerPath(l: Layout, share: number): Path2D {
  const pts: Point[] = [];
  const k = Math.max(0.001, share);
  for (let i = 0; i < N; i++) {
    const p = edge(l, (i * Math.PI * 2) / N);
    const jag = 1 + (i % 2 === 0 ? 0.04 : -0.04) * (1 - k);
    pts.push({ x: p.x * k * jag, y: p.y * k * jag });
  }
  return splinePath(pts, true);
}

/**
 * Sheet `k` of THE CAIRN's seven: one in the middle over the core and six
 * round it, each a seven-sided rock wide enough that together they cover the
 * pane, with its middle and its spin so the shatter can drop it on its own.
 */
export function rimeSheet(l: Layout, k: number): Point & { r: number; spin: number } {
  const { rx, ry } = rimeRadius(l);
  if (k === 0) return { x: 0, y: 0, r: rx * 0.46, spin: 0.3 };
  const a = ((k - 1) * Math.PI * 2) / (RIME_SHEETS - 1) + 0.35;
  return { x: Math.cos(a) * rx * 0.66, y: Math.sin(a) * ry * 0.66, r: rx * 0.5, spin: a * 1.7 };
}

/** A seven-sided rock of radius `r` round the origin, turned by `spin`, its facets uneven by `seed`. */
export function rimeFacetPath(r: number, spin: number, seed: number): Path2D {
  const p = new Path2D();
  for (let i = 0; i < SIDES; i++) {
    const a = spin + (i * Math.PI * 2) / SIDES;
    const rr = r * (0.9 + 0.1 * Math.sin(seed * 3.1 + i * 2.3));
    if (i === 0) p.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else p.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  p.closePath();
  return p;
}

/** The core's radius at its fullest, in pixels. */
export function rimeCoreR(l: Layout): number {
  return rimeRadius(l).rx * CORE;
}

/** The core, `size` of its fullest: THE CAIRN's unit once more, one rock at the heart of the pane. */
export function rimeCorePath(l: Layout, size: number): Path2D {
  return rimeFacetPath(Math.max(0.5, rimeCoreR(l) * size), -Math.PI / 2, 0.8);
}
