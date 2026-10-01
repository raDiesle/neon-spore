import type { SimConfig, UndertowLobe, UndertowState } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * THE UNDERTOW's geometry: how far a plate has risen, how high a lobe stands,
 * and how far the level's ebb has taken it back down.
 *
 * Every number here is read off the boss and the beat, none is kept between
 * frames, and every count it reads against is a `SimConfig` field the pair
 * can be told (`sim/config-undertow.ts`) — so the bow the pilot watches
 * deepen is deepening on the same beats the lobe is counting down. What the
 * numbers are *drawn as* is `undertow-draw.ts` and `undertow-lobe.ts`; this
 * is the arithmetic the tests can ask about without a canvas
 * (`undertow-shape.test.ts`).
 *
 * The heights are in tiles and not pixels: the layout hands the tile down at
 * the one place a shape becomes a path — and at `undertowEdgeBox`, the edge a
 * caption stands round, which is a box and not a path.
 */

/** How high a fully bowed plate stands off the skin, in tiles: a few tenths. */
export const BOW_TILES = 0.35;
/** A lobe standing, above the skin: twice the tile it stood before the rework. */
export const LOBE_TILES = 2;
/** A lobe left standing past its count — twice again, and only a tap brings it down. */
export const TALL_TILES = 4;
/** Half a plate's width over a lobe, in tiles: the column and a shoulder. */
export const PLATE_HALF = 0.55;

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** Beats since a lobe's stage began, with the frame's fraction of the current one. */
export function sinceStage(b: UndertowLobe, beat: number, beatPhase: number): number {
  return beat - b.stageBeat + beatPhase;
}

/**
 * How far a bowing plate has risen, 0 to 1 — 1 the beat the lobe is through
 * and for as long as it stands.
 */
export function bowLift(cfg: SimConfig, b: UndertowLobe, beat: number, beatPhase: number): number {
  if (b.stage !== "bowing") return 1;
  return smoothstep(sinceStage(b, beat, beatPhase) / cfg.undertowBowBeats);
}

/**
 * How much of the level's ebb is left, 1 down to 0: every lobe still up when
 * the clock runs out shrinks back into the floor over `undertowEbbBeats`.
 */
export function ebbLeft(cfg: SimConfig, u: UndertowState, beat: number, beatPhase: number): number {
  if (u.ebbBeat < 0) return 1;
  return 1 - smoothstep(clamp01((beat - u.ebbBeat + beatPhase) / cfg.undertowEbbBeats));
}

/**
 * How high the lobe stands above the skin, in tiles; 0 while the plate is
 * still bowing. A standing one takes a beat to come up; a tall one grows
 * from the standing height over a beat, and a tapped one falls back the same
 * way — the stage restarts, so it rises from `TALL_TILES` down to
 * `LOBE_TILES`, which is the tap seen to land.
 */
export function lobeHeight(
  cfg: SimConfig,
  u: UndertowState,
  b: UndertowLobe,
  beat: number,
  beatPhase: number,
): number {
  if (b.stage === "bowing") return 0;
  const rise = smoothstep(clamp01(sinceStage(b, beat, beatPhase)));
  const grown = TALL_TILES - LOBE_TILES;
  let h = LOBE_TILES * rise;
  if (b.stage === "tall") h = LOBE_TILES + grown * rise;
  else if (b.tapped === true) h = TALL_TILES - grown * rise;
  return h * ebbLeft(cfg, u, beat, beatPhase);
}

/** How much of a tile a lobe is worth above and below the edge it is in. */
const EDGE_R = 0.5;

/**
 * The edge round `shown` lobes, a plate wide each and reaching up to the
 * tallest of them — a standing lobe is above the skin, so the box does not
 * sit flat on the line. Null with none. What the caption rings
 * (`caption-anchor-boss-e.ts`) stand round.
 */
export function undertowEdgeBox(
  l: Layout,
  cfg: SimConfig,
  u: UndertowState,
  shown: readonly UndertowLobe[],
  beat: number,
  beatPhase: number,
): { x: number; y: number; rx: number; ry: number } | null {
  if (shown.length === 0) return null;
  const left = Math.min(...shown.map((b) => tileCX(l, b.col))) - PLATE_HALF * l.tile;
  const right = Math.max(...shown.map((b) => tileCX(l, b.col))) + PLATE_HALF * l.tile;
  const rise = Math.max(...shown.map((b) => lobeHeight(cfg, u, b, beat, beatPhase))) * l.tile;
  return {
    x: (left + right) * 0.5,
    y: l.hullY - rise * 0.5,
    rx: (right - left) * 0.5,
    ry: l.tile * EDGE_R + rise * 0.5,
  };
}
