import { see, view } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import { HEART_LENS, HEART_PITCH } from "./filament-heart-look.js";
import { APEX, APEX_X, HEART_TOP } from "./filament-heart-rig.js";
import { lubDub } from "./heartbeat.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **Where THE FILAMENT's heart is**, in field pixels — the owner, 25
 * September 2026: *its the inner of its body … the hearth inside*. The body
 * over the top of the field is the alien's heart, hung from its vessels above
 * the grid with its apex in the top rows, which no filament reaches (the
 * scripts' roots are rows 4 to 6). Every filament is a vein that goes in at
 * the apex, and a vessel on its muscle stands for each one still to be
 * traced, so it shrinks by one as each is pulled — the health the bundle
 * used to show.
 *
 * The organ is `filament-heart-rig.ts`, drawn by `filament-heart-look.ts`;
 * this places it, sizes it and beats it. It is its own file for the reason
 * `filament-shape.ts` is: the drawer, the bursts and the lead all stand on it.
 */

export interface Point {
  x: number;
  y: number;
}

/** The heart as it hangs this frame: its centre, and its two radii. */
export interface Heart {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

/** How far above the grid the atria reach, in tiles: little, so the vessels over them have room under the chrome. */
const TOP_RISE = 0.73;
/** The heart's radius with no filament left in it, and what each one adds, in tiles. */
const EMPTY_R = 0.9;
const VEIN_R = 0.12;
/** The muscle is taller than wide; `ry` is what the aim and the bursts read as its height. */
const ASPECT = 1.1;
/** How far the heart swells on the lub of a beat (`heartbeat.ts`). */
const LUB = 0.04;

/** The heart with `strands` filaments left in it, hung from the same height as it shrinks. */
export function filamentHeart(l: Layout, cfg: SimConfig, strands: number, beatPhase = 0): Heart {
  const x = (tileCX(l, 0) + tileCX(l, cfg.cols - 1)) * 0.5;
  const rx = l.tile * (EMPTY_R + VEIN_R * strands);
  const y = l.gridTop - l.tile * TOP_RISE + HEART_TOP * rx;
  const swell = 1 + LUB * lubDub(beatPhase);
  return { x, y, rx: rx * swell, ry: rx * ASPECT * swell };
}

/**
 * The heart's apex, where every vein goes in: the rig's apex as the heart is
 * looked at, square on. Its idle sway turns about a line through the apex's
 * own depth, so the point barely moves while the rest of the organ turns.
 */
export function filamentHeartPoint(h: Heart): Point {
  const s = see(
    { x: APEX_X * h.rx, y: APEX * h.rx, z: 0 },
    view(0, HEART_PITCH, h.rx * HEART_LENS),
  );
  return { x: h.x + s.x, y: h.y + s.y };
}

/** The middle of the heart once it is empty, where the receipts with no tile burst. */
export function filamentBodyPoint(l: Layout, cfg: SimConfig): Point {
  const h = filamentHeart(l, cfg, 0);
  return { x: h.x, y: h.y };
}
