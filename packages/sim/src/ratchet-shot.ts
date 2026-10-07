import type { SimConfig } from "./config.js";
import type { CoreVerdict } from "./core-verdict.js";
import { NO_BOLT, type RatchetState, ratchetBoss, ratchetLoose } from "./ratchet.js";
import { sparkFallMilli, sparkFuseTicks, sparkMeets } from "./spark-fall.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE RATCHET's one target**: the bolt the second clean advance shakes
 * loose (§22, row 8). `hasp-shot.ts`' shape and argument — the rack is rock
 * grey and never shot, and **either colour** takes the bolt, because a loose
 * bolt is not a body whose colour the pair could have got wrong.
 *
 * What it says of a bolt is `ratchetVerdict`, which the picture asks too
 * (`render/ratchet-stop.ts`).
 */
export function ratchetStruck(world: World, bullet: Bullet): boolean {
  const s = ratchetBoss(world);
  if (s === null || ratchetVerdict(world, bullet.col, bullet.color) === null) return false;
  const rowMilli = ratchetBoltNowMilli(world, s);
  s.boltCol = NO_BOLT;
  world.events.push({ type: "ratchetBoltOut", col: bullet.col, rowMilli });
  return true;
}

/**
 * What a bolt in `col` meets of the loose bolt (`core-verdict.ts`'s words):
 * the bolt in its own column while it falls, in either colour, and nothing
 * anywhere else — the rack is never judged.
 */
export function ratchetVerdict(world: World, col: number, _color: Color): CoreVerdict {
  const s = ratchetBoss(world);
  return s !== null && ratchetLoose(s) && col === s.boltCol ? "target" : null;
}

/** Where the loose bolt falls from: under the lock at the top of the strut. */
export const RATCHET_BOLT_FROM_MILLI = 470;

/** The loose bolt's centre `fuseTicks` after it was thrown, falling to the hull (`spark-fall.ts`). */
export function ratchetBoltMilli(cfg: SimConfig, fuseTicks: number): number {
  return sparkFallMilli(cfg, RATCHET_BOLT_FROM_MILLI, cfg.ratchetBoltBeats, fuseTicks);
}

/** The loose bolt's centre on this tick, or `back` ticks before it. */
export function ratchetBoltNowMilli(world: World, s: RatchetState, back = 0): number {
  return Math.floor(
    ratchetBoltMilli(world.cfg, sparkFuseTicks(world, s.boltBeat, world.tick) - back),
  );
}

/**
 * Where a shot in its column sweeping from `from` to `to` meets the loose
 * bolt, or -1 — asked in `boss-along.ts`, so it is knocked out where it is
 * drawn knocked out rather than when the shot leaves the top of the field.
 */
export function ratchetBoltAlong(world: World, b: Bullet, from: number, to: number): number {
  const s = ratchetBoss(world);
  if (s === null || ratchetVerdict(world, b.col, b.color) === null) return -1;
  return sparkMeets(ratchetBoltNowMilli(world, s), ratchetBoltNowMilli(world, s, 1), from, to);
}
