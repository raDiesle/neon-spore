import type { SimConfig } from "./config.js";
import { isqrt } from "./handle-pull.js";
import { mazeRadiusMilli } from "./maze.js";
import { type MazeState, mazeCurrent } from "./maze-state.js";
import { mazeCircleMilli } from "./maze-wheel.js";

/**
 * **THE MAZE's heart, shaken loose: where it may go and how far it has been.**
 *
 * The owner, 29 September 2026: *both players need to pull it in any
 * direction more like shaking, which distance with one pull is limited with
 * the inner available space … total distance to pull forth and back is around
 * 8 times the width of inner circle.* So the heart is one body under two
 * thumbs. Either seat's thumb carries it by the change in its own
 * displacement (`maze-hand.ts`), any way at all, and it stops at the wall of
 * its room — `mazeHeartFreeMilli` of the room's radius from the middle. What
 * counts is how far the heart actually went: a thumb pushed on into the wall
 * moves nothing and earns nothing, so the only way to add distance is to come
 * back the other way.
 *
 * **Half of it is each seat's.** A total either thumb could fill alone would
 * be a heart one player tears out while the other watches; `mazeShakeWidths`
 * room widths in all, and each seat's own count has to reach half, is both.
 *
 * Integers throughout, and lengths by `isqrt` — `Math.hypot` is banned in
 * the simulation for the reason `handle-pull.ts` gives.
 */

/** The heart's room, in thousandths of a tile: the drum's innermost circle. */
export function mazeRoomMilli(cfg: SimConfig, m: MazeState): number {
  const wheel = mazeCurrent(m);
  if (wheel === null) return 0;
  return Math.round((mazeRadiusMilli(cfg) * mazeCircleMilli(wheel, 0)) / 1000);
}

/** How far the heart's middle may stand from the room's, in thousandths of a tile. */
export function mazeShakeFreeMilli(cfg: SimConfig, m: MazeState): number {
  return Math.round((mazeRoomMilli(cfg, m) * cfg.mazeHeartFreeMilli) / 1000);
}

/** Each seat's half of the shake, in thousandths of a tile: `widths` room diameters, halved. */
export function mazeShakeSeatMilli(cfg: SimConfig, m: MazeState): number {
  return mazeRoomMilli(cfg, m) * cfg.mazeShakeWidths;
}

/** How far through the shake the pair is, 0..1000, each seat counted to its half. */
export function mazeShakeThrough(cfg: SimConfig, m: MazeState): number {
  const need = mazeShakeSeatMilli(cfg, m);
  if (need <= 0) return 0;
  const [a = 0, b = 0] = m.gripShookMilli;
  return Math.round(((Math.min(a, need) + Math.min(b, need)) * 1000) / (2 * need));
}

/** Whether both seats have shaken their half. */
export function mazeShaken(cfg: SimConfig, m: MazeState): boolean {
  const need = mazeShakeSeatMilli(cfg, m);
  return need > 0 && m.gripShookMilli.every((d) => d >= need);
}

/** Far past any finger on a phone, and far inside `isqrt`'s ceiling squared. */
const STEP_CAP = 20_000;

/**
 * Carry the heart by `(dx, dy)` thousandths of a tile, stopping at the wall,
 * and say how far it went.
 */
export function mazeShakeBy(cfg: SimConfig, m: MazeState, dx: number, dy: number): number {
  const free = mazeShakeFreeMilli(cfg, m);
  const cap = (v: number): number => Math.max(-STEP_CAP, Math.min(STEP_CAP, v));
  let x = m.gripXMilli + cap(dx);
  let y = m.gripYMilli + cap(dy);
  const far = x * x + y * y;
  if (far > free * free) {
    const len = isqrt(far);
    x = Math.trunc((x * free) / len);
    y = Math.trunc((y * free) / len);
  }
  const mx = x - m.gripXMilli;
  const my = y - m.gripYMilli;
  m.gripXMilli = x;
  m.gripYMilli = y;
  return isqrt(mx * mx + my * my);
}
