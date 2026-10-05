import { midCol, type SimConfig, ticksPerBeat } from "./config.js";
import type { Bullet, Color, Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE FLUE: a slotted flue across the top of the field, and an ember running
 * along it from end to end and back, over the cannon held still under the
 * middle column (`docs/spec/bosses.md` §11.57, the owner's rework of 5
 * October 2026).
 *
 * **The rule is one sentence**: the one who sees the ember says *now*, and
 * the other shoots it as it runs over the cannon.
 *
 * **The split is the eyes.** Only the pilot is shown the ember; the
 * navigator, who has the trigger, is not (`render/view-role-clocks-c.ts`).
 * A bolt takes about a beat to climb to the flue and a beam a whole fill to
 * go off, so the word has to come early, by the shot's own delay and the
 * pair's.
 *
 * **It is levels, and they are its health.** Each one asks one weapon in one
 * colour, with the ember at its own speed and THE SLOW at its own strength,
 * and gives three shots for it. A shot is judged as it reaches the flue,
 * which no shot gets past: met over the ember in the asked weapon and colour,
 * the level is cleared; anything else spends a shot, and the last one spent
 * is the wave.
 * The next level starts with three again.
 *
 * `emberMilli` is where the ember is, in thousandths of a column off the
 * middle one, and it is **nobody's to move**: it is worked out every tick
 * from the ticks the level has run (`flueEmberAlong`), so a level always
 * starts it at the left end going right. The cannon is held on the middle
 * column the whole fight, or the pilot could slide it under the ember and
 * the beam, which burns the cannon's column the instant it goes off, would
 * need nobody's timing at all.
 */

export const FLUE_PHASES = ["slack", "lit", "rest", "spent"] as const;
export type FluePhase = (typeof FLUE_PHASES)[number];

/** The two shots the cannon has: a bolt that climbs, and the beam a held colour fills. */
export const FLUE_WEAPONS = ["bolt", "beam"] as const;
export type FlueWeapon = (typeof FLUE_WEAPONS)[number];

/** Why a shot spent one of the level's three. */
export const FLUE_MISSES = ["wide", "color", "weapon"] as const;
export type FlueMissWhy = (typeof FLUE_MISSES)[number];

/** One level, authored on the wave. */
export interface FlueLevel {
  weapon: FlueWeapon;
  color: Color;
  /** How far the ember runs a beat, thousandths of a column. */
  speedMilli: number;
  /** How fast THE SLOW plays the level, thousandths of the ordinary rate; 1000 is no slow at all. */
  slowMilli: number;
}

/** What a wave authors: the levels, in order. */
export interface FlueEntry {
  kind: "flue";
  levels: readonly FlueLevel[];
}

export interface FlueState {
  kind: "flue";
  /** Copied at install and never written again. */
  levels: FlueLevel[];
  phase: FluePhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The level lit, or the next to light. */
  cursor: number;
  /** Ticks the lit level's ember has run. */
  rollTicks: number;
  /** Where the ember is, thousandths of a column off the middle column. */
  emberMilli: number;
  /** Which way it runs: 1 toward the right, -1 toward the left. */
  emberDir: 1 | -1;
  /** Shots the lit level has left. */
  shots: number;
  /** Levels cleared. */
  hits: number;
}

export function flueBoss(world: World): FlueState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "flue" ? boss : null;
}

/** The level lit, or null between levels. */
export function flueLitLevel(s: FlueState): FlueLevel | null {
  return s.phase === "lit" ? (s.levels[s.cursor] ?? null) : null;
}

/** The level lit, or the one the flue is waiting to light; null once spent. */
export function flueShownLevel(s: FlueState): FlueLevel | null {
  return s.phase === "spent" ? null : (s.levels[s.cursor] ?? null);
}

/** The column the cannon is held on, and the one the ember must be over. */
export function flueCannonCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/**
 * Where the ember is after `ticks` of a level at `speedMilli` a beat: from
 * the left end to the right and back, turned off either end of
 * `flueSpanMilli`. Integers throughout, so both devices agree to the tick,
 * and pure, so AUTO can ask where it will be when a shot gets there.
 */
export function flueEmberAlong(
  cfg: SimConfig,
  speedMilli: number,
  ticks: number,
): { milli: number; dir: 1 | -1 } {
  const span = cfg.flueSpanMilli;
  const lap = 4 * span;
  const run = Math.floor((ticks * speedMilli) / ticksPerBeat(cfg)) % lap;
  return run < 2 * span
    ? { milli: run - span, dir: 1 }
    : { milli: span - (run - 2 * span), dir: -1 };
}

/** Whether the ember is over column `col`, near enough that a shot up it meets it. */
export function flueOver(cfg: SimConfig, s: FlueState, col: number): boolean {
  const at = (col - midCol(cfg)) * 1000;
  return Math.abs(s.emberMilli - at) <= cfg.flueHitMilli;
}

/** Whether a shot is the one the level asks: its weapon and its colour. */
export function flueMissWhy(
  level: FlueLevel,
  shot: Pick<Bullet, "color" | "lance">,
): FlueMissWhy | null {
  if ((level.weapon === "beam") !== shot.lance) return "weapon";
  return shot.color === level.color ? null : "color";
}

/** A slide of the cannon, refused while the flue is up: it is held under the middle. */
export function flueHoldsCannon(world: World, command: Command): boolean {
  return command.kind === "cannonCol" && flueBoss(world) !== null;
}

/** The flue spent: the fight is over. */
export function flueDone(s: FlueState): boolean {
  return s.phase === "spent";
}

/** A fresh flue: the ember at the left end, nothing cleared, a full level of shots. */
export function freshFlue(cfg: SimConfig, beat: number, levels: readonly FlueLevel[]): FlueState {
  return {
    kind: "flue",
    levels: levels.map((level) => ({ ...level })),
    phase: "slack",
    phaseBeat: beat,
    cursor: 0,
    rollTicks: 0,
    emberMilli: -cfg.flueSpanMilli,
    emberDir: 1,
    shots: cfg.flueShots,
    hits: 0,
  };
}
