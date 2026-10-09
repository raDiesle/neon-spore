import {
  type ScuttleState,
  type SimConfig,
  scuttleCadence,
  scuttleSocketCol,
  scuttleSocketRow,
  scuttleWindBeats,
  scuttleWinding,
} from "@neon-spore/sim";
import { headroomDrop } from "./headroom.js";
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
 * pitch, with the frame's pad (`SCUTTLE_FRAME`), put the top of its arch just
 * over 3 tiles above the grid: the rows stand apart, as the owner asked on 9
 * October 2026 (VERSUS `scuttle:seat`, `lobed`), and on a 390-wide phone
 * the frame drawn back on a wind-up still stops under the HUD's pills.
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
export const SCUTTLE_ROWS: ScuttleRows = { rise: 0.46, pitch: 1.05, drop: 0.26 };
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
/**
 * The frame's pad round its sockets, in tiles: beyond the outer columns'
 * sockets, and above its top row's and below its bottom row's — wide enough
 * that a lobe (`scuttle-seat-lobed.ts`) sits inside the slab's arch with rock
 * round it.
 */
export interface ScuttleFrame {
  padX: number;
  padY: number;
}
export const SCUTTLE_FRAME: ScuttleFrame = { padX: 0.8, padY: 0.36 };

/**
 * How far the frame stands above row 0 at its highest, in tiles: its top row,
 * that row's plate and pad, and the whole wind-up — so on a stage short of room
 * the frame comes down by what it is short (`headroomDrop`), and even drawn back
 * it is never off the top of the canvas.
 */
function scuttleHeadroom(cfg: SimConfig): number {
  const rows = SCUTTLE_ROWS.rise + (cfg.scuttleRows - 1) * SCUTTLE_ROWS.pitch;
  return rows + SOCKET_HALF_H + SCUTTLE_FRAME.padY + WIND_RISE;
}

/** Where row 0's top edge stands for the frame: the grid's, or lower where the stage is short of room. */
export function scuttleTop(l: Layout, cfg: SimConfig): number {
  return l.gridTop + headroomDrop(l, scuttleHeadroom(cfg));
}

/** The centre of socket `i`'s row, before any wind-up. */
export function scuttleRowY(l: Layout, cfg: SimConfig, i: number): number {
  const fromBottom = cfg.scuttleRows - 1 - scuttleSocketRow(cfg, i);
  return scuttleTop(l, cfg) - l.tile * (SCUTTLE_ROWS.rise + fromBottom * SCUTTLE_ROWS.pitch);
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
  const padX = l.tile * (SOCKET_HALF_W + SCUTTLE_FRAME.padX);
  const padY = l.tile * (SOCKET_HALF_H + SCUTTLE_FRAME.padY);
  return { left: first.x - padX, right: last.x + padX, top: first.y - padY, bottom: last.y + padY };
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
