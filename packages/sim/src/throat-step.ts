import { hullRow } from "./config.js";
import { type ThroatState, throatAimAt, throatEvertBeatsLeft, throatHomeCol } from "./throat.js";
import type { World } from "./world.js";

/**
 * **THE THROAT's beat**, and how little of the fight is on it.
 *
 * The suck runs on the tick (`throat-suck.ts`) and the hands are heard on the
 * tick (`throat-hand.ts`), because a mouth carried by a thumb and a pump
 * worked by one are both continuous: a body is swallowed the moment it is in
 * the circle, not on the next beat after. What is left for the beat is the
 * eversion's clock, which is counted in beats because THE SLOW is.
 */

/**
 * Install it from the wave's own `boss:` entry. There is nothing to author:
 * the mouth starts over the middle column three rows above the hull, red, and
 * not pumped at all.
 */
export function installThroat(world: World): ThroatState {
  const cfg = world.cfg;
  const b: ThroatState = {
    kind: "throat",
    phase: "sucks",
    phaseBeat: world.beat,
    slack: 0,
    fedBeat: -1,
    refusedTick: -1,
    refusedId: -1,
    aimXMilli: 0,
    aimYMilli: 0,
    aimFromXMilli: -1,
    aimFromYMilli: -1,
    mode: "red",
    pumpDir: 0,
    pumpFromYMilli: 0,
    pumpMilli: 0,
  };
  throatAimAt(cfg, b, throatHomeCol(cfg) * 1000, (hullRow(cfg) - 3) * 1000);
  return b;
}

/** One beat of the gullet: only the eversion's end. */
export function stepThroat(world: World, b: ThroatState): void {
  if (b.phase !== "everts") return;
  // The tube is through its own mouth and so is the boss. Nulled here rather
  // than on the last swallow, so the picture has the whole eversion to run
  // before the wave is allowed to end under it (`bossHoldsWave`).
  if (throatEvertBeatsLeft(world.cfg, b, world.beat) <= 0) world.boss = null;
}
