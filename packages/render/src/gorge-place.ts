import {
  type GorgeState,
  gorgeBottom,
  gorgeLevelOf,
  gorgeRowOf,
  midCol,
  type SimConfig,
} from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import type { Point } from "./outline-drift.js";

/**
 * **Where THE GORGE's bubbles hang**, asked by the picture, the rings and the
 * cues alike, so the bubble a thumb lands on is the bubble that was drawn.
 *
 * A row level hangs across the middle of the field on `gorgeRow`, a bubble
 * over each of its columns. A ring stands round a circle `gorgeRingRows`
 * tiles across, centred on the middle column at the same row, and the bubble
 * at its bottom is the one in `midCol` a row-and-a-ring lower — exactly where
 * `sim/gorge-step.ts` meets a shot (`gorgeColOf`, `gorgeRowOf`).
 *
 * **A ring swings round to its turn** over `SWING_BEATS`, from where it stood
 * before (`turnFrom`) through every bubble the turn skipped, eased so it
 * settles; asked with no `beats`, a bubble is where it has settled.
 *
 * The point returned is a bubble's **intake**, the bottom of it, where a shot
 * goes in: the bubble itself stands half a tile above, filling the tile of
 * the row it is met on.
 */

/** How far below its row's centre a bubble's intake is, in tiles. */
const INTAKE_DROP = 0.5;
/** How far past the bubbles the sack reaches, in tiles. */
const SACK_PAD = 0.7;
/** How far under an intake the pilot's count is written, in tiles. */
const TALLY_DROP = 0.14;
/** How far above an intake a row writes its place in the order, in tiles. */
const ORDER_RISE = 1.25;
/** How far beside a ring's bubble its place is written, outward from the middle, in tiles. */
const ORDER_SIDE = 0.85;
/** Beats a ring takes to swing round to its turn. */
const SWING_BEATS = 0.75;

/** Steps of the ring still to swing through at `beats` (the beat and its phase), 0 once settled. */
function swingLeft(g: GorgeState, beats: number): number {
  const t = Math.min(1, Math.max(0, (beats - g.turnBeat) / SWING_BEATS));
  const eased = 1 - (1 - t) ** 3;
  return (g.turn - g.turnFrom) * (1 - eased);
}

/** The ring's centre, on a ring level. */
function ringCentre(l: Layout, cfg: SimConfig): Point {
  return { x: tileCX(l, midCol(cfg)), y: tileCY(l, cfg.gorgeRow) };
}

/** Bubble `i`'s intake this frame; `beats` is the beat and its phase, or settled. */
export function gorgeBubbleAt(
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  i: number,
  beats = Number.POSITIVE_INFINITY,
): Point {
  if (!gorgeLevelOf(g).ring) {
    return { x: tileCX(l, g.col + i), y: tileCY(l, gorgeRowOf(cfg, g)) + l.tile * INTAKE_DROP };
  }
  const n = Math.max(1, g.intakes.length);
  const c = ringCentre(l, cfg);
  const r = l.tile * cfg.gorgeRingRows;
  const a = Math.PI / 2 + ((i - gorgeBottom(g) + swingLeft(g, beats)) * Math.PI * 2) / n;
  return { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r + l.tile * INTAKE_DROP };
}

/** Where the pilot's count under bubble `i` is written. */
export function gorgeTallyAt(
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  i: number,
  beats = Number.POSITIVE_INFINITY,
): Point {
  const p = gorgeBubbleAt(l, cfg, g, i, beats);
  return { x: p.x, y: p.y + l.tile * TALLY_DROP };
}

/**
 * Where the pilot reads bubble `i`'s place in the order: over it on a row;
 * beside it on a ring, on the side away from the middle, because round a
 * ring the bubble above stands where the number would.
 */
export function gorgeOrderAt(
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  i: number,
  beats = Number.POSITIVE_INFINITY,
): Point {
  const p = gorgeBubbleAt(l, cfg, g, i, beats);
  if (!gorgeLevelOf(g).ring) return { x: p.x, y: p.y - l.tile * ORDER_RISE };
  const side = p.x < ringCentre(l, cfg).x - 1 ? -1 : 1;
  return { x: p.x + side * l.tile * ORDER_SIDE, y: p.y - l.tile * 0.5 };
}

/**
 * The skin the bubbles hang in: across the row, or round the ring, as deep
 * as its breath makes it. `breath` is 0 at rest, which is how a caption asks
 * for it — a ring that pulsed with the sack would be one nobody could read.
 */
export function gorgeSackBox(
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  breath = 0,
): { x: number; y: number; rx: number; ry: number } {
  const swell = 1 + 0.08 * breath;
  if (gorgeLevelOf(g).ring) {
    const c = ringCentre(l, cfg);
    const r = (l.tile * cfg.gorgeRingRows + l.tile * SACK_PAD) * swell;
    return { x: c.x, y: c.y, rx: r, ry: r };
  }
  const left = tileCX(l, g.col);
  const right = tileCX(l, g.col + Math.max(0, g.intakes.length - 1));
  return {
    x: (left + right) / 2,
    y: tileCY(l, cfg.gorgeRow),
    rx: (right - left) / 2 + l.tile * SACK_PAD,
    ry: l.tile * 0.75 * swell,
  };
}
