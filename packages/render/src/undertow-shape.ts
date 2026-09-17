import {
  type SimConfig,
  type UndertowBreach,
  type UndertowState,
  undertowBowBeats,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * THE UNDERTOW's geometry: how far a plate has risen, how high a lobe stands,
 * how wide a breach is, and how far through it the body is.
 *
 * Every number here is read off the boss and the beat, none is kept between
 * frames, and every count it reads against is a `SimConfig` field the pair
 * can be told (`sim/config-undertow.ts`) — so the bow the pilot watches
 * deepen is deepening on the same beats the lobe is counting down, and THE
 * SLOW that opens on the last one slows this too, for free: `beatPhase` is
 * the slowed clock. What the numbers are *drawn as* is `undertow-draw.ts`
 * and `undertow-lobe.ts`; this is the arithmetic the tests can ask about
 * without a canvas (`undertow-shape.test.ts`).
 *
 * The heights are in tiles and not pixels: the layout hands the tile down at
 * the one place a shape becomes a path.
 */

/** How high a fully bowed plate stands off the skin, in tiles: a few tenths. */
export const BOW_TILES = 0.35;
/** A lobe standing in its breach, above the skin. The design's *a tile*. */
export const LOBE_TILES = 1;
/** A tall one — *three tiles high, too big for the maw*. */
export const TALL_TILES = 3;
/** What the last lobe grows to while it stands and is not withdrawing. */
export const LAST_TILES = 2;
/** Half a plate's width over an unwidened breach, in tiles: the column and a shoulder. */
export const PLATE_HALF = 0.55;
/** How far past the hull line the body reaches at the top of its pass, in tiles. */
export const BODY_TILES = 2.4;

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** Beats since a breach's stage began, with the frame's fraction of the current one. */
export function sinceStage(b: UndertowBreach, beat: number, beatPhase: number): number {
  return beat - b.stageBeat + beatPhase;
}

/**
 * How far a bowing plate has risen, 0 to 1 — 1 the beat the lobe is through
 * and for as long as it stands. The count is the phase's, because the seat
 * push bows for two beats and the last for four (`undertowBowBeats`).
 */
export function bowLift(
  cfg: SimConfig,
  u: UndertowState,
  b: UndertowBreach,
  beat: number,
  beatPhase: number,
): number {
  if (b.stage !== "bowing") return 1;
  return smoothstep(sinceStage(b, beat, beatPhase) / undertowBowBeats(cfg, u.phase));
}

/**
 * How high the lobe stands above the skin, in tiles; 0 while the plate is
 * still bowing. A plain one takes the beat it stands on to come up, a tall one
 * *comes up fast* — half that — and the last one keeps growing for as long as
 * it stands, which is the design's *it stands, growing, and behind it the
 * whole body is coming*.
 */
export function lobeHeight(
  cfg: SimConfig,
  u: UndertowState,
  b: UndertowBreach,
  beat: number,
  beatPhase: number,
): number {
  if (b.stage !== "standing") return 0;
  const since = sinceStage(b, beat, beatPhase);
  const full = b.tall ? TALL_TILES : LOBE_TILES;
  const rise = smoothstep(since / (b.tall ? 0.5 : 1));
  if (u.phase !== "last") return full * rise;
  return full * rise + (LAST_TILES - full) * clamp01(since / cfg.undertowLastBeats);
}

/** Half the breach's width in tiles: the plate over its column, plus what it has spread. */
export function breachHalf(b: UndertowBreach): number {
  return PLATE_HALF + b.widthMilli / 1000;
}

/**
 * How lit the whole edge is, 0 to 1: nothing through the first four parts,
 * every seam brightening with the rise before the last lobe, full while it
 * stands, and going out as the body goes down and the hull closes over it.
 */
export function edgeLight(
  cfg: SimConfig,
  u: UndertowState,
  beat: number,
  beatPhase: number,
): number {
  if (u.phase === "taken") {
    return 1 - clamp01((beat - u.phaseBeat + beatPhase) / cfg.undertowDownBeats);
  }
  if (u.phase !== "last") return 0;
  const b = u.breaches[0];
  return b === undefined ? 0 : bowLift(cfg, u, b, beat, beatPhase);
}

/**
 * How far through its pass the body is, 0 to 1, or -1 outside the taking.
 * The pass is `undertowDownBeats` long because that is how long the sim keeps
 * the boss installed after the swallow, so the picture has the whole of the
 * body going in before the wave is allowed to end (`undertow-step.ts`).
 */
export function bodyPass(
  cfg: SimConfig,
  u: UndertowState,
  beat: number,
  beatPhase: number,
): number {
  if (u.phase !== "taken") return -1;
  return clamp01((beat - u.phaseBeat + beatPhase) / cfg.undertowDownBeats);
}

/**
 * How much of the body stands above the hull line at one point of its pass,
 * in tiles. Up and then down: it comes through the breach, and the ship takes
 * it in, and a body that only went up would be a boss leaving rather than one
 * taken. Zero at both ends so the field is empty before and after.
 */
export function bodyHeight(pass: number): number {
  return pass < 0 ? 0 : BODY_TILES * Math.sin(pass * Math.PI);
}
