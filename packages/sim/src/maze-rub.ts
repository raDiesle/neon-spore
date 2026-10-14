import type { SimConfig } from "./config.js";
import type { MazeState } from "./maze-state.js";

/**
 * **THE MAZE's heart, rubbed loose: how many turns each seat owes and has
 * made.**
 *
 * It was a shake until 14 October 2026 — both thumbs carrying the heart about
 * its room, counted in distance (the owner, 29 September 2026: *both players
 * need to pull it in any direction more like shaking*). The owner, 14 October
 * 2026, asked to make it the game's one RUB *to have less variants and
 * consistency*: the heart stays where it is, and what counts is how often a
 * thumb on it turns back (`render/rub-turns.ts`), as THE CAPSTAN's band and
 * THE VALVE's film count.
 *
 * **Half of it is each seat's.** A count either thumb could fill alone would
 * be a heart one player tears out while the other watches; `mazeHeartTurns`
 * in all, and each seat's own count has to reach half, is both.
 */

/** Each seat's half of the rub, in turns. */
export function mazeRubSeatTurns(cfg: SimConfig): number {
  return Math.ceil(cfg.mazeHeartTurns / 2);
}

/** Whether `seat` has rubbed its half: what a screen waits on the other seat for. */
export function mazeRubSeatDone(cfg: SimConfig, m: MazeState, seat: 1 | 2): boolean {
  return (m.gripTurns[seat - 1] ?? 0) >= mazeRubSeatTurns(cfg);
}

/** Turns the pair has made that count, each seat counted to its half. */
export function mazeRubDone(cfg: SimConfig, m: MazeState): number {
  const need = mazeRubSeatTurns(cfg);
  const [a = 0, b = 0] = m.gripTurns;
  return Math.min(a, need) + Math.min(b, need);
}

/** Whether both seats have rubbed their half. */
export function mazeRubbed(cfg: SimConfig, m: MazeState): boolean {
  return mazeRubSeatDone(cfg, m, 1) && mazeRubSeatDone(cfg, m, 2);
}
