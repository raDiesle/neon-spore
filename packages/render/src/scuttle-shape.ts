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

/** How far the frame has drawn back up, in pixels, at `phase` of the wind-up. */
export function scuttleWindRise(l: Layout, phase: number): number {
  return l.tile * WIND_RISE * phase * phase;
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
 * frame on its way out.
 */
export function scuttlePlatePath(l: Layout, c: Point, open = 1): Path2D {
  const hw = l.tile * SOCKET_HALF_W * open;
  const hh = l.tile * SOCKET_HALF_H;
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
