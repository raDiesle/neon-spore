import {
  type FilamentState,
  type FilamentTile,
  filamentsLeft,
  filamentTileAt,
  type SimConfig,
} from "@neon-spore/sim";
import { type Circle, type Layout, tileCX, tileCY } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **Where THE FILAMENT is**, in field pixels: the body hung over the top of
 * the field above row 0 — a bundle, one strand a filament still in it, that
 * narrows as they are pulled — every tile of the armed filament at its tile's
 * centre, the two grab rings on the head and the tail, and how far through
 * its arm, its pull and its going the scene is.
 *
 * Its own file for THE HIVE's reason (`hive-shape.ts`): the drawer stands
 * the picture on these (`filament-draw.ts`), the transients throw their
 * bursts at them (`filament-fx.ts`), and the hit test answers a thumb at
 * the same ring the picture draws (`filament-grip.ts`).
 *
 * **Nothing here is per seat.** The filament runs through the same tiles on
 * both screens; which of them a screen is shown is the drawer's
 * (`view-role-clocks-b.ts`).
 */

export interface Point {
  x: number;
  y: number;
}

/** The underside's height above the grid, in tiles, and the body's depth over it. */
const UNDER_RISE = 0.45;
const DEPTH = 1.0;
/** The body's half-width with nothing in it, and what every strand adds, in tiles. */
const BODY_HALF = 0.55;
const STRAND_HALF = 0.32;
/** A grab ring's radius, in tiles — THE INSTAR's marks are 0.3 (`instar-shape.ts`). */
export const GRAB_R = 0.34;
/** How far a pulled filament slides up into the body over the pull, in tiles. */
const PULL_RISE = 2.5;

/** The centre of a tile of the field. */
export function filamentPoint(l: Layout, tile: FilamentTile): Point {
  return { x: tileCX(l, tile.col), y: tileCY(l, tile.row) };
}

/** The line of the body's underside. */
export function filamentUnderY(l: Layout): number {
  return l.gridTop - l.tile * UNDER_RISE;
}

/** How many strands the body has in it this frame: the pulled one leaving over the pull. */
export function filamentStrands(
  s: FilamentState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return Math.max(0, filamentsLeft(s) - filamentPullPhase(s, cfg, beat, beatPhase));
}

/** The body's box over the middle of the field, as wide as its strands make it. */
export function filamentBox(
  l: Layout,
  cfg: SimConfig,
  strands: number,
): { left: number; right: number; top: number; bottom: number; mid: number } {
  const mid = (tileCX(l, 0) + tileCX(l, cfg.cols - 1)) * 0.5;
  const hw = l.tile * (BODY_HALF + STRAND_HALF * strands);
  const bottom = filamentUnderY(l);
  return { left: mid - hw, right: mid + hw, top: bottom - l.tile * DEPTH, bottom, mid };
}

/** The middle of the body's underside, where the receipts with no tile burst. */
export function filamentBodyPoint(l: Layout, cfg: SimConfig): Point {
  const box = filamentBox(l, cfg, 0);
  return { x: box.mid, y: box.bottom };
}

/**
 * The body as a closed contour: a low dome of a top, flanks that breathe,
 * and an underside sagging once a strand — a bundle seen end-on, since a
 * box across the field is a panel and a lobed mass is a body (`CLAUDE.md`).
 */
export function filamentBodyPath(l: Layout, cfg: SimConfig, strands: number, time: number): Path2D {
  const box = filamentBox(l, cfg, strands);
  const hw = (box.right - box.left) * 0.5;
  const flank = l.tile * (0.1 + 0.03 * Math.sin(time * 1.3));
  const dome = l.tile * 0.3;
  const sag = l.tile * 0.12;
  const n = Math.max(1, Math.ceil(strands));
  const p = new Path2D();
  p.moveTo(box.mid - hw, box.top + dome);
  p.quadraticCurveTo(box.mid, box.top - dome * 0.6, box.mid + hw, box.top + dome);
  p.quadraticCurveTo(
    box.mid + hw + flank,
    (box.top + box.bottom) * 0.5,
    box.mid + hw,
    box.bottom - sag,
  );
  for (let i = n; i >= 1; i--) {
    const x1 = box.mid - hw + ((i - 1) / n) * hw * 2;
    const cx = box.mid - hw + ((i - 0.5) / n) * hw * 2;
    p.quadraticCurveTo(cx, box.bottom + sag, x1, box.bottom - sag);
  }
  p.quadraticCurveTo(
    box.mid - hw - flank,
    (box.top + box.bottom) * 0.5,
    box.mid - hw,
    box.top + dome,
  );
  p.closePath();
  return p;
}

/** Strand `i` of `n` inside the body: a line from the top down to its lobe of the underside. */
export function filamentStrandInBody(
  l: Layout,
  cfg: SimConfig,
  strands: number,
  i: number,
  time: number,
): Point[] {
  const box = filamentBox(l, cfg, strands);
  const n = Math.max(1, Math.ceil(strands));
  const x = box.left + ((i + 0.5) / n) * (box.right - box.left);
  const sway = l.tile * 0.08 * Math.sin(time * 1.7 + i);
  return [
    { x, y: box.top + l.tile * 0.25 },
    { x: x + sway, y: (box.top + box.bottom) * 0.5 },
    { x, y: box.bottom - l.tile * 0.05 },
  ];
}

/**
 * The run of the armed filament from tile `from` to tile `to`, through the
 * tile centres, as a soft curve rather than a chain of right angles — a
 * filament is a thread, not wiring. `rise` lifts the whole run, for the pull.
 */
export function filamentRunPath(
  l: Layout,
  s: FilamentState,
  from: number,
  to: number,
  rise = 0,
): Path2D | null {
  const pts: Point[] = [];
  for (let i = from; i <= to; i++) {
    const tile = filamentTileAt(s, i);
    if (tile === null) break;
    const p = filamentPoint(l, tile);
    pts.push({ x: p.x, y: p.y - rise * l.tile });
  }
  if (pts.length < 2) return null;
  return splinePath(pts, false);
}

/** The lead: from the filament's root up into the body, where the rest of it is. */
export function filamentLeadPath(l: Layout, cfg: SimConfig, s: FilamentState): Path2D | null {
  const tiles = s.tiles[s.cursor];
  const root = tiles?.[tiles.length - 1];
  if (root === undefined) return null;
  const at = filamentPoint(l, root);
  const under = filamentUnderY(l);
  const p = new Path2D();
  p.moveTo(at.x, at.y);
  p.quadraticCurveTo(
    at.x,
    (at.y + under) * 0.5,
    at.x + l.tile * 0.2 * (at.x < filamentBox(l, cfg, 0).mid ? 1 : -1),
    under,
  );
  return p;
}

/** The ring a thumb takes hold at: the pilot's on the head, the navigator's on the tail. */
export function filamentGrabCircle(l: Layout, s: FilamentState, seat: 1 | 2): Circle | null {
  const tile = filamentTileAt(s, seat === 1 ? s.head : s.tail);
  if (tile === null) return null;
  const at = filamentPoint(l, tile);
  return { x: at.x, y: at.y, r: l.tile * GRAB_R };
}

/** How far through the arm the free end has pulsed, 0..1; 0 outside the arm. */
export function filamentArmPhase(
  s: FilamentState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "arm") return 0;
  const beats = Math.max(1, cfg.filamentArmBeats);
  return Math.min(1, Math.max(0, (beat - s.phaseBeat + beatPhase) / beats));
}

/** How far out of the body the pulled filament is, 0..1; 0 outside the pull. */
export function filamentPullPhase(
  s: FilamentState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "pull") return 0;
  const beats = Math.max(1, cfg.filamentPullBeats);
  return Math.min(1, Math.max(0, (beat - s.phaseBeat + beatPhase) / beats));
}

/** How far up the pulled filament has slid at `pull` of the pull, in tiles. */
export function filamentPullRise(pull: number): number {
  return PULL_RISE * pull * pull;
}

/** What is left of the body on its way out, 1 while it hangs and 0 when it is gone. */
export function filamentFade(
  s: FilamentState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "down") return 1;
  const beats = Math.max(1, cfg.filamentOutBeats);
  return Math.max(0, 1 - (beat - s.phaseBeat + beatPhase) / beats);
}
