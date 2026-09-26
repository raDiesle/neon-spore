import { blobRadiusMul } from "@neon-spore/content";
import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE VALVE's geometry**: where the drum hangs, and the paths it is made of.
 *
 * **The drum is THE CODEX** (`tools/shape-sheet/src/drafts/bosses.ts`, the
 * `glyphed` form in `forms/radial.ts`): a squat slab whose rim is cut in
 * notches that scroll — and here what scrolls them is the wheel's bearing, so
 * a turned wheel runs the whole rim round and a frozen one stops it dead. **The
 * pins are THE TITHE's plates** (`drafts/collected.ts`, `plated` in
 * `forms/walked.ts`): squared tabs hung under the slab, pad cut off each side,
 * the live one reaching further than the rest.
 *
 * Every path here is laid round the drum's own middle at the origin; the
 * draw moves the canvas there and tilts it by the list, so the list is one
 * rotation and never a second copy of the geometry.
 */

export interface Point {
  x: number;
  y: number;
}

/** The row the drum's middle hangs in. */
const ROW = 2.6;
/** Half the drum's width and half its height, in tiles — THE CODEX's 96 by 54, near enough. */
const RX = 2.3;
const RY = 1.3;
/** Notches round the rim (THE CODEX's thirteen), and how far each is cut, as a share of the radius. */
const TEETH = 13;
const CUT = 0.11;
/** How far round the rim turns for one turn of the wheel: geared down, so the rim reads as driven. */
const GEAR = 0.5;
/** Samples round the rim. */
const N = 64;
/** The wheel in the face: its middle, off the drum's own, and its radius, in tiles. */
const WHEEL_X = -0.62;
const WHEEL_R = 0.7;
/** The pin socket beside it, and its radius, in tiles. */
const SOCKET_X = 1.28;
const SOCKET_R = 0.26;
/** The three pins: the span of the underside they hang across, the plate's top inside the rim, and how far a plate hangs below, in tiles. */
const PIN_SPAN = 1.5;
const PIN_TOP = 0.55;
const PIN_DROP = 0.5;

/** The middle of the drum: the middle column, a couple of rows into the field. */
export function valveCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** How far above its place the drum still is, `arrived` of the way in. */
export function valveLift(l: Layout, arrived: number): number {
  return (1 - arrived) * 3 * l.tile;
}

/** The drum's half-size in pixels. */
export function valveReach(l: Layout): { rx: number; ry: number } {
  return { rx: RX * l.tile, ry: RY * l.tile };
}

/** A bearing in thousandths of a turn, clockwise from the top, as an angle on the canvas. */
export function bearingAngle(milli: number): number {
  return -Math.PI / 2 + (milli / 1000) * Math.PI * 2;
}

/** The point `r` out from `at` along a bearing. */
export function onBearing(at: Point, r: number, milli: number): Point {
  const a = bearingAngle(milli);
  return { x: at.x + Math.cos(a) * r, y: at.y + Math.sin(a) * r };
}

/**
 * THE CODEX's rim, its notches scrolled by the wheel: `wheelMilli` is the one
 * input that moves them, so the rim is as still as the wheel is. `t` only
 * breathes the outline, a hundredth of the radius, which a stopped wheel keeps.
 */
export function valveRimPath(l: Layout, wheelMilli: number, t: number): Path2D {
  const scroll = (wheelMilli / 1000) * Math.PI * 2 * GEAR * TEETH;
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const wave = Math.tanh(Math.sin(TEETH * a - scroll) * 2.2);
    const m = blobRadiusMul(a, 1, 0.04, 0.01, t, 4.3) * (1 + CUT * wave);
    pts.push({ x: Math.cos(a) * RX * l.tile * m, y: Math.sin(a) * RY * l.tile * m });
  }
  return splinePath(pts, true);
}

/** The face: a plain inset oval inside the notched rim, which the wheel and the socket sit on. */
export function valveFacePath(l: Layout): Path2D {
  const p = new Path2D();
  p.ellipse(0, 0, RX * l.tile * 0.8, RY * l.tile * 0.72, 0, 0, Math.PI * 2);
  return p;
}

/** Where the wheel's middle is, and its radius, in pixels. */
export function valveWheel(l: Layout): { at: Point; r: number } {
  return { at: { x: WHEEL_X * l.tile, y: 0 }, r: WHEEL_R * l.tile };
}

/** Where the pin socket is, and its radius, in pixels. */
export function valveSocket(l: Layout): { at: Point; r: number } {
  return { at: { x: SOCKET_X * l.tile, y: 0 }, r: SOCKET_R * l.tile };
}

/**
 * THE CODEX again, small, as the wheel: its notches turned by the bearing
 * one for one, so the wheel's own turn is seen as well as the rim's.
 */
export function valveWheelPath(l: Layout, wheelMilli: number): Path2D {
  const { at, r } = valveWheel(l);
  const turn = (wheelMilli / 1000) * Math.PI * 2;
  const pts: Point[] = [];
  for (let i = 0; i < N / 2; i++) {
    const a = (i / (N / 2)) * Math.PI * 2;
    const m = 1 + 0.08 * Math.tanh(Math.sin(8 * (a - turn)) * 2.2);
    pts.push({ x: at.x + Math.cos(a) * r * m, y: at.y + Math.sin(a) * r * m });
  }
  return splinePath(pts, true);
}

/** The wheel's spokes, four of them, turned with it, and the one white pointer that says its bearing. */
export function valveSpokesPath(l: Layout, wheelMilli: number): Path2D {
  const { at, r } = valveWheel(l);
  const p = new Path2D();
  for (let k = 1; k < 4; k++) {
    const tip = onBearing(at, r * 0.8, wheelMilli + k * 250);
    p.moveTo(at.x, at.y);
    p.lineTo(tip.x, tip.y);
  }
  return p;
}

export function valvePointerPath(l: Layout, wheelMilli: number): Path2D {
  const { at, r } = valveWheel(l);
  const tip = onBearing(at, r * 0.9, wheelMilli);
  const p = new Path2D();
  p.moveTo(at.x, at.y);
  p.lineTo(tip.x, tip.y);
  return p;
}

/**
 * Pin `i` of three, left to right: THE TITHE's plate, squared, its pad cut
 * off each side, hanging from inside the rim. `reach` is how far below the
 * rim it hangs, 1 at rest; `out` slides it straight down and away as it comes
 * free.
 */
export function valvePinPath(
  l: Layout,
  i: number,
  pins: number,
  reach: number,
  out: number,
): Path2D {
  const w = (PIN_SPAN * 2 * l.tile) / pins;
  const pad = w * 0.19;
  const xL = -PIN_SPAN * l.tile + i * w + pad;
  const xR = xL + w - pad * 2;
  const down = out * 2.4 * l.tile;
  const top = PIN_TOP * RY * l.tile + down;
  const bottom = RY * l.tile + PIN_DROP * reach * l.tile + down;
  const p = new Path2D();
  p.moveTo(xL, top);
  p.lineTo(xR, top);
  p.lineTo(xR, bottom);
  p.lineTo(xL, bottom);
  p.closePath();
  return p;
}

/** The hole a spent pin leaves in the underside: a short dark slot where the plate went in. */
export function valveHolePath(l: Layout, i: number, pins: number): Path2D {
  const w = (PIN_SPAN * 2 * l.tile) / pins;
  const pad = w * 0.19;
  const xL = -PIN_SPAN * l.tile + i * w + pad;
  const y = RY * l.tile * 0.78;
  const p = new Path2D();
  p.rect(xL, y - l.tile * 0.08, w - pad * 2, l.tile * 0.16);
  return p;
}

/** The middle of the slot pin `i` leaves: where the jet blows from. */
export function valveHoleCentre(l: Layout, i: number, pins: number): Point {
  const w = (PIN_SPAN * 2 * l.tile) / pins;
  return { x: -PIN_SPAN * l.tile + i * w + w / 2, y: RY * l.tile * 0.78 };
}

/** The spark's place, `along` of the way from under the drum to the hull, in its column — field coordinates, not the drum's. */
export function valveSparkPoint(l: Layout, at: Point, col: number, along: number): Point {
  const from = at.y + RY * l.tile;
  return { x: fieldX(l, col), y: from + (l.hullY - from) * along };
}
