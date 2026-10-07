import type { SimConfig } from "./config.js";
import type { CoreVerdict } from "./core-verdict.js";
import { type HaspState, haspBoss, haspLoose, NO_BOLT } from "./hasp.js";
import { sparkFallMilli, sparkFuseTicks, sparkMeets } from "./spark-fall.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE HASP's one target**: the bolt the second hasp's spring throws loose
 * (§20, row 7).
 *
 * Its own file beside `hasp-step.ts` because next door is the fight's clock,
 * and this happens where a bolt leaves the top of the field. The hasps
 * themselves are rock grey and none of them is ever shot: the cannon has one
 * thing to do in this whole wave and the shield has none at all, which is what
 * makes the one thing worth keeping on the band.
 *
 * **Either colour.** The design says *their own colour* and both of them
 * are: a loose bolt is not a body whose colour the pair could have got
 * wrong, so nothing here is billed to the colour balance. What it costs to
 * miss is a hull strike, which is the wave.
 *
 * What it says of a bolt is `haspVerdict`, which the picture asks too
 * (`render/hasp-stop.ts`).
 */
export function haspStruck(world: World, bullet: Bullet): boolean {
  const s = haspBoss(world);
  if (s === null || haspVerdict(world, bullet.col, bullet.color) === null) return false;
  const rowMilli = haspBoltNowMilli(world, s);
  s.boltCol = NO_BOLT;
  world.events.push({ type: "haspBoltOut", col: bullet.col, rowMilli });
  return true;
}

/**
 * What a bolt in `col` meets of the loose bolt (`core-verdict.ts`'s words):
 * the bolt in its own column while it falls, in either colour, and nothing
 * anywhere else — the clasps are never judged.
 */
export function haspVerdict(world: World, col: number, _color: Color): CoreVerdict {
  const s = haspBoss(world);
  return s !== null && haspLoose(s) && col === s.boltCol ? "target" : null;
}

/** Where the loose bolt falls from: under the second clasp's hub. */
export const HASP_BOLT_FROM_MILLI = 5520;

/** The loose bolt's centre `fuseTicks` after it was thrown, falling to the hull (`spark-fall.ts`). */
export function haspBoltMilli(cfg: SimConfig, fuseTicks: number): number {
  return sparkFallMilli(cfg, HASP_BOLT_FROM_MILLI, cfg.haspBoltBeats, fuseTicks);
}

/** The loose bolt's centre on this tick, or `back` ticks before it. */
export function haspBoltNowMilli(world: World, s: HaspState, back = 0): number {
  return Math.floor(haspBoltMilli(world.cfg, sparkFuseTicks(world, s.boltBeat, world.tick) - back));
}

/**
 * Where a shot in its column sweeping from `from` to `to` meets the loose
 * bolt, or -1 — asked in `boss-along.ts`, so it is knocked out where it is
 * drawn knocked out rather than when the shot leaves the top of the field.
 */
export function haspBoltAlong(world: World, b: Bullet, from: number, to: number): number {
  const s = haspBoss(world);
  if (s === null || haspVerdict(world, b.col, b.color) === null) return -1;
  return sparkMeets(haspBoltNowMilli(world, s), haspBoltNowMilli(world, s, 1), from, to);
}
