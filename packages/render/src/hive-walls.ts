import { type HiveState, hiveOnWall } from "@neon-spore/sim";
import type { Point } from "./hive-shape.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * **THE HIVE's two walls, in field pixels**: the mass hung down both sides of
 * the field and joined to the top through its corners, so the field is the
 * hole in it — the owner's of 5 October 2026, *a little bit curved, … so it
 * looks a little bit more like an inverted circle*.
 *
 * A wall is the mass's own wax, not a second body: `hiveWalledPath` lays it
 * into the one contour with the top, its inner face swinging out from the
 * corner and narrowing to a drip below the lowest cocoon, so the corner is
 * filled and nothing hangs off the curve. The face breathes — a slow wave
 * runs down it — and swells into a lip round each cocoon, which is the socket
 * the cocoon sits in.
 *
 * **A cocoon hangs into the field, not down it.** It is the underside's own
 * drop turned on its side (`hiveWallFrame`): the left wall's by a mirror, so
 * the light still falls from the upper left, the right wall's by a quarter
 * turn, so it falls from the upper right — either way from above, where the
 * field is lit from.
 */

/** How far the face stands in from the field's edge at the corner, and at the drip, in tiles. */
const FACE_TOP = 0.5;
const FACE_TIP = 0.16;
/** How far the lips round a cocoon stand proud of the face, in tiles, and how far each reaches along it. */
const LIP = 0.28;
const LIP_REACH = 0.45;
/** How far above and below a cocoon's middle the lips stand, in tiles: on its shoulders, so its belly is clear. */
const SHOULDER = 0.42;
/** How far the face is lumped at rest, and how far it breathes, in tiles. */
const LUMP = 0.05;
const BREATHE = 0.05;
/** How far above the highest cocoon the corner meets the face, and below the lowest the drip hangs, in tiles. */
const CORNER = 0.95;
const DRIP = 1.3;
/** How far past the field's edge the mass runs out of sight, in tiles. */
const OUTER = 0.8;
/** A wall's cocoon against an underside's drop: a little smaller, for the narrow wall it hangs off. */
export const WALL_SITE = 0.8;

/** Where the walls run: the highest and lowest cocoon's centre, or null for a mass with none. */
export interface WallSpan {
  top: number;
  bottom: number;
  /** The rows of every cocoon on a wall, which the lip swells round. */
  ys: number[];
}

export function hiveWallSpan(l: Layout, s: HiveState): WallSpan | null {
  const ys: number[] = [];
  for (let i = 0; i < s.cols.length; i++) if (hiveOnWall(s, i)) ys.push(tileCY(l, s.rows[i] ?? 0));
  if (ys.length === 0) return null;
  return { top: Math.min(...ys), bottom: Math.max(...ys), ys };
}

/** Where the face meets the corner, and where the drip hangs: screen y. */
const cornerY = (l: Layout, w: WallSpan): number => w.top - l.tile * CORNER;
const tipY = (l: Layout, w: WallSpan): number => w.bottom + l.tile * DRIP;

/**
 * How far the inner face stands in from the field's edge at screen `y`, in
 * pixels: wide at the corner, narrow at the drip, lumped, swelling round each
 * cocoon into the socket it sits in unless `bare`, and breathing at `time`
 * (nought for the face at rest).
 */
export function wallFace(
  l: Layout,
  w: WallSpan,
  y: number,
  time: number,
  side: 1 | -1,
  bare = false,
): number {
  const t = l.tile;
  const y0 = cornerY(l, w);
  const k = Math.max(0, Math.min(1, (y - y0) / Math.max(1, tipY(l, w) - y0)));
  // A quarter-circle's falloff rather than a line, so the face leaves the
  // corner steep and runs nearly straight by the cocoons.
  const base = FACE_TIP + (FACE_TOP - FACE_TIP) * Math.sqrt(1 - k * k);
  const lump = LUMP * Math.sin(side * 1.7 + y / (t * 0.55));
  if (bare) return t * (base + lump);
  let lip = 0;
  for (const cy of w.ys) {
    const d = Math.abs(Math.abs(y - cy) - t * SHOULDER) / (t * LIP_REACH);
    if (d < 1) lip = Math.max(lip, 0.5 + 0.5 * Math.cos(d * Math.PI));
  }
  const breathe = time === 0 ? 0 : BREATHE * Math.sin(time * 1.2 + side * 0.9 + y / (t * 0.9));
  return t * (base + lump + LIP * lip + breathe);
}

/** The field's two edges, in screen x. */
function edges(l: Layout, cols: number): { left: number; right: number } {
  return { left: tileCX(l, 0) - l.tile * 0.5, right: tileCX(l, cols - 1) + l.tile * 0.5 };
}

/** Which way a cocoon on the wall in `col` hangs: right off the left wall, left off the right. */
export const hiveWallSide = (col: number): 1 | -1 => (col === 0 ? 1 : -1);

/** The rest centre of wall cocoon `i`: on its own row, its back in the socket the face swells into round it. */
export function hiveWallSite(l: Layout, s: HiveState, i: number, w: WallSpan): Point {
  const col = s.cols[i] ?? 0;
  const y = tileCY(l, s.rows[i] ?? 0);
  const side = hiveWallSide(col);
  const edge = tileCX(l, col) - side * l.tile * 0.5;
  return { x: edge + side * (wallFace(l, w, y, 0, side, true) + l.tile * 0.12), y };
}

/**
 * The frame a wall cocoon is drawn in: its own drop, which hangs down `+y`,
 * laid on its side so it hangs into the field — `[a, b, c, d]` for
 * `ctx.transform` about the cocoon's centre.
 */
export function hiveWallFrame(col: number): [number, number, number, number] {
  // Left: a mirror across the diagonal, down to right, the light kept upper
  // left. Right: a quarter turn, down to left, the light upper right.
  return col === 0 ? [0, 1, 1, 0] : [0, 1, -1, 0];
}

/**
 * The mass with its walls, as one closed contour: the dome over the top, out
 * past both edges of the field and down them, round the drip at the foot of
 * each wall, up its inner face, round the corner and along the underside's
 * scallops, one a site. Every x is drawn `open` of the way in from the middle,
 * as the mass without walls is (`hiveMassPath`).
 */
export function hiveWalledPath(
  l: Layout,
  cols: number,
  w: WallSpan,
  top: number,
  under: number,
  siteXs: readonly number[],
  open: number,
  time: number,
): Path2D {
  const t = l.tile;
  const { e, mid, X, y0, firstX, lastX } = hiveWallLay(l, cols, w, siteXs, open);
  const dome = t * 0.5;
  const lobe = t * 0.2;
  const yTip = tipY(l, w) + t * 0.08 * Math.sin(time * 0.9);
  const p = new Path2D();
  p.moveTo(X(e.left - t * OUTER), top + dome);
  p.quadraticCurveTo(X(mid), top - dome * 0.6, X(e.right + t * OUTER), top + dome);
  p.lineTo(X(e.right + t * OUTER), yTip - t * 0.4);
  // The right wall: the drip, then up the face to the corner.
  const rightFace = (y: number): number => e.right - wallFace(l, w, y, time, -1);
  p.quadraticCurveTo(X(e.right - t * 0.05), yTip + t * 0.55, X(rightFace(yTip)), yTip);
  face(p, l, yTip, y0, (y) => X(rightFace(y)));
  // The corner: steep off the face, level into the scallops.
  const xs = [...siteXs].sort((a, b) => a - b);
  p.quadraticCurveTo(X(rightFace(y0)), under - lobe, X(firstX), under - lobe);
  for (let i = xs.length - 1; i >= 0; i--) {
    const cx = xs[i] ?? mid;
    const to = i > 0 ? (cx + (xs[i - 1] ?? mid)) * 0.5 : lastX;
    p.quadraticCurveTo(X(cx), under + lobe, X(to), under - lobe);
  }
  // The left corner and wall, the same way back.
  const leftFace = (y: number): number => e.left + wallFace(l, w, y, time, 1);
  p.quadraticCurveTo(X(leftFace(y0)), under - lobe, X(leftFace(y0)), y0);
  face(p, l, y0, yTip, (y) => X(leftFace(y)));
  p.quadraticCurveTo(X(e.left + t * 0.05), yTip + t * 0.55, X(e.left - t * OUTER), yTip - t * 0.4);
  p.closePath();
  return p;
}

/** What the walled contour is laid on: the field's edges, the squeeze to the middle, the corners' ends. */
export function hiveWallLay(
  l: Layout,
  cols: number,
  w: WallSpan,
  siteXs: readonly number[],
  open: number,
) {
  const e = edges(l, cols);
  const mid = (e.left + e.right) * 0.5;
  const X = (x: number): number => mid + (x - mid) * open;
  const lo = siteXs.length > 0 ? Math.min(...siteXs) : mid;
  const hi = siteXs.length > 0 ? Math.max(...siteXs) : mid;
  return { e, mid, X, y0: cornerY(l, w), firstX: hi + l.tile * 0.5, lastX: lo - l.tile * 0.5 };
}

/**
 * A wall's inner face from `from` to `to`, through samples half a tile apart,
 * each the control of a curve between the midpoints round it — so the face
 * is one smooth line however much it breathes. The path already stands on
 * the face at `from`.
 */
function face(p: Path2D, l: Layout, from: number, to: number, x: (y: number) => number): void {
  const n = Math.max(2, Math.round(Math.abs(to - from) / (l.tile * 0.5)));
  const at = (k: number): number => from + ((to - from) * k) / n;
  for (let k = 1; k < n; k++) {
    const y = at(k);
    const next = (y + at(k + 1)) * 0.5;
    p.quadraticCurveTo(x(y), y, x(next), next);
  }
  p.lineTo(x(to), to);
}

/** The boxes the comb is pressed into on a walled mass: the top, and a strip down each wall. */
export function hiveWallCombs(
  l: Layout,
  cols: number,
  w: WallSpan,
  top: number,
  under: number,
): { left: number; right: number; top: number; bottom: number }[] {
  const t = l.tile;
  const e = edges(l, cols);
  const reach = t * (FACE_TOP + LIP + 0.3);
  const bottom = tipY(l, w) + t * 0.7;
  return [
    { left: e.left - t * OUTER, right: e.right + t * OUTER, top, bottom: under + t * 0.3 },
    { left: e.left - t * OUTER, right: e.left + reach, top: under, bottom },
    { left: e.right - reach, right: e.right + t * OUTER, top: under, bottom },
  ];
}
