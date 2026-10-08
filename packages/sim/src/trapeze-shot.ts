import {
  trapezeBoss,
  trapezeHeading,
  trapezeInward,
  trapezeLitStep,
  trapezeLocked,
  trapezeSeat,
  trapezeShooting,
} from "./trapeze.js";
import { trapezeCol, trapezeShove } from "./trapeze-step.js";
import type { Bullet } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **THE TRAPEZE's shots**: a bolt meets the alien where it sits, in mid-field
 * (`boss-along.ts`), and pushes the swing — in a `shoot` or a `lock` level
 * only; in a swipe level a bolt flies past.
 *
 * **From below** (`shoot`), the rule a swipe has: a hit while the swing comes
 * back toward the middle pushes it higher, a hit while it goes out slows it.
 * **From the side** (`lock`), a bolt the lock has steered round the corner
 * (`lock.ts`) pushes the alien away from the cannon: higher if the swing is
 * already going that way, slower if not. In a `lock` level only a bolt from
 * the side hits; one straight up from under it flies past, so the lock is
 * the level's whole point.
 *
 * Any colour does. A shot here is a shove, not a kill, so HARD's wasted shot
 * is not asked of it either (`shot-wasted.ts`).
 */

/** Where a bolt sweeping from `from` to `to` meets the alien, thousandths of a row, or -1. */
export function trapezeAlong(world: World, b: Bullet, from: number, to: number): number {
  const s = trapezeBoss(world);
  if (s === null || !trapezeShooting(s) || b.lance) return -1;
  if (trapezeLitStep(s)?.ask === "lock" && b.aimMilli === 0) return -1;
  const cfg = world.cfg;
  const seat = trapezeSeat(cfg, s);
  const reach = cfg.trapezeHitMilli;
  if (Math.abs(b.col * MILLI + b.driftMilli - seat.xMilli) > reach) return -1;
  const near = seat.yMilli + reach;
  const far = seat.yMilli - reach;
  if (to > near || from < far) return -1;
  return Math.min(from, near);
}

/** The bolt met the alien: the swing pushed or slowed, and the lock spent. */
export function trapezeStruck(world: World, b: Bullet): void {
  const s = trapezeBoss(world);
  if (s === null) return;
  const cfg = world.cfg;
  const side = b.aimMilli !== 0;
  const gain = side ? Math.sign(b.aimMilli) === trapezeHeading(cfg, s) : trapezeInward(cfg, s);
  trapezeShove(world, s, gain, false);
  s.lockBeats = 0;
  world.events.push({ type: "trapezeShot", gain, side, col: trapezeCol(world, s) });
}

/**
 * What a locked bolt is steered at (`lock.ts`): the alien's row and column,
 * while the pilot's tap holds the lock.
 */
export function trapezeAim(world: World): { milli: number; lane: number } | null {
  const s = trapezeBoss(world);
  if (s === null || !trapezeLocked(s)) return null;
  const seat = trapezeSeat(world.cfg, s);
  return { milli: seat.yMilli, lane: Math.round(seat.xMilli / MILLI) };
}
