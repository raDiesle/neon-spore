import type { World } from "./world.js";

/**
 * THE CANDLE: whether you can act in the dark.
 *
 * **The question no other boss asks** — *what the pair does when they cannot
 * see the field.* Every wave in this game is fully lit; this one takes the
 * picture away, and the only light in it is the pair's own weapons — a muzzle
 * flash, a shield flash, the beam — each drawn on the screen of the seat
 * whose control made it (`docs/spec/bosses-choreographed.md` §14).
 *
 * **The simulation does not know the field is dark.** The design says so in
 * as many words: the darkness, the flashes, the after-image are all render's
 * work and cost nothing here. What the simulation keeps is the one thing in
 * the dark that is *a rule* rather than a picture — the boss itself:
 *
 * - **Health is its glow**, five steps, one lost a hit, and the fight is over
 *   at none. The glow hangs above the grid like THE DIASTOLE's twin lobe, in
 *   one column, and is struck by a shot leaving the top of that column
 *   (`candle-step.ts`, `bullets.ts`, `lance-burn.ts`). Either colour lands:
 *   the pair cannot see it well enough for a colour rule to be fair.
 * - **It drifts**, a column at a time, so the column to fire up is one the
 *   pair has to keep finding in the dark.
 * - **It faces a column**, which player 1 can see and player 2 cannot, and
 *   from `candleEatSteps` down it **eats a flash fired from that column**: no
 *   bolt leaves the muzzle, nothing is lit, and the swallowed light puts a
 *   step back on its glow. The beam is not eaten. Firing from a column the
 *   boss is not facing is the answer, and only he knows which that is.
 * - **At the last step it stops** moving and eating, and **no shot will put
 *   it out**. The pilot pulls the flame down off the wick with his thumb
 *   (`candle-hand.ts`); the wick is then left smoking, and the navigator has
 *   `candleSmokeBeats` to stand the beam in it before it lights again. Two
 *   gestures, one seat each, and neither is the trigger the first three
 *   phases are played with (`.claude/skills/new-boss` §6.2).
 *
 * **It is a fixture and not a body** (`bossFillsWave`): nothing of it falls,
 * and the arrivals under it are the ones the wave's own author wrote.
 *
 * The clock is `candle-step.ts`, the fingerprint `candle-hash.ts`, the
 * numbers `config-candle.ts`. This file is the shape and the questions asked
 * of it.
 */

/**
 * The phases, in the order `candle-hash.ts` numbers them by. A list rather
 * than a bare union for `UNDERTOW_PHASES`' reason: the index is a wire value.
 *
 * - `dark` — the light is going out; the glow is full and does not move yet.
 * - `full` — the glow drifts and the pair fires at it.
 * - `eating` — it faces a column and eats the flashes fired from it.
 * - `last` — one step left; it stands still, eats nothing, and takes no shot.
 * - `smoking` — the flame is pulled off the wick. The beam is the only thing
 *   that reaches what is left, and it lights again if the beam is late.
 * - `out` — the last step is gone. The frame is black; the boss is beaten.
 *
 * `smoking` is inserted before `out` rather than appended after it, so the
 * list still reads in the order the fight is played. Nothing stores an index
 * across a build — the wire carries the name and `candle-hash.ts` numbers by
 * this list on both devices at once — so the order is the reader's and not a
 * version's.
 */
export const CANDLE_PHASES = ["dark", "full", "eating", "last", "smoking", "out"] as const;

export type CandlePhase = (typeof CANDLE_PHASES)[number];

/** Everything THE CANDLE remembers between beats. */
export interface CandleState {
  kind: "candle";
  phase: CandlePhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** Steps of glow left: the boss's health, and the only steady light in the field. */
  glow: number;
  /** The column the glow hangs over, and the one a shot reaches it up. */
  col: number;
  /** The column it faces: the one it eats flashes from, on player 1's screen alone. */
  faceCol: number;
  /** `world.beat` it last drifted on. */
  moveBeat: number;
  /** `world.beat` it last turned on. */
  turnBeat: number;
  /**
   * How far the pilot's thumb has pulled the flame down off the wick, in
   * thousandths of a tile, never past `candlePinchMilli` and zero whenever
   * no thumb is on it (`candle-hand.ts`). Only ever anything else in `last`.
   */
  pinchMilli: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than five. */
export function candleBoss(world: World): CandleState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "candle" ? boss : null;
}

/** Whether it is eating flashes from the column it faces on this phase. */
export function candleEating(c: CandleState): boolean {
  return c.phase === "eating";
}

/** Whether the glow still drifts: not while the light is going out, and not at the last step. */
export function candleMoving(c: CandleState): boolean {
  return c.phase === "full" || c.phase === "eating";
}

/**
 * Whether the flame is there to be pulled: the last step, and only it. Asked
 * by the hand and by the picture, so the thumb is answered on the one phase
 * the field has a word on (`candle-hand.ts`, `boss-cue-read-m.ts`).
 */
export function candleWicked(c: CandleState): boolean {
  return c.phase === "last";
}

/**
 * Whether the wick is smoking: the flame is off and the beam has not landed.
 * This is the one phase a bolt does nothing in and the beam does everything.
 */
export function candleSmoking(c: CandleState): boolean {
  return c.phase === "smoking";
}
