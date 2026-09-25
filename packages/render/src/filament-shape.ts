import {
  type FilamentState,
  type FilamentTile,
  filamentsLeft,
  filamentTileAt,
  type SimConfig,
} from "@neon-spore/sim";
import { filamentHeartPoint, type Heart, type Point } from "./filament-heart.js";
import { type Circle, type Layout, tileCX, tileCY } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **Where THE FILAMENT is**, in field pixels: every tile of the armed
 * filament at its tile's centre, the lead from its root into the heart
 * (`filament-heart.ts`), the two grab rings on the head and the tail, and how far through
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

export type { Point };

/** A grab ring's radius, in tiles — THE INSTAR's marks are 0.3 (`instar-shape.ts`). */
export const GRAB_R = 0.34;
/** How far a pulled filament slides up into the body over the pull, in tiles. */
const PULL_RISE = 2.5;

/** The centre of a tile of the field. */
export function filamentPoint(l: Layout, tile: FilamentTile): Point {
  return { x: tileCX(l, tile.col), y: tileCY(l, tile.row) };
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

/** The lead: from the filament's root up into the heart's point, where the vein goes in. */
export function filamentLeadPath(l: Layout, s: FilamentState, heart: Heart): Path2D | null {
  const tiles = s.tiles[s.cursor];
  const root = tiles?.[tiles.length - 1];
  if (root === undefined) return null;
  const at = filamentPoint(l, root);
  const tip = filamentHeartPoint(heart);
  const p = new Path2D();
  p.moveTo(at.x, at.y);
  p.bezierCurveTo(at.x, (at.y + tip.y) * 0.5, tip.x, at.y, tip.x, tip.y);
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
