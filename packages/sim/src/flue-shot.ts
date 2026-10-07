import { flueBoss, flueLitLevel, flueMissWhy, flueOver } from "./flue.js";
import { flueMet, flueSpentShot } from "./flue-step.js";
import type { Bullet } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **THE FLUE's shot**, met on the flue's row.
 *
 * A bolt climbing its column and the beam burning one are both asked here,
 * beside the bodies and pods in the same sweep (`boss-along.ts`), and **every
 * shot stops on the flue**: it lies across the whole field, so nothing climbs
 * past it. That is where it is judged, the instant it gets there, so the pair
 * sees the verdict on the shot rather than a beat later off the top. While a
 * level is lit: over the ember, the level's weapon in its colour meets it,
 * and the other weapon or the other colour spends a shot, the ember refusing
 * it; anywhere else it is wide and spends one too. Between levels the flue
 * takes a shot and nothing comes of it.
 */

/** Where the flue stands across this sweep of the shot's column, in thousandths of a row, or -1. */
export function flueAlong(world: World, _bullet: Bullet, from: number, to: number): number {
  if (flueBoss(world) === null) return -1;
  const at = world.cfg.flueRow * MILLI;
  return from < at || at < to ? -1 : at;
}

/** The shot met the flue, once `flueAlong` said it would. */
export function flueStruckEmber(world: World, bullet: Bullet): void {
  const s = flueBoss(world);
  const level = s === null ? null : flueLitLevel(s);
  if (s === null || level === null) return;
  if (!flueOver(world.cfg, s, bullet.col)) {
    flueSpentShot(world, s, bullet.col, "wide");
    return;
  }
  const why = flueMissWhy(level, bullet);
  if (why === null) flueMet(world, s, level, bullet.col);
  else flueSpentShot(world, s, bullet.col, why);
}

/**
 * A shot past the top of the field: none gets there while the flue is up,
 * but one that did would be **taken**, so it is never a wasted one on HARD
 * (`shot-out.ts`) — the sky is the flue's.
 */
export function flueStruck(world: World, _bullet: Bullet): boolean {
  return flueBoss(world) !== null;
}
