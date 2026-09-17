import { type HiveState, hiveNext, hiveNextBeat, type SimConfig } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";

/**
 * **Where THE HIVE is**, in field pixels: the mass hung over the top of the
 * field above row 0, nearly the width of it, every site's centre along its
 * underside, how far the swelling one has bulged, and how far the whole has
 * closed on its way out.
 *
 * Its own file for THE SCUTTLE's reason (`scuttle-shape.ts`): the drawer
 * stands the body on these (`hive-draw.ts`), the transients throw their
 * bursts at them (`hive-fx.ts`), and a site placed in two files would be a
 * breach drawn on one line and its receipts thrown at another.
 *
 * **Nothing here is per seat.** The mass stands in the same place on both
 * screens with the same sites along it; the split is in what is drawn *in*
 * a site, and that is the drawer's (`view-role-clocks-b.ts`).
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * The underside's height above the grid, in tiles, and the mass's depth over
 * it; a site's radius. The top sits 1.55 tiles up, under the HUD's pills —
 * THE SCUTTLE's frame reaches 1.6 for the same reason (`scuttle-shape.ts`).
 */
const UNDER_RISE = 0.45;
const DEPTH = 1.1;
export const SITE_R = 0.3;
/** How far a swelling site bulges below the underside at its fullest, in tiles. */
const SWELL_DROP = 0.25;
/** How far the mass stands in from the field's two walls, in tiles. */
const INSET = 0.35;

/** The line of the underside, before any swell. */
export function hiveUnderY(l: Layout): number {
  return l.gridTop - l.tile * UNDER_RISE;
}

/** The centre of site `i`, on the underside. */
export function hiveSite(l: Layout, s: HiveState, i: number): Point {
  return { x: tileCX(l, s.cols[i] ?? 0), y: hiveUnderY(l) };
}

/** The mass's box: its left, right, top and bottom, nearly the width of the field. */
export function hiveBox(
  l: Layout,
  cfg: SimConfig,
): { left: number; right: number; top: number; bottom: number } {
  const pad = l.tile * INSET;
  return {
    left: tileCX(l, 0) - l.tile * 0.5 + pad,
    right: tileCX(l, cfg.cols - 1) + l.tile * 0.5 - pad,
    top: hiveUnderY(l) - l.tile * DEPTH,
    bottom: hiveUnderY(l),
  };
}

/**
 * The mass as a closed contour: a low dome of a top, flanks that sag out and
 * breathe, and an underside scalloped once a site — a row of hanging lobes
 * with a site in the belly of each, since a box across the field is a panel
 * and a lobed mass is a body (`CLAUDE.md`). `open` closes it in on the
 * middle, for the body on its way out.
 */
export function hiveMassPath(
  l: Layout,
  cfg: SimConfig,
  s: HiveState,
  open: number,
  time: number,
): Path2D {
  const box = hiveBox(l, cfg);
  const mid = (box.left + box.right) * 0.5;
  const hw = (box.right - box.left) * 0.5 * open;
  const top = box.top;
  const bottom = box.bottom;
  const flank = l.tile * (0.12 + 0.03 * Math.sin(time * 1.1));
  const dome = l.tile * 0.35;
  const lobe = l.tile * 0.14;
  const p = new Path2D();
  p.moveTo(mid - hw, top + dome);
  p.quadraticCurveTo(mid, top - dome * 0.6, mid + hw, top + dome);
  p.quadraticCurveTo(mid + hw + flank, (top + bottom) * 0.5, mid + hw, bottom - lobe);
  // One lobe a site, right to left in column order rather than opening
  // order, so the scallops sit still while the sites open under them.
  const xs = [...s.cols].sort((a, b) => a - b).map((c) => mid + (tileCX(l, c) - mid) * open);
  for (let i = xs.length - 1; i >= 0; i--) {
    const cx = xs[i] ?? mid;
    const x0 = i > 0 ? (cx + (xs[i - 1] ?? mid)) * 0.5 : mid - hw;
    p.quadraticCurveTo(cx, bottom + lobe, x0, bottom - lobe);
  }
  if (xs.length === 0) p.lineTo(mid - hw, bottom - lobe);
  p.quadraticCurveTo(mid - hw - flank, (top + bottom) * 0.5, mid - hw, top + dome);
  p.closePath();
  return p;
}

/**
 * How far through its swell the next site is, 0 at the first beat of the
 * warning and 1 at the opening; 0 while nothing is swelling. Read off the
 * clock rather than an event, so a frame is never a swell behind.
 */
export function hiveSwellPhase(
  s: HiveState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (hiveNext(s) < 0 || s.downBeat >= 0) return 0;
  const beats = Math.max(1, cfg.hiveSwellBeats);
  const from = hiveNextBeat(s, cfg) - cfg.hiveSwellBeats;
  return Math.min(1, Math.max(0, (beat - from + beatPhase) / beats));
}

/** How far a swelling site has bulged below the underside, in pixels, at `phase` of the swell. */
export function hiveSwellDrop(l: Layout, phase: number): number {
  return l.tile * SWELL_DROP * phase * phase;
}

/** What is left of the body on its way out, 1 while it hangs and 0 when it is gone. */
export function hiveFade(s: HiveState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.downBeat < 0) return 1;
  const beats = Math.max(1, cfg.hiveOutBeats);
  return Math.max(0, 1 - (beat - s.downBeat + beatPhase) / beats);
}

/**
 * A site as a closed shape: a lobe hanging off the underside, rounder than
 * it is wide, its top flat against the mass — a drop about to fall, so that
 * a row of them reads as the belly of the body and one bulging alone reads
 * as a thing about to open. `drop` hangs it lower; `open` narrows it, for
 * the body on its way out.
 */
export function hiveSitePath(l: Layout, c: Point, drop = 0, open = 1): Path2D {
  const r = l.tile * SITE_R * open;
  const y = c.y + drop;
  const p = new Path2D();
  p.moveTo(c.x - r, c.y - r * 0.3);
  p.lineTo(c.x + r, c.y - r * 0.3);
  p.quadraticCurveTo(c.x + r * 1.05, y + r * 0.9, c.x, y + r);
  p.quadraticCurveTo(c.x - r * 1.05, y + r * 0.9, c.x - r, c.y - r * 0.3);
  p.closePath();
  return p;
}

/** The breach inside an open site: the aperture, a ring in from the lobe's edge. */
export function hiveBreachPath(l: Layout, c: Point, open = 1): Path2D {
  const r = l.tile * SITE_R * 0.55 * open;
  const p = new Path2D();
  p.ellipse(c.x, c.y + r * 0.5, r, r * 0.8, 0, 0, Math.PI * 2);
  return p;
}

/** The scar a seal leaves: a stitched line across where the breach was. */
export function hiveScarPath(l: Layout, c: Point): Path2D {
  const r = l.tile * SITE_R * 0.6;
  const y = c.y + r * 0.5;
  const p = new Path2D();
  p.moveTo(c.x - r, y);
  p.lineTo(c.x + r, y);
  for (let i = -1; i <= 1; i++) {
    p.moveTo(c.x + i * r * 0.55, y - r * 0.35);
    p.lineTo(c.x + i * r * 0.55, y + r * 0.35);
  }
  return p;
}
