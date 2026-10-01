import { hullRow, midCol, type SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE THROAT: the one boss the pair **works as a machine of its own**.
 *
 * Reworked on 1 October 2026, on the owner's word that the old fight — gums
 * flung into a mouth that slid on a clock — was hard to understand. The
 * picture stayed; the rules are new, and they fit in one sentence: *pump it
 * and it sucks, and it only swallows what its colour says.*
 *
 * **The cannon is gone for the fight.** In its place a gullet grows out of the
 * hull at the middle column and ends in a mouth, and the mouth is where the
 * two hands meet:
 *
 * - **Player 2 carries the mouth** anywhere over the field (`throatAimAt`),
 *   kept clear of the walls and the top so it is never cut off the screen.
 * - **Player 1 pumps it**, a stroke down and a stroke up and again, and the
 *   faster the strokes come the wider the circle round the mouth that pulls
 *   things in (`throatRadiusMilli`).
 * - **Each seat owns two of its four colours** (`THROAT_MODES`), the four the
 *   ordinary panel's columns stand for: red and cyan are player 2's as the two
 *   shots are, SHIELD and SUCK are player 1's as the shield and the maw are.
 *
 * A body inside the circle in the colour it answers to is swallowed and gone
 * — a slick in red, a bulb in cyan, a rock in SHIELD, a pod in SUCK — and every
 * swallow is one ring of the gullet's health (`throat-suck.ts`). A body in the
 * wrong colour shakes where it is and stays, and nobody is hurt: the mistake
 * costs time and nothing else.
 *
 * **Health is the five rings** (`throatRings`): each swallow slackens one, and
 * the fifth turns the tube through its own mouth. The rings are the bar, which
 * is THE QUEEN's bargain and the reason there is no other.
 *
 * **It is a fixture and not a body** (`bossFillsWave` is false for it):
 * nothing of it is among `world.creatures`, so it falls nothing and is never
 * hit. The hands are `throat-hand.ts`, the suck is `throat-suck.ts`, the beat
 * is `throat-step.ts`, the fingerprint is `throat-hash.ts` and the numbers are
 * `config-throat.ts`. This file is the shape and the questions asked of it.
 */

/**
 * The phases, in the order `throat-hash.ts` numbers them by — a list rather
 * than a bare union, because the index is a wire value.
 *
 * - `sucks` — the fight: carried, pumped and fed.
 * - `everts` — beaten. It pulls itself through its own mouth.
 */
export const THROAT_PHASES = ["sucks", "everts"] as const;

/** Where the fight is. */
export type ThroatPhase = (typeof THROAT_PHASES)[number];

/**
 * **The four colours the mouth can be set to**, in the order the hash numbers
 * them by: the panel's four columns, the two shots and then the two of player
 * 1's own (`throat-hand.ts` says which seat sets which).
 */
export const THROAT_MODES = ["red", "cyan", "shield", "suck"] as const;

/** One of the four. */
export type ThroatMode = (typeof THROAT_MODES)[number];

/** Everything THE THROAT remembers between ticks. */
export interface ThroatState {
  kind: "throat";
  phase: ThroatPhase;
  /** `world.beat` the current phase began on — the eversion's clock. */
  phaseBeat: number;
  /** Rings gone slack, 0 to `throatRings`: one for every right swallow. */
  slack: number;
  /** The beat it last swallowed something, -1 before the first. render/'s,
   * so the gulp is drawn off the world rather than off a clock a restart could
   * carry. */
  fedBeat: number;
  /**
   * The tick a body in the wrong colour was refused, -1 before the first, and
   * which one. render/'s for the shake, and the simulation's for the throttle:
   * a body sitting in the circle is refused once per `throatRefuseTicks` and
   * not sixty times a second (`throat-suck.ts`).
   */
  refusedTick: number;
  refusedId: number;
  /**
   * **Where the mouth is**, in thousandths of a tile from the field's top
   * left (column `c` is `c * 1000`), and player 2's whole job. Stored and not
   * derived: it is wherever her thumb last left it, kept inside
   * `throatAimAt`'s margins.
   */
  aimXMilli: number;
  aimYMilli: number;
  /**
   * Where the mouth stood when her thumb took hold, -1 when no thumb is on
   * it. A drag reports a displacement from where the press began
   * (`render/touch-move.ts`), so the mouth goes to anchor plus displacement and
   * a lifted thumb leaves it where it is.
   */
  aimFromXMilli: number;
  aimFromYMilli: number;
  /** The colour the mouth is set to. Red to begin with, the first shot. */
  mode: ThroatMode;
  /**
   * **The pump**: which way the current stroke is going (-1 up, 1 down, 0
   * before the first sample of a hold), the thumb's height the stroke is
   * measured from, and how hard it is pumped, 0 to 1000 (`throat-hand.ts`).
   */
  pumpDir: number;
  pumpFromYMilli: number;
  pumpMilli: number;
}

/** Rings still tight, which is the health left. */
export function throatRingsLeft(cfg: SimConfig, b: ThroatState): number {
  return Math.max(0, cfg.throatRings - b.slack);
}

/** Whether every ring is slack, which is the whole of being beaten. */
export function throatSpent(cfg: SimConfig, b: ThroatState): boolean {
  return b.slack >= cfg.throatRings;
}

/** Beats of the eversion left, 0 outside it. */
export function throatEvertBeatsLeft(cfg: SimConfig, b: ThroatState, beat: number): number {
  if (b.phase !== "everts") return 0;
  return Math.max(0, cfg.throatEvertBeats - (beat - b.phaseBeat));
}

/** The column the gullet grows out of the hull at: the middle, as the cannon
 * it stands in for starts there. */
export function throatHomeCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/**
 * **Where the mouth may stand**, the box `throatAimAt` keeps it in.
 *
 * Inside the side walls and under the top by a margin each, so the mouth and
 * its circle are never cut by the frame — the owner's own words, *leave some
 * space so it is not cut* — and never lower than the row above the hull, so
 * the gullet always has a length to draw.
 */
export function throatAimBox(cfg: SimConfig): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const minX = cfg.throatSideMarginMilli;
  const maxX = Math.max(minX, (cfg.cols - 1) * 1000 - cfg.throatSideMarginMilli);
  const minY = cfg.throatTopMarginMilli;
  const maxY = Math.max(minY, (hullRow(cfg) - 1) * 1000);
  return { minX, maxX, minY, maxY };
}

/** Put the mouth here, kept inside `throatAimBox`. */
export function throatAimAt(cfg: SimConfig, b: ThroatState, xMilli: number, yMilli: number): void {
  const box = throatAimBox(cfg);
  b.aimXMilli = Math.max(box.minX, Math.min(box.maxX, xMilli));
  b.aimYMilli = Math.max(box.minY, Math.min(box.maxY, yMilli));
}

/** The column the mouth is over, for the events' pan. */
export function throatMouthCol(b: ThroatState): number {
  return Math.round(b.aimXMilli / 1000);
}

/**
 * **How far round the mouth it pulls**, in thousandths of a tile, and 0 when
 * it is not pumped at all — a still pump sucks nothing, so the circle is the
 * pilot's to open and keep open.
 */
export function throatRadiusMilli(cfg: SimConfig, b: ThroatState): number {
  if (b.phase !== "sucks" || b.pumpMilli <= 0) return 0;
  const span = cfg.throatMaxRadiusMilli - cfg.throatMinRadiusMilli;
  return cfg.throatMinRadiusMilli + Math.floor((span * b.pumpMilli) / 1000);
}

/** The boss, if it is the one installed. Narrowing in one place. */
export function throatBoss(world: World): ThroatState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "throat" ? boss : null;
}
