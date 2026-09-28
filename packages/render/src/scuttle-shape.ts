import {
  type ScuttleState,
  type SimConfig,
  scuttleCadence,
  scuttleSocketCol,
  scuttleSocketRow,
  scuttleWindBeats,
  scuttleWinding,
} from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { type SlowSpan, slowHush } from "./slow-hush.js";

/**
 * **Where THE SCUTTLE is**, in field pixels: the frame of sockets hung over
 * the top of the field above row 0, each socket's centre, how far a loose
 * part has slid out of its socket on its thread, how far the frame has drawn
 * back on the wind-up, and how far it has closed on its way out.
 *
 * Its own file for THE LEAD's reason (`lead-shape.ts`): the drawer stands
 * the frame on these (`scuttle-draw.ts`), the transients throw their bursts
 * at them (`scuttle-fx.ts`), and a socket placed in two files would be a
 * part drawn on one line and its receipts thrown at another.
 *
 * **Nothing here is per seat.** The frame stands in the same place on both
 * screens; the split is in what is drawn *in* the sockets, and that is the
 * drawer's (`view-role-clocks-b.ts`).
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Where the rows stand and how far a loose part falls, in tiles: the bottom
 * row's centre above the grid, the pitch between rows, and how far a loose
 * part slides down out of its socket over the cadence. Three rows at this
 * pitch put the top of the frame 1.6 tiles above the grid, under the HUD's
 * pills rather than through them — THE LEAD's full stalk reaches 1.85 for the
 * same reason (`lead-shape.ts`).
 *
 * **The drop is shorter than the pitch**, so a part off an upper row comes to
 * rest clear of the socket below it rather than over it — VERSUS `apart`,
 * taken 24 September 2026 (`tools/versus/DECIDED.md`). The bottom row sits
 * lower to keep the frame's top where it was.
 */
export interface ScuttleRows {
  rise: number;
  pitch: number;
  drop: number;
}
export const SCUTTLE_ROWS: ScuttleRows = { rise: 0.4, pitch: 0.6, drop: 0.26 };
/** A socket's half width and half height, in tiles. */
export const SOCKET_HALF_W = 0.36;
export const SOCKET_HALF_H = 0.16;
/**
 * **Where a loose part's thread is tied**, in tiles: this far under its
 * socket's centre, to the floor of the recess the eye sees head-on, and to
 * the top of a hanging plate this much slimmer than its socket. The two
 * together are well under the 0.26 the part falls, so the thread is a line
 * for the back three quarters of the cadence, and at the throw the plate has
 * come clear of its socket's lip — kept over a longer drop, which would bring
 * a part off an upper row back over the socket below it (VERSUS `apart`).
 */
export const SOCKET_FLOOR_H = 0.03;
export const PLATE_HALF_H = 0.1;
/** How far the frame draws back up on the wind-up, in tiles. */
const WIND_RISE = 0.3;

/** The centre of socket `i`'s row, before any wind-up. */
export function scuttleRowY(l: Layout, cfg: SimConfig, i: number): number {
  const fromBottom = cfg.scuttleRows - 1 - scuttleSocketRow(cfg, i);
  return l.gridTop - l.tile * (SCUTTLE_ROWS.rise + fromBottom * SCUTTLE_ROWS.pitch);
}

/** The centre of socket `i`, with the frame drawn back by `rise` pixels. */
export function scuttleSocket(l: Layout, cfg: SimConfig, i: number, rise = 0): Point {
  return { x: tileCX(l, scuttleSocketCol(cfg, i)), y: scuttleRowY(l, cfg, i) - rise };
}

/** The frame's box round every socket: its left, right, top and bottom, before any wind-up. */
export function scuttleBox(
  l: Layout,
  cfg: SimConfig,
): { left: number; right: number; top: number; bottom: number } {
  const first = scuttleSocket(l, cfg, 0);
  const last = scuttleSocket(l, cfg, cfg.scuttleRows * cfg.scuttleCols - 1);
  const padX = l.tile * (SOCKET_HALF_W + 0.1);
  const padY = l.tile * (SOCKET_HALF_H + 0.08);
  return { left: first.x - padX, right: last.x + padX, top: first.y - padY, bottom: last.y + padY };
}

/**
 * The slab as a closed contour: an arched top, flanks that bulge out a
 * little and breathe, and an underside scalloped once a column — a jaw of
 * lobes over the sockets rather than a box round them, since a box over
 * the field is a panel and a lobed mass is a body (`CLAUDE.md`). `open`
 * closes it in on the middle column, for the frame on its way out.
 */
export function scuttleSlabPath(
  l: Layout,
  cfg: SimConfig,
  rise: number,
  open: number,
  time: number,
): Path2D {
  const box = scuttleBox(l, cfg);
  const mid = (box.left + box.right) * 0.5;
  const hw = (box.right - box.left) * 0.5 * open;
  const top = box.top - rise;
  const bottom = box.bottom - rise;
  const flank = l.tile * (0.08 + 0.02 * Math.sin(time * 1.3));
  const arch = l.tile * 0.12;
  const lobe = l.tile * 0.1;
  const p = new Path2D();
  p.moveTo(mid - hw, top + arch);
  p.quadraticCurveTo(mid, top - arch, mid + hw, top + arch);
  p.quadraticCurveTo(mid + hw + flank, (top + bottom) * 0.5, mid + hw, bottom - lobe);
  const n = Math.max(1, cfg.scuttleCols);
  for (let i = n - 1; i >= 0; i--) {
    const x0 = mid + hw - ((n - i) * hw * 2) / n;
    const x1 = x0 + (hw * 2) / n;
    p.quadraticCurveTo((x0 + x1) * 0.5, bottom + lobe, x0, bottom - lobe);
  }
  p.quadraticCurveTo(mid - hw - flank, (top + bottom) * 0.5, mid - hw, top + arch);
  p.closePath();
  return p;
}

/** How far through the cadence a loose part is, 0 at the detachment and 1 at the throw. */
export function scuttleHangPhase(
  s: ScuttleState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const cadence = Math.max(1, scuttleCadence(s, cfg));
  return Math.min(1, Math.max(0, (beat - s.cycleBeat + beatPhase) / cadence));
}

/** How far a loose part hangs below its socket, in pixels, at `phase` of the cadence. */
export function scuttleHangDrop(l: Layout, phase: number): number {
  return l.tile * SCUTTLE_ROWS.drop * Math.sqrt(phase);
}

/**
 * The thread from a socket at `from` to the part hanging at `to`, or null
 * while the plate still covers the knot. What is returned runs downward:
 * the test the drawing is spared by is the length the drawing spends.
 */
export function scuttleThread(l: Layout, from: Point, to: Point): [Point, Point] | null {
  const a = { x: from.x, y: from.y + l.tile * SOCKET_FLOOR_H };
  const b = { x: to.x, y: to.y - l.tile * PLATE_HALF_H };
  return b.y > a.y ? [a, b] : null;
}

/** How far through the wind-up it is, 0 before and 1 at the throw; 0 while it is not winding. */
export function scuttleWindPhase(
  s: ScuttleState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (!scuttleWinding(s)) return 0;
  const beats = Math.max(1, scuttleWindBeats(cfg));
  return Math.min(1, Math.max(0, (beat - s.windBeat + beatPhase) / beats));
}

/**
 * What is left of the wind-up's shiver in an open window: 0.05 of a tile at
 * 40 radians a second is 2 tiles a second, and a twenty-fifth of it is 0.08,
 * under the tenth a live mark may move (`tools/director/test/boss-hush.test.ts`).
 */
const SHIVER_HUSHED = 0.04;

/**
 * **A loose part's shiver as the frame winds up**, sideways in pixels. It is
 * the part's own and not the throw's clock, so an open window hushes it
 * (`slow-hush.ts`): the live part is a mark. The rise and the hang are the
 * throw's clock and go on.
 */
export function scuttleShiver(
  l: Layout,
  cfg: SimConfig,
  slow: SlowSpan,
  s: ScuttleState,
  beat: number,
  beatPhase: number,
  time: number,
): number {
  const wind = scuttleWindPhase(s, cfg, beat, beatPhase);
  const hush = slowHush(slow, beat, beatPhase, SHIVER_HUSHED);
  return Math.sin(time * 40) * l.tile * 0.05 * wind * hush;
}

/** How far the frame has drawn back up, in pixels, at `phase` of the wind-up. */
export function scuttleWindRise(l: Layout, phase: number): number {
  return l.tile * WIND_RISE * phase * phase;
}

/** The frame's box as it stands this frame, drawn back by the wind-up: its middle and half-sizes. */
export function scuttleFrameBox(
  l: Layout,
  cfg: SimConfig,
  s: ScuttleState,
  beat: number,
  beatPhase: number,
): { x: number; y: number; rx: number; ry: number } {
  const b = scuttleBox(l, cfg);
  const rise = scuttleWindRise(l, scuttleWindPhase(s, cfg, beat, beatPhase));
  return {
    x: (b.left + b.right) * 0.5,
    y: (b.top + b.bottom) * 0.5 - rise,
    rx: (b.right - b.left) * 0.5,
    ry: (b.bottom - b.top) * 0.5,
  };
}

/** What is left of the frame on its way out, 1 while it stands and 0 when it is gone. */
export function scuttleFade(
  s: ScuttleState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.downBeat < 0) return 1;
  const beats = Math.max(1, cfg.scuttleOutBeats);
  return Math.max(0, 1 - (beat - s.downBeat + beatPhase) / beats);
}

/**
 * A socket's plate as a closed shape: a flat-topped lobe, wider than it is
 * tall, with its lower corners rounded off — a rock's outline squashed into
 * a slot, so that a row of them reads as plating and one hanging alone reads
 * as a thing that was plating a moment ago. `open` closes it inward, for the
 * frame on its way out; `half` is a hanging plate's slimmer half height.
 */
export function scuttlePlatePath(l: Layout, c: Point, open = 1, half = SOCKET_HALF_H): Path2D {
  const hw = l.tile * SOCKET_HALF_W * open;
  const hh = l.tile * half;
  const p = new Path2D();
  p.moveTo(c.x - hw, c.y - hh);
  p.lineTo(c.x + hw, c.y - hh);
  p.lineTo(c.x + hw, c.y + hh * 0.2);
  p.quadraticCurveTo(c.x + hw, c.y + hh, c.x + hw * 0.6, c.y + hh);
  p.lineTo(c.x - hw * 0.6, c.y + hh);
  p.quadraticCurveTo(c.x - hw, c.y + hh, c.x - hw, c.y + hh * 0.2);
  p.closePath();
  return p;
}
